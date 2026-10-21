"""AEMET client against canned responses in AEMET's real format (two-step: metadata → data URL)."""
import json
from datetime import date

import httpx

from florece.services.ingesta import aemet

CLIMA = [
    {'fecha': '2026-10-18', 'indicativo': '2462', 'tmax': '16,4', 'tmin': '3,1', 'prec': 'Ip'},
    {'fecha': '2026-10-19', 'indicativo': '2462', 'tmax': '14,9', 'tmin': '2,0', 'prec': '0,0'},
]
PREVISION = [{'nombre': 'Cantalojas', 'prediccion': {'dia': [
    {'fecha': '2026-10-21T00:00:00', 'temperatura': {'maxima': 13, 'minima': 1}},
    {'fecha': '2026-10-22T00:00:00', 'temperatura': {'maxima': 12, 'minima': 0}},
]}}]


def _transport(request: httpx.Request) -> httpx.Response:
    url = str(request.url)
    if url.startswith('https://datos.example/clima'):
        return httpx.Response(200, content=json.dumps(CLIMA).encode('iso-8859-15'))
    if url.startswith('https://datos.example/prev'):
        return httpx.Response(200, content=json.dumps(PREVISION, ensure_ascii=False).encode('iso-8859-15'))
    assert request.headers['api_key'] == 'clave-de-prueba'
    destino = 'clima' if 'climatologicos' in url else 'prev'
    return httpx.Response(200, json={'descripcion': 'exito', 'estado': 200, 'datos': f'https://datos.example/{destino}'})


def test_observaciones_y_prevision(monkeypatch):
    from florece.config import get_settings

    monkeypatch.setattr(get_settings(), 'aemet_api_key', 'clave-de-prueba')
    with httpx.Client(transport=httpx.MockTransport(_transport)) as c:
        obs = aemet.observaciones(c, '2462', date(2026, 10, 7), date(2026, 10, 19))
        prev = aemet.prevision(c, '19073')
    assert obs[0] == {'fecha': date(2026, 10, 18), 't_max': 16.4, 't_min': 3.1, 'precip': None}
    assert obs[1]['precip'] == 0.0
    assert [p['t_max'] for p in prev] == [13.0, 12.0]
