"""Import of the organisers' datasets (DAT-1…DAT-5, DATA-1…DATA-6).

The exact delivery format is still an open question (§15.1), so we define simple CSV layouts
(UTF-8, comma or semicolon, header row). The raw file is stored untouched next to its provenance
(DATA-2, DATA-5); values are validated (DATA-6) and normalised (ISO dates, °C, 0–1 index; DATA-3).

  indice        fecha,zona,indice[,calidad]           colour index per zone and day (empty = no data)
  temperaturas  fecha,t_max[,t_min,estacion]          daily max temperature
  habituales    fase,tipica,rango_min,rango_max       usual dates, MM-DD
  prevision     fase,desde,hasta,probabilidad         current forecast with its range (DAT-4)
"""
from __future__ import annotations

import csv
import hashlib
import io
from datetime import date

from sqlalchemy import delete, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from .. import models as m
from ..config import get_settings
from ..db import now
from .fenologia import FASES_ACTIVAS, confianza_de_probabilidad

DATASETS = ('indice', 'temperaturas', 'habituales', 'prevision')
FUENTE = 'Datos proporcionados por Greenia'


class ErrorImportacion(ValueError):
    pass


def _filas(contenido: bytes) -> list[dict[str, str]]:
    texto = contenido.decode('utf-8-sig')
    dialecto = csv.Sniffer().sniff(texto.splitlines()[0], delimiters=',;\t')
    return [{k.strip().lower(): (v or '').strip() for k, v in r.items()} for r in csv.DictReader(io.StringIO(texto), dialect=dialecto)]


def _num(v: str) -> float | None:
    return float(v.replace(',', '.')) if v not in ('', 'NA', 'NaN', 'null') else None


def _mmdd(v: str) -> str:
    if len(v) == 5 and v[2] == '-':
        return v
    return date.fromisoformat(v).strftime('%m-%d')


def importar(db: Session, destino: m.Destino, dataset: str, nombre: str, contenido: bytes, usuario: str | None) -> tuple[m.ArchivoCrudo, list[str]]:
    if dataset not in DATASETS:
        raise ErrorImportacion(f'Dataset desconocido: {dataset}. Usa uno de {", ".join(DATASETS)}')
    try:
        filas = _filas(contenido)
    except (UnicodeDecodeError, csv.Error) as e:
        raise ErrorImportacion(f'No se puede leer el CSV: {e}') from e
    if not filas:
        raise ErrorImportacion('El archivo no tiene filas')
    avisos: list[str] = []
    try:
        {'indice': _indice, 'temperaturas': _temperaturas, 'habituales': _habituales, 'prevision': _prevision}[dataset](db, destino, filas, avisos)
    except (KeyError, ValueError) as e:
        db.rollback()
        raise ErrorImportacion(f'Formato no válido ({e}). Revisa las columnas: {__doc__.split(dataset)[1].splitlines()[0].strip()}') from e

    sha = hashlib.sha256(contenido).hexdigest()
    carpeta = get_settings().raw_dir / destino.id / dataset
    carpeta.mkdir(parents=True, exist_ok=True)
    ruta = carpeta / f'{now():%Y%m%dT%H%M%S}_{sha[:8]}_{nombre}'
    ruta.write_bytes(contenido)
    arch = m.ArchivoCrudo(destino_id=destino.id, dataset=dataset, nombre=nombre, sha256=sha, ruta=str(ruta),
                          filas=len(filas), subido_en=now(), subido_por=usuario)
    db.add(arch)
    f = db.get(m.FuenteEstado, 'greenia')
    if f:
        f.ultima_carga, f.estado = now(), 'ok'
    db.commit()
    return arch, avisos


def _indice(db: Session, d: m.Destino, filas, avisos) -> None:
    zonas = {z.id: z for z in d.zonas} | {z.nombre.lower(): z for z in d.zonas}
    for i, r in enumerate(filas, 2):
        z = zonas.get(r['zona']) or zonas.get(r['zona'].lower())
        if z is None:
            avisos.append(f'Fila {i}: zona "{r["zona"]}" desconocida, ignorada')
            continue
        v = _num(r.get('indice', ''))
        if v is not None and not 0 <= v <= 1:
            avisos.append(f'Fila {i}: índice {v} fuera de 0–1, guardado como sin dato')
            v = None
        calidad = r.get('calidad') or ('ok' if v is not None else 'sin_dato')
        stmt = insert(m.ObservacionIndice).values(zona_id=z.id, fecha=date.fromisoformat(r['fecha']), valor=v, calidad=calidad,
                                                   fuente=FUENTE, ingestado_en=now())
        db.execute(stmt.on_conflict_do_update(index_elements=['zona_id', 'fecha', 'fuente'],
                                              set_={'valor': stmt.excluded.valor, 'calidad': stmt.excluded.calidad,
                                                    'ingestado_en': stmt.excluded.ingestado_en}))


def _temperaturas(db: Session, d: m.Destino, filas, avisos) -> None:
    for i, r in enumerate(filas, 2):
        tmax = _num(r['t_max'])
        if tmax is not None and not -30 <= tmax <= 50:
            avisos.append(f'Fila {i}: t_max {tmax} °C fuera de rango, ignorada')
            continue
        stmt = insert(m.ObservacionMeteo).values(destino_id=d.id, fecha=date.fromisoformat(r['fecha']), t_max=tmax,
                                                  t_min=_num(r.get('t_min', '')), estacion=r.get('estacion') or None,
                                                  previsto=False, fuente=FUENTE, ingestado_en=now())
        db.execute(stmt.on_conflict_do_update(index_elements=['destino_id', 'fecha', 'fuente'],
                                              set_={'t_max': stmt.excluded.t_max, 't_min': stmt.excluded.t_min}))


def _habituales(db: Session, d: m.Destino, filas, avisos) -> None:
    db.execute(delete(m.FechaHabitual).where(m.FechaHabitual.destino_id == d.id))
    for r in filas:
        if r['fase'] not in FASES_ACTIVAS:
            raise ValueError(f'fase "{r["fase"]}"')
        db.add(m.FechaHabitual(destino_id=d.id, fase=r['fase'], tipica=_mmdd(r['tipica']), rango_min=_mmdd(r['rango_min']),
                               rango_max=_mmdd(r['rango_max'])))


def _prevision(db: Session, d: m.Destino, filas, avisos) -> None:
    generada = now()
    for v in db.scalars(select(m.VentanaFase).where(m.VentanaFase.destino_id == d.id, m.VentanaFase.vigente.is_(True),
                                                    m.VentanaFase.metodo == 'dato_proporcionado')):
        v.vigente = False
    for i, r in enumerate(filas, 2):
        if r['fase'] not in FASES_ACTIVAS:
            raise ValueError(f'fase "{r["fase"]}"')
        desde, hasta = date.fromisoformat(r['desde']), date.fromisoformat(r['hasta'])
        if hasta < desde:
            raise ValueError(f'fila {i}: hasta < desde')
        if desde == hasta:
            avisos.append(f'Fila {i}: previsión de un solo día; se publica igualmente como rango de 1 día')
        p = _num(r.get('probabilidad', '')) or 0.8
        p = p / 100 if p > 1 else p
        db.add(m.VentanaFase(destino_id=d.id, fase=r['fase'], desde=desde, hasta=hasta, tipo_dato='previsto',
                             confianza=confianza_de_probabilidad(p), probabilidad=p, metodo='dato_proporcionado',
                             fuente=FUENTE, generada_en=generada, vigente=True))
