"""Public endpoints: what any website, app or partner can read (spec §9.1)."""
from __future__ import annotations

from datetime import date

from fastapi import APIRouter, File, Form, HTTPException, Query, Request, UploadFile, status
from fastapi.responses import FileResponse, HTMLResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models as m
from .. import schemas as s
from ..config import get_settings
from ..db import today
from ..services import alertas, consultas, fotos
from .deps import Db

router = APIRouter(tags=['público'])


def _destino(db: Session, id_: str) -> m.Destino:
    d = db.get(m.Destino, id_)
    if d is None or not d.activo:
        raise HTTPException(status.HTTP_404_NOT_FOUND, 'Destino no encontrado')
    return d


@router.get('/estado-datos', response_model=s.EstadoDatos, summary='Fecha de los datos y estado de cada fuente (UX-8)')
def estado_datos(db: Session = Db):
    return consultas.estado_datos(db, today())


@router.get('/destinos', response_model=list[s.DestinoResumen], summary='Destinos activos con estado actual y ventanas de fase')
def destinos(db: Session = Db):
    return consultas.lista_destinos(db)


@router.get('/destinos/{destino_id}', response_model=s.DestinoFicha,
            summary='Ficha completa: capa calculada, editorial y comercial en bloques separados')
def ficha(destino_id: str, idioma: str = Query('es', pattern='^(es|en)$'), db: Session = Db):
    return consultas.ficha(db, _destino(db, destino_id), idioma)


@router.get('/destinos/{destino_id}/serie', response_model=s.Serie, summary='Índice de color diario y temperaturas, con banda de previsión')
def serie(destino_id: str, desde: date | None = None, hasta: date | None = None, db: Session = Db):
    return consultas.serie(db, _destino(db, destino_id), desde, hasta)


@router.get('/destinos/{destino_id}/prevision', response_model=list[s.VentanaFase], summary='Rangos por fase con confianza, método y fuente')
def prevision(destino_id: str, db: Session = Db):
    _destino(db, destino_id)
    return consultas.resumen(db, _destino(db, destino_id)).ventanas


@router.get('/mapa', response_model=s.Mapa, summary='Estado observado (hoy) o previsto de todos los destinos en una fecha')
def mapa(fecha: date | None = None, db: Session = Db):
    hoy = today()
    return consultas.mapa(db, fecha or hoy, hoy)


@router.get('/ofertas', response_model=list[s.Oferta], summary='Alojamientos y actividades (capa comercial)')
def ofertas(destino_id: str | None = Query(None, alias='destinoId'), db: Session = Db):
    return consultas.ofertas(db, destino_id)


@router.get('/fotos', response_model=list[s.FotoPublica], summary='Fotos ciudadanas verificadas')
def fotos_publicas(destino_id: str | None = Query(None, alias='destinoId'), db: Session = Db):
    q = select(m.ObservacionCiudadana).where(m.ObservacionCiudadana.estado == 'valida')
    if destino_id:
        q = q.where(m.ObservacionCiudadana.destino_id == destino_id)
    return [consultas.foto_publica(f) for f in db.scalars(q.order_by(m.ObservacionCiudadana.capturada_en.desc()).limit(200))]


@router.get('/fotos/{foto_id}/imagen', response_class=FileResponse, summary='Imagen de una foto verificada (sin metadatos)')
def foto_imagen(foto_id: int, db: Session = Db):
    f = db.get(m.ObservacionCiudadana, foto_id)
    if f is None or f.estado != 'valida' or not f.foto_ruta:
        raise HTTPException(status.HTTP_404_NOT_FOUND, 'Foto no disponible')
    return FileResponse(f.foto_ruta, media_type='image/jpeg')


# ─── Writes from visitors ────────────────────────────────────────────────────
@router.post('/alertas', response_model=s.Mensaje, status_code=status.HTTP_202_ACCEPTED,
             summary='Suscribirse a un aviso (envía un email de confirmación: doble opt-in)')
def suscribir(body: s.AlertaIn, db: Session = Db):
    if not body.consentimiento:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, 'Hace falta el consentimiento')
    d = _destino(db, body.destino_id)
    alertas.suscribir(db, body.email, d, body.fase, body.antelacion_dias, body.idioma)
    db.commit()
    # Same answer whether or not the address was already subscribed (no account enumeration)
    return s.Mensaje(mensaje='Revisa tu correo para confirmar el aviso.')


def _pagina(titulo: str, texto: str) -> HTMLResponse:
    url = get_settings().public_url
    return HTMLResponse(f'<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width">'
                        f'<title>{titulo}</title><body style="font-family:system-ui;max-width:32rem;margin:4rem auto;padding:0 1rem">'
                        f'<h1>{titulo}</h1><p>{texto}</p><p><a href="{url}">Volver al mapa</a></p></body>')


@router.get('/alertas/confirmar', response_class=HTMLResponse, summary='Enlace del email de confirmación')
def confirmar(token: str, db: Session = Db):
    a = alertas.confirmar(db, token)
    db.commit()
    if a is None:
        return _pagina('Enlace no válido', 'Este enlace ha caducado o ya no existe.')
    return _pagina('Aviso confirmado', 'Te escribiremos cuando llegue el momento.')


@router.get('/alertas/baja', response_class=HTMLResponse, summary='Darse de baja desde el enlace del email')
@router.post('/alertas/baja', response_class=HTMLResponse, summary='Baja en un clic (RFC 8058, List-Unsubscribe-Post)',
             operation_id='baja_un_clic')
def baja(token: str, db: Session = Db):
    a = alertas.dar_de_baja(db, token)
    db.commit()
    if a is None:
        return _pagina('Enlace no válido', 'Este enlace ha caducado o ya no existe.')
    return _pagina('Te has dado de baja', 'No recibirás más avisos de este destino.')


@router.post('/observaciones', response_model=s.ObservacionResultado, status_code=status.HTTP_201_CREATED,
             summary='Subir una foto geolocalizada (verificación ciudadana)')
async def observacion(
    request: Request,
    foto: UploadFile = File(...),
    destino_id: str = Form(..., alias='destinoId'),
    fase: s.FaseActiva = Form(...),
    consentimiento: bool = Form(...),
    lat: float | None = Form(None),
    lon: float | None = Form(None),
    db: Session = Db,
):
    if not consentimiento:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, 'Hace falta el consentimiento')
    contenido = await foto.read(get_settings().photo_max_mb * 1024 * 1024 + 1)
    if len(contenido) > get_settings().photo_max_mb * 1024 * 1024:
        raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, 'La foto es demasiado grande')
    d = _destino(db, destino_id)
    cliente = request.headers.get('x-forwarded-for', '').split(',')[0].strip() or (request.client.host if request.client else '')
    try:
        return fotos.recibir(db, d, contenido, fase, cliente, lat, lon)
    except fotos.LimiteSuperado:
        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, 'Has llegado al límite de fotos por hoy') from None
    except OSError:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, 'El archivo no es una imagen válida') from None
