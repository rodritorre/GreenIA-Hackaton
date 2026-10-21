"""AEMET OpenData client (spec SRC-1, PRIN-2.1).

Two calls per destination, both two-step (the API answers with a URL to the actual data):
- daily climatology of the configured station (observed max/min temperature, precipitation);
- the municipality's 7-day forecast (stored with previsto=True, used by the model later).

Needs FLORECE_AEMET_API_KEY. Station (`idema`) and municipality (INE code) are set per destination
in the admin panel.
"""
from __future__ import annotations

import json
from datetime import date, timedelta

import httpx

from ...config import get_settings

FUENTE_OBS = 'AEMET OpenData (observado)'
FUENTE_PREV = 'AEMET OpenData (previsión)'


class AemetError(RuntimeError):
    pass


def _num(v) -> float | None:
    if v in (None, '', 'Ip', 'Acum', 'Varias'):
        return None
    try:
        return float(str(v).replace(',', '.'))
    except ValueError:
        return None


def _json(resp: httpx.Response):
    # AEMET serves some payloads as ISO-8859-15 without saying so
    try:
        return resp.json()
    except (UnicodeDecodeError, json.JSONDecodeError):
        return json.loads(resp.content.decode('iso-8859-15'))


def _get(client: httpx.Client, path: str):
    s = get_settings()
    r = client.get(f'{s.aemet_base_url}{path}', headers={'api_key': s.aemet_api_key})
    if r.status_code == 404:
        return []
    r.raise_for_status()
    meta = _json(r)
    if meta.get('estado') == 404:
        return []
    if meta.get('estado') != 200 or 'datos' not in meta:
        raise AemetError(meta.get('descripcion', 'respuesta inesperada'))
    d = client.get(meta['datos'])
    d.raise_for_status()
    return _json(d)


def observaciones(client: httpx.Client, estacion: str, desde: date, hasta: date) -> list[dict]:
    rows = _get(client, f'/valores/climatologicos/diarios/datos/fechaini/{desde}T00:00:00UTC/fechafin/{hasta}T23:59:59UTC/estacion/{estacion}')
    return [
        {'fecha': date.fromisoformat(r['fecha']), 't_max': _num(r.get('tmax')), 't_min': _num(r.get('tmin')), 'precip': _num(r.get('prec'))}
        for r in rows
    ]


def prevision(client: httpx.Client, municipio: str) -> list[dict]:
    data = _get(client, f'/prediccion/especifica/municipio/diaria/{municipio}')
    out = []
    for dia in (data[0]['prediccion']['dia'] if data else []):
        t = dia.get('temperatura', {})
        out.append({'fecha': date.fromisoformat(dia['fecha'][:10]), 't_max': _num(t.get('maxima')), 't_min': _num(t.get('minima')), 'precip': None})
    return out


def cliente() -> httpx.Client:
    return httpx.Client(timeout=30, follow_redirects=True)


def ventana_observaciones(hoy: date) -> tuple[date, date]:
    # Climatological values are published with a few days' delay; re-read the last two weeks.
    return hoy - timedelta(days=14), hoy - timedelta(days=1)
