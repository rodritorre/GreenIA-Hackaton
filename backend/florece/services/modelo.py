"""Forecast model v0 and the state engine (spec §6.4, PRED-1…PRED-3, PRIN-2.2).

What it does, per destination:

1. Current state: from the latest satellite colour index of its zones (mean over zones with data),
   or, without satellite data, from the phase windows on today's date.
2. Phase windows:
   - Windows imported from the organisers ("dato_proporcionado") are published as they are.
   - Otherwise, if this season's index curve has enough points, a logistic curve is fitted and the
     date each threshold is crossed becomes the window centre; the margin grows with the distance
     to that date. This is also what produces the forecast band on the chart.
   - Otherwise, the baseline: usual date ± historical spread ("fecha habitual ± desviación").
3. Comparison of our model against the provided forecast (PRED-4), shown in the admin panel.

The module is deliberately small and replaceable: `recalcular()` is the only entry point used by
jobs and endpoints.
"""
from __future__ import annotations

import math
from dataclasses import dataclass
from datetime import date, datetime, timedelta

import numpy as np
from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from .. import models as m
from ..db import now
from .fenologia import FASES_ACTIVAS, confianza_de_probabilidad, estado_en, fase_por_indice

MODELO = 'Modelo Cuándo Florece v0'
CALENDARIO = 'Fechas habituales (línea base)'
TEMPORADA_DIAS = 120
TECHO = 0.93


@dataclass
class Ajuste:
    lo: float
    mid: float  # days since origin
    k: float
    origen: date
    rmse: float

    def valor(self, t: float) -> float:
        return self.lo + (TECHO - self.lo) / (1 + math.exp(-(t - self.mid) / self.k))

    def cruce(self, u: float) -> date | None:
        if not (self.lo < u < TECHO):
            return None
        t = self.mid - self.k * math.log((TECHO - self.lo) / (u - self.lo) - 1)
        return self.origen + timedelta(days=round(t))


def ajustar_logistica(puntos: list[tuple[date, float]]) -> Ajuste | None:
    """Least-squares grid search for a rising logistic curve. Needs ≥ 6 valid points and visible rise."""
    if len(puntos) < 6:
        return None
    origen = puntos[0][0]
    t = np.array([(f - origen).days for f, _ in puntos], dtype=float)
    y = np.array([v for _, v in puntos], dtype=float)
    if y.max() - y.min() < 0.1:
        return None
    lo = float(np.percentile(y, 10))
    best = None
    for mid in np.arange(t.min() - 20, t.max() + 60, 0.5):
        for k in np.arange(2, 16, 0.5):
            pred = lo + (TECHO - lo) / (1 + np.exp(-(t - mid) / k))
            err = float(np.mean((pred - y) ** 2))
            if best is None or err < best[0]:
                best = (err, mid, k)
    err, mid, k = best
    return Ajuste(lo=lo, mid=float(mid), k=float(k), origen=origen, rmse=math.sqrt(err))


def _fecha_md(year: int, mmdd: str) -> date:
    return date(year, int(mmdd[:2]), int(mmdd[3:]))


def _serie_temporada(db: Session, d: m.Destino, hoy: date) -> list[tuple[date, float]]:
    q = (
        select(m.ObservacionIndice.fecha, func.avg(m.ObservacionIndice.valor))
        .join(m.Zona, m.Zona.id == m.ObservacionIndice.zona_id)
        .where(m.Zona.destino_id == d.id, m.ObservacionIndice.valor.is_not(None),
               m.ObservacionIndice.fecha > hoy - timedelta(days=TEMPORADA_DIAS), m.ObservacionIndice.fecha <= hoy)
        .group_by(m.ObservacionIndice.fecha)
        .order_by(m.ObservacionIndice.fecha)
    )
    return [(f, float(v)) for f, v in db.execute(q)]


def _anio_temporada(habituales: dict[str, m.FechaHabitual], hoy: date) -> int:
    """The season to forecast: this year's if it hasn't ended yet, else next year's."""
    fin = habituales.get('final') or list(habituales.values())[-1]
    return hoy.year if _fecha_md(hoy.year, fin.rango_max) >= hoy else hoy.year + 1


def _ventana(d: m.Destino, fase: str, desde: date, hasta: date, tipo: str, prob: float, metodo: str, fuente: str,
             generada: datetime) -> m.VentanaFase:
    return m.VentanaFase(destino_id=d.id, fase=fase, desde=desde, hasta=hasta, tipo_dato=tipo,
                         confianza=confianza_de_probabilidad(prob), probabilidad=prob, metodo=metodo, fuente=fuente,
                         generada_en=generada, vigente=True)


def _ventanas_modelo(d: m.Destino, serie: list[tuple[date, float]], habituales: dict[str, m.FechaHabitual],
                     hoy: date, generada: datetime) -> tuple[list[m.VentanaFase], Ajuste | None]:
    ajuste = ajustar_logistica(serie)
    out: list[m.VentanaFase] = []
    if ajuste:
        ultimo = serie[-1][1]
        for fase in ('inicio', 'avance', 'pleno'):
            u = d.umbrales[fase]
            cruce = ajuste.cruce(u)
            if cruce is None:
                continue
            if ultimo >= u:
                # Already reached: report the observed crossing (satellite estimate)
                obs = next((f for f, v in serie if v >= u), cruce)
                out.append(_ventana(d, fase, obs - timedelta(days=1), obs + timedelta(days=2), 'estimado', 0.9,
                                    'satelite', 'Copernicus Sentinel-2 (estimación)', generada))
            else:
                ahead = max(0, (cruce - hoy).days)
                half = 2 + round(0.25 * ahead + ajuste.rmse * 20)
                prob = 0.85 if ahead <= 7 else 0.8 if ahead <= 21 else 0.7
                out.append(_ventana(d, fase, cruce - timedelta(days=half), cruce + timedelta(days=half), 'previsto',
                                    prob, 'modelo_v0', MODELO, generada))
    # Phases not covered by the curve fall back on the usual dates
    year = _anio_temporada(habituales, hoy)
    for fase in FASES_ACTIVAS:
        if any(v.fase == fase for v in out) or fase not in habituales:
            continue
        h = habituales[fase]
        out.append(_ventana(d, fase, _fecha_md(year, h.rango_min), _fecha_md(year, h.rango_max), 'previsto', 0.7,
                            'modelo_v0', CALENDARIO, generada))
    return out, ajuste


def _guardar_banda(db: Session, d: m.Destino, ajuste: Ajuste | None, hoy: date, generada: datetime) -> None:
    db.execute(delete(m.SeriePrevision).where(m.SeriePrevision.destino_id == d.id))
    if not ajuste:
        return
    for i in range(1, 27):
        f = hoy + timedelta(days=i)
        t = (f - ajuste.origen).days
        p50 = ajuste.valor(t)
        if f > d.fin_temporada:
            break
        spread = 0.03 + 0.006 * i + ajuste.rmse
        db.add(m.SeriePrevision(destino_id=d.id, fecha=f, p50=round(p50, 3), p10=round(max(0, p50 - spread), 3),
                                p90=round(min(1, p50 + spread), 3), generada_en=generada))


def _estado_actual(db: Session, d: m.Destino, serie: list[tuple[date, float]], ventanas: list[m.VentanaFase],
                   hoy: date, generada: datetime) -> None:
    estado = db.get(m.EstadoActual, d.id)
    reciente = [v for f, v in serie if (hoy - f).days <= 10]
    if reciente:
        valor = serie[-1][1]
        pico = max(v for _, v in serie)
        en_descenso = pico >= d.umbrales['pleno'] and valor < pico - 0.08
        fase = fase_por_indice(valor, d.umbrales, en_descenso) or 'fuera_temporada'
        n_zonas = len(d.zonas)
        con_dato = db.scalar(
            select(func.count(func.distinct(m.ObservacionIndice.zona_id)))
            .join(m.Zona, m.Zona.id == m.ObservacionIndice.zona_id)
            .where(m.Zona.destino_id == d.id, m.ObservacionIndice.fecha == serie[-1][0], m.ObservacionIndice.valor.is_not(None))
        )
        resumen = f'Índice medio {valor:.2f} el {serie[-1][0]:%d/%m} ({con_dato} de {n_zonas} zonas con dato).'
        valores = dict(fase=fase, tipo_dato='estimado', fuente='Copernicus Sentinel-2 (estimación)', resumen=resumen)
    else:
        e = estado_en(ventanas, d.fin_temporada, None, hoy, hoy)
        valores = dict(fase=e.fase, tipo_dato='previsto', fuente=CALENDARIO if e.fase == 'fuera_temporada' else MODELO,
                       resumen='' if not estado else estado.resumen)
        if estado and estado.fase == e.fase and estado.tipo_dato in ('observado', 'estimado'):
            return  # keep a richer observed state (e.g. imported) while it agrees with the calendar
    if estado is None:
        estado = m.EstadoActual(destino_id=d.id)
        db.add(estado)
    for k, v in valores.items():
        setattr(estado, k, v)
    estado.actualizado_en = generada


def recalcular(db: Session, d: m.Destino, hoy: date) -> dict:
    """Recompute state, windows, forecast band and model comparison for one destination."""
    generada = now()
    habituales = {h.fase: h for h in db.scalars(select(m.FechaHabitual).where(m.FechaHabitual.destino_id == d.id))}
    serie = _serie_temporada(db, d, hoy)
    vigentes = db.scalars(select(m.VentanaFase).where(m.VentanaFase.destino_id == d.id, m.VentanaFase.vigente.is_(True))).all()
    proporcionadas = [v for v in vigentes if v.metodo == 'dato_proporcionado']

    propias, ajuste = _ventanas_modelo(d, serie, habituales, hoy, generada) if habituales else ([], None)

    # Publish: provided windows win, our model fills the phases they don't cover (and past phases seen by satellite)
    fases_prov = {v.fase for v in proporcionadas}
    publicar = [v for v in propias if v.fase not in fases_prov or v.tipo_dato == 'estimado']
    for v in vigentes:
        if v.metodo != 'dato_proporcionado' or v.fase in {p.fase for p in publicar}:
            v.vigente = False
    db.add_all(publicar)
    ventanas = [v for v in proporcionadas if v.fase not in {p.fase for p in publicar}] + publicar

    _guardar_banda(db, d, ajuste, hoy, generada)
    _estado_actual(db, d, serie, ventanas, hoy, generada)

    # Model vs provided forecast (PRED-4). MAE/coverage need held-out seasons: left empty until we have them.
    db.execute(delete(m.ComparativaModelo).where(m.ComparativaModelo.destino_id == d.id))
    for p in proporcionadas:
        mia = next((v for v in propias if v.fase == p.fase and v.tipo_dato == 'previsto'), None)
        if not mia:
            continue
        delta = ((mia.desde - p.desde).days + (mia.hasta - p.hasta).days) / 2
        db.add(m.ComparativaModelo(
            destino_id=d.id, fase=p.fase, proporcionada_desde=p.desde, proporcionada_hasta=p.hasta,
            propia_desde=mia.desde, propia_hasta=mia.hasta, propia_probabilidad=mia.probabilidad,
            mae_dias=None, cobertura=None,
            explicacion=_explicar(delta, mia.fuente),
            calculada_en=generada,
        ))

    if serie:
        d.entradas_hasta = serie[-1][0]
    d.generada_en = generada
    return {'destino': d.id, 'ventanas': len(publicar), 'ajuste': bool(ajuste), 'puntos': len(serie)}


def _explicar(delta: float, fuente: str) -> str:
    if fuente == CALENDARIO:
        return 'Sin curva de esta temporada todavía: nuestro modelo usa las fechas habituales.'
    if abs(delta) < 1:
        return 'La curva de color de esta temporada coincide con la previsión proporcionada.'
    sentido = 'después' if delta > 0 else 'antes'
    return f'La curva de color de esta temporada apunta a unos {abs(delta):.0f} días {sentido} que la previsión proporcionada.'


def recalcular_todo(db: Session, hoy: date) -> list[dict]:
    out = [recalcular(db, d, hoy) for d in db.scalars(select(m.Destino).where(m.Destino.activo.is_(True)))]
    db.commit()
    return out
