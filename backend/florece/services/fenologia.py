"""Phase logic shared by the API and the jobs.

- `fase_por_indice`: satellite colour index → phase, with per-destination thresholds (PHA-2, PHA-3).
- `estado_en`: what a destination shows on a given date: today's observed state, or the
  forecast phase for a future date with its confidence (MAP-6, MAP-7).
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta

from .. import models as m

FASES_ACTIVAS = ('inicio', 'avance', 'pleno', 'final')


def confianza_de_probabilidad(p: float) -> str:
    """Plain-language confidence used everywhere (see the "Cómo calculamos esto" page)."""
    if p >= 0.85:
        return 'alta'
    if p >= 0.75:
        return 'media'
    return 'baja'


def fase_por_indice(indice: float | None, umbrales: dict, en_descenso: bool = False) -> str | None:
    """Index thresholds for the rising part of the season; 'final' once the index falls back below
    its threshold after peak (leaf fall / blossom fading). None when there is no data (HON-4)."""
    if indice is None:
        return None
    if en_descenso and indice < umbrales['final']:
        return 'final'
    if indice >= umbrales['pleno']:
        return 'pleno'
    if indice >= umbrales['avance']:
        return 'avance'
    if indice >= umbrales['inicio']:
        return 'inicio'
    return 'fuera_temporada'


@dataclass
class EstadoEnFecha:
    fase: str
    tipo_dato: str
    confianza: str
    es_prevision: bool
    transicion: m.VentanaFase | None
    siguiente: m.VentanaFase | None


def _mid(v: m.VentanaFase) -> date:
    return v.desde + timedelta(days=round((v.hasta - v.desde).days / 2))


def estado_en(
    ventanas: list[m.VentanaFase],
    fin_temporada: date,
    actual: m.EstadoActual | None,
    hoy: date,
    fecha: date,
) -> EstadoEnFecha:
    ventanas = sorted(ventanas, key=lambda v: FASES_ACTIVAS.index(v.fase))
    siguiente = next((v for v in ventanas if v.desde > fecha), None)
    transicion = next((v for v in ventanas if v.desde <= fecha <= v.hasta and v.tipo_dato == 'previsto'), None)

    if fecha == hoy and actual is not None:
        v = next((w for w in ventanas if w.fase == actual.fase), None)
        conf = v.confianza if v and v.tipo_dato != 'previsto' else 'alta'
        return EstadoEnFecha(actual.fase, actual.tipo_dato, conf, False, None, siguiente)

    if fecha > fin_temporada:
        # Next season isn't forecast yet
        return EstadoEnFecha('fuera_temporada', 'previsto', 'media', True, None, None)

    pasadas = [v for v in ventanas if _mid(v) <= fecha]
    if not pasadas:
        conf = transicion.confianza if transicion else 'alta'
        return EstadoEnFecha('fuera_temporada', 'previsto', conf, fecha > hoy, transicion, siguiente)
    ultima = pasadas[-1]
    return EstadoEnFecha(
        ultima.fase,
        'previsto' if fecha > hoy else ultima.tipo_dato,
        transicion.confianza if transicion else ultima.confianza,
        fecha > hoy,
        transicion,
        siguiente,
    )
