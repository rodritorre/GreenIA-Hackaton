"""Citizen photo verification (EXT-2: CIT-1…CIT-7).

- Location and capture time come from the photo's EXIF (GPS + DateTimeOriginal); the device location
  sent by the browser is a fallback, and photos verified that way go to manual review.
- Accepted automatically: within FLORECE_PHOTO_MAX_KM of a zone (or the destination) and taken less than
  FLORECE_PHOTO_MAX_HOURS ago. Too far, too old or a duplicate: rejected. Missing GPS: pending review.
- Anti-abuse: daily limit per client (hashed IP), duplicate detection by SHA-256 and perceptual hash.
- Privacy: only a re-encoded copy without any metadata is stored (CIT-7).
"""
from __future__ import annotations

import hashlib
import io
from datetime import datetime, timedelta
from pathlib import Path

from PIL import ExifTags, Image, ImageOps
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .. import models as m
from .. import schemas as s
from ..config import get_settings
from ..db import now

GPS_IFD = 0x8825
EXIF_IFD = 0x8769


class LimiteSuperado(Exception):
    pass


def _rat(x) -> float:
    try:
        return float(x)
    except TypeError:
        return x[0] / x[1]


def leer_exif(img: Image.Image) -> tuple[float | None, float | None, datetime | None]:
    exif = img.getexif()
    lat = lon = None
    gps = exif.get_ifd(GPS_IFD)
    if gps:
        g = {ExifTags.GPSTAGS.get(k, k): v for k, v in gps.items()}
        try:
            def dms(v):
                return _rat(v[0]) + _rat(v[1]) / 60 + _rat(v[2]) / 3600

            lat = dms(g['GPSLatitude']) * (-1 if g.get('GPSLatitudeRef') == 'S' else 1)
            lon = dms(g['GPSLongitude']) * (-1 if g.get('GPSLongitudeRef') == 'W' else 1)
        except (KeyError, ZeroDivisionError, TypeError, IndexError):
            lat = lon = None
    cuando = None
    raw = exif.get_ifd(EXIF_IFD).get(36867) or exif.get(306)  # DateTimeOriginal, else DateTime
    if raw:
        try:
            cuando = datetime.strptime(str(raw).strip('\x00'), '%Y:%m:%d %H:%M:%S').replace(tzinfo=get_settings().tz)
        except ValueError:
            cuando = None
    return lat, lon, cuando


def ahash(img: Image.Image) -> str:
    small = img.convert('L').resize((8, 8), Image.Resampling.LANCZOS)
    px = list(small.get_flattened_data()) if hasattr(small, 'get_flattened_data') else list(small.getdata())
    avg = sum(px) / 64
    return f'{int("".join("1" if p > avg else "0" for p in px), 2):016x}'


def _cercana(db: Session, destino: m.Destino, lat: float, lon: float) -> tuple[float, m.Zona | None]:
    punto = func.ST_SetSRID(func.ST_MakePoint(lon, lat), 4326)
    if destino.zonas:
        row = db.execute(
            select(m.Zona, func.ST_Distance(m.Zona.geom, func.Geography(punto)))
            .where(m.Zona.destino_id == destino.id)
            .order_by(func.ST_Distance(m.Zona.geom, func.Geography(punto)))
            .limit(1)
        ).first()
        return row[1] / 1000, row[0]
    dist = db.scalar(select(func.ST_Distance(m.Destino.geom, func.Geography(punto))).where(m.Destino.id == destino.id))
    return dist / 1000, None


def recibir(db: Session, destino: m.Destino, contenido: bytes, fase: str, cliente: str,
            lat_dispositivo: float | None, lon_dispositivo: float | None) -> s.ObservacionResultado:
    cfg = get_settings()
    hoy0 = now().replace(hour=0, minute=0, second=0, microsecond=0)
    cliente_hash = hashlib.sha256(f'{cfg.secret_key}:{cliente}'.encode()).hexdigest()
    hechas = db.scalar(select(func.count()).select_from(m.ObservacionCiudadana)
                       .where(m.ObservacionCiudadana.cliente_hash == cliente_hash, m.ObservacionCiudadana.recibida_en >= hoy0))
    if hechas >= cfg.photo_daily_limit:
        raise LimiteSuperado()

    img = Image.open(io.BytesIO(contenido))
    img.load()
    lat, lon, capturada = leer_exif(img)
    de_exif = lat is not None
    if not de_exif and lat_dispositivo is not None and lon_dispositivo is not None:
        lat, lon = lat_dispositivo, lon_dispositivo

    sha = hashlib.sha256(contenido).hexdigest()
    ah = ahash(img)
    duplicada = db.scalar(select(func.count()).select_from(m.ObservacionCiudadana).where(
        (m.ObservacionCiudadana.foto_sha256 == sha)
        | ((m.ObservacionCiudadana.foto_ahash == ah) & (m.ObservacionCiudadana.destino_id == destino.id)))) > 0

    comp: list[s.Comprobacion] = []
    dist = zona = None
    if lat is not None and lon is not None:
        dist, zona = _cercana(db, destino, lat, lon)
        donde = zona.nombre if zona else destino.nombre
        comp.append(s.Comprobacion(clave='ubicacion', ok=dist <= cfg.photo_max_km,
                                   detalle=f'a {dist:.1f} km de {donde}'.replace('.', ',', 1) + ('' if de_exif else ' (ubicación del dispositivo)')))
    else:
        comp.append(s.Comprobacion(clave='ubicacion', ok=False, detalle='La foto no tiene ubicación'))
    horas = None
    if capturada:
        horas = (now() - capturada).total_seconds() / 3600
        comp.append(s.Comprobacion(clave='fecha', ok=-1 <= horas <= cfg.photo_max_hours, detalle=f'hecha hace {max(0, horas):.0f} h'))
    else:
        comp.append(s.Comprobacion(clave='fecha', ok=False, detalle='La foto no tiene fecha de captura'))
    comp.append(s.Comprobacion(clave='duplicada', ok=not duplicada, detalle='Foto ya enviada' if duplicada else 'Foto nueva'))

    if duplicada:
        estado, motivo = 'rechazada', 'duplicada'
    elif dist is not None and dist > cfg.photo_max_km:
        estado, motivo = 'rechazada', 'lejos'
    elif horas is not None and horas > cfg.photo_max_hours:
        estado, motivo = 'rechazada', 'antigua'
    elif not de_exif or capturada is None:
        estado, motivo = 'pendiente', 'sin_gps' if not de_exif else 'sin_fecha'
    else:
        estado, motivo = 'valida', None

    obs = m.ObservacionCiudadana(
        destino_id=destino.id, zona_id=zona.id if zona else None, zona_nombre=zona.nombre if zona else None,
        foto_sha256=sha, foto_ahash=ah, lat=lat, lon=lon,
        geom=f'SRID=4326;POINT({lon} {lat})' if lat is not None else None,
        capturada_en=capturada, recibida_en=now(), fase_reportada=fase, distancia_km=dist, horas=horas,
        estado=estado, motivo=motivo, cliente_hash=cliente_hash,
    )
    db.add(obs)
    db.flush()
    if estado != 'rechazada':
        obs.foto_ruta = str(_guardar_sin_metadatos(img, obs.id))
    db.commit()
    return s.ObservacionResultado(id=obs.id, estado=estado, motivo=motivo, comprobaciones=comp)


def _guardar_sin_metadatos(img: Image.Image, id_: int) -> Path:
    d = get_settings().uploads_dir
    d.mkdir(parents=True, exist_ok=True)
    limpia = ImageOps.exif_transpose(img).convert('RGB')
    limpia.thumbnail((1600, 1600))
    ruta = d / f'{id_}.jpg'
    limpia.save(ruta, 'JPEG', quality=85)  # a fresh JPEG carries no EXIF/GPS
    return ruta


def ventana_revision() -> timedelta:
    return timedelta(hours=get_settings().photo_max_hours)
