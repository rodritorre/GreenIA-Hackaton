"""Daily ingestion: AEMET → Sentinel-2 → recompute forecasts. Same code for cron, admin button and CLI (PRIN-2.5, ARQ-3).

A failing source never stops the run: its last valid data stays, the source is flagged as stale and
the problem is written to the log (PRIN-2.3, NFR-4).
"""
from __future__ import annotations

import logging
from datetime import timedelta

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from ... import models as m
from ...config import get_settings
from ...db import now, today
from .. import modelo
from . import aemet, sentinel

log = logging.getLogger('florece.ingesta')


class Registro:
    def __init__(self, db: Session, ejecucion: m.IngestaEjecucion):
        self.db, self.ej, self.avisos, self.errores = db, ejecucion, 0, 0

    def __call__(self, nivel: str, mensaje: str) -> None:
        getattr(log, {'warn': 'warning'}.get(nivel, nivel))(mensaje)
        self.db.add(m.IngestaLog(ejecucion_id=self.ej.id, hora=now(), nivel=nivel, mensaje=mensaje))
        self.db.commit()
        if nivel == 'warn':
            self.avisos += 1
        if nivel == 'error':
            self.errores += 1


def _fuente(db: Session, id_: str, estado: str, detalle: str, cargado: bool) -> None:
    f = db.get(m.FuenteEstado, id_)
    if f is None:
        return
    f.estado, f.detalle = estado, detalle
    if cargado:
        f.ultima_carga = now()
    db.commit()


def _aemet(db: Session, reg: Registro) -> None:
    s = get_settings()
    destinos = db.scalars(select(m.Destino).where(m.Destino.activo.is_(True))).all()
    configurados = [d for d in destinos if d.aemet_estacion or d.aemet_municipio]
    if not s.aemet_api_key:
        reg('warn', 'AEMET: sin clave de API (FLORECE_AEMET_API_KEY). Se mantienen los últimos datos.')
        _fuente(db, 'aemet', 'desactualizado', 'Falta la clave de API de AEMET.', False)
        return
    if not configurados:
        reg('warn', 'AEMET: ningún destino tiene estación o municipio configurado.')
        return
    hoy = today()
    filas, fallos = 0, []
    with aemet.cliente() as c:
        for d in configurados:
            try:
                datos = []
                if d.aemet_estacion:
                    desde, hasta = aemet.ventana_observaciones(hoy)
                    datos += [dict(r, previsto=False, fuente=aemet.FUENTE_OBS, estacion=d.aemet_estacion)
                              for r in aemet.observaciones(c, d.aemet_estacion, desde, hasta)]
                if d.aemet_municipio:
                    datos += [dict(r, previsto=True, fuente=aemet.FUENTE_PREV, estacion=None)
                              for r in aemet.prevision(c, d.aemet_municipio)]
                for r in datos:
                    stmt = insert(m.ObservacionMeteo).values(destino_id=d.id, ingestado_en=now(), **r)
                    db.execute(stmt.on_conflict_do_update(
                        index_elements=['destino_id', 'fecha', 'fuente'],
                        set_={k: stmt.excluded[k] for k in ('t_max', 't_min', 'precip', 'ingestado_en')}))
                db.commit()
                filas += len(datos)
            except Exception as e:  # noqa: BLE001 — one destination failing must not stop the others
                db.rollback()
                fallos.append(d.nombre)
                reg('error', f'AEMET {d.nombre}: {e}')
    reg('info', f'AEMET: {filas} valores de {len(configurados) - len(fallos)} destinos')
    _fuente(db, 'aemet', 'error' if fallos and not filas else 'desactualizado' if fallos else 'ok',
            f'Fallaron: {", ".join(fallos)}' if fallos else 'Máximas observadas y previstas a 7 días.', bool(filas))


def _sentinel(db: Session, reg: Registro) -> None:
    s = get_settings()
    hoy = today()
    destinos = db.scalars(select(m.Destino).where(m.Destino.activo.is_(True), m.Destino.usa_satelite.is_(True))).all()
    if not destinos:
        reg('info', 'Sentinel-2: ningún destino con satélite activado')
        return
    nuevas, nubes, fallos = 0, 0, []
    for d in destinos:
        try:
            esc = sentinel.escenas(d.lat, d.lon, hoy - timedelta(days=s.sentinel_lookback_days), hoy)
            for e in esc:
                for z in d.zonas:
                    ya = db.scalar(select(m.ObservacionIndice.id).where(
                        m.ObservacionIndice.zona_id == z.id, m.ObservacionIndice.fecha == e.fecha,
                        m.ObservacionIndice.fuente == sentinel.FUENTE))
                    if ya:
                        continue
                    valor, calidad = sentinel.indice_zona(e, z.lat, z.lon, z.radio_m, d.calibracion)
                    db.add(m.ObservacionIndice(zona_id=z.id, fecha=e.fecha, valor=valor, calidad=calidad,
                                               fuente=sentinel.FUENTE, escena=e.id, ingestado_en=now()))
                    nuevas += 1
                    nubes += calidad != 'ok'
                db.commit()
        except Exception as e:  # noqa: BLE001
            db.rollback()
            fallos.append(d.nombre)
            reg('error', f'Sentinel-2 {d.nombre}: {e}')
    if nubes:
        reg('warn', f'Sentinel-2: {nubes} lecturas de zona con nubes → "sin dato" (no se interpola)')
    reg('info', f'Sentinel-2: {nuevas} lecturas nuevas de zona')
    _fuente(db, 'sentinel', 'error' if fallos and not nuevas else 'desactualizado' if (fallos or nubes) else 'ok',
            f'Fallaron: {", ".join(fallos)}' if fallos else (f'{nubes} lecturas con nubes; se mantiene el último dato válido.'
                                                             if nubes else 'Índice de color por zona.'), bool(nuevas))


def ejecutar(db: Session, origen: str = 'cli', fuentes: tuple[str, ...] = ('aemet', 'sentinel')) -> m.IngestaEjecucion:
    ej = m.IngestaEjecucion(origen=origen, iniciada_en=now(), estado='en_curso')
    db.add(ej)
    db.commit()
    reg = Registro(db, ej)
    reg('info', f'Inicio de la ingesta ({origen})')
    if 'aemet' in fuentes:
        _aemet(db, reg)
    if 'sentinel' in fuentes:
        _sentinel(db, reg)
    try:
        res = modelo.recalcular_todo(db, today())
        reg('info', f'Previsiones recalculadas: {len(res)} destinos')
    except Exception as e:  # noqa: BLE001
        db.rollback()
        reg('error', f'Recalcular previsiones: {e}')
    ej.terminada_en = now()
    ej.estado = 'error' if reg.errores and reg.errores >= len(fuentes) else 'parcial' if (reg.errores or reg.avisos) else 'ok'
    db.commit()
    return ej
