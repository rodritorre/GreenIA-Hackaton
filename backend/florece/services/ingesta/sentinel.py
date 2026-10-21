"""Colour index per zone from Sentinel-2 L2A (spec SRC-2, DAT-1 for new destinations).

Public data on AWS (s3://sentinel-cogs), no key. For each recent scene over a destination:

1. read red (B04), green (B03) at 10 m and the scene classification (SCL) at 20 m around each zone;
2. keep vegetation/soil pixels, drop clouds, shadows, snow, water and no-data;
3. if fewer than 30 % of the pixels are usable → the zone gets "sin dato (nubes)" for that day.
   Gaps are never filled in (HON-4);
4. "redness" = mean of (R − G) / (R + G), which rises as leaves turn yellow/red or as fields flower
   in pink/purple, mapped to a 0–1 colour index with the destination's calibration (r0 → 0, r1 → 1).

This is a provisional index: the organisers' own index method is still an open question (§15.2).
It is an ESTIMATE, labelled as such everywhere (HON-1).
"""
from __future__ import annotations

import json
import os
import urllib.request
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from datetime import date, timedelta

import numpy as np

from ...config import get_settings

FUENTE = 'Copernicus Sentinel-2 (estimación)'
# Scene classification classes we keep: 4 vegetation, 5 bare soil, 7 unclassified (low prob. cloud)
SCL_OK = (4, 5, 7)
CALIBRACION_DEFECTO = {'r0': -0.15, 'r1': 0.25}

os.environ.setdefault('GDAL_DISABLE_READDIR_ON_OPEN', 'EMPTY_DIR')
os.environ.setdefault('AWS_NO_SIGN_REQUEST', 'YES')


@dataclass
class Escena:
    id: str
    fecha: date
    nubes: float
    red: str
    green: str
    scl: str


def mgrs_de(lat: float, lon: float) -> str:
    import mgrs

    return mgrs.MGRS().toMGRS(lat, lon, MGRSPrecision=0)


def _http(url: str) -> bytes:
    with urllib.request.urlopen(url, timeout=60) as r:
        return r.read()


def escenas(lat: float, lon: float, desde: date, hasta: date) -> list[Escena]:
    s = get_settings()
    tile = mgrs_de(lat, lon)
    zone, band, sq = tile[:2].lstrip('0'), tile[2], tile[3:]
    meses = sorted({(d.year, d.month) for d in (desde + timedelta(days=i) for i in range((hasta - desde).days + 1))})
    out = []
    ns = {'s': 'http://s3.amazonaws.com/doc/2006-03-01/'}
    for y, mth in meses:
        prefix = f'sentinel-s2-l2a-cogs/{zone}/{band}/{sq}/{y}/{mth}/'
        xml = _http(f'{s.sentinel_bucket_url}/?list-type=2&delimiter=/&prefix={prefix}')
        for p in ET.fromstring(xml).findall('s:CommonPrefixes/s:Prefix', ns):
            sid = p.text.rstrip('/').split('/')[-1]
            fecha = date(int(sid[10:14]), int(sid[14:16]), int(sid[16:18]))
            if not (desde <= fecha <= hasta):
                continue
            item = json.loads(_http(f'{s.sentinel_bucket_url}/{prefix}{sid}/{sid}.json'))
            nubes = item['properties'].get('eo:cloud_cover', 100)
            if nubes > s.sentinel_max_cloud:
                continue
            a = item['assets']
            out.append(Escena(sid, fecha, nubes, a['red']['href'], a['green']['href'], a['scl']['href']))
    # one scene per day: the least cloudy (several processings of the same pass can exist)
    por_dia: dict[date, Escena] = {}
    for e in sorted(out, key=lambda e: e.nubes):
        por_dia.setdefault(e.fecha, e)
    return [por_dia[k] for k in sorted(por_dia)]


def _leer(href: str, lon: float, lat: float, radio_m: float) -> np.ndarray | None:
    import rasterio
    from rasterio.warp import transform as warp_transform
    from rasterio.windows import from_bounds

    with rasterio.open('/vsicurl/' + href) as src:
        xs, ys = warp_transform('EPSG:4326', src.crs, [lon], [lat])
        x, y = xs[0], ys[0]
        win = from_bounds(x - radio_m, y - radio_m, x + radio_m, y + radio_m, src.transform)
        a = src.read(1, window=win, boundless=True, fill_value=0)
        return a if a.size else None


def indice_zona(e: Escena, lat: float, lon: float, radio_m: float, calib: dict | None) -> tuple[float | None, str]:
    red = _leer(e.red, lon, lat, radio_m)
    green = _leer(e.green, lon, lat, radio_m)
    scl = _leer(e.scl, lon, lat, radio_m)
    if red is None or green is None or scl is None:
        return None, 'sin_dato'
    # SCL is 20 m: upsample by repetition to the 10 m grid
    scl = np.kron(scl, np.ones((2, 2), dtype=scl.dtype))[: red.shape[0], : red.shape[1]]
    if scl.shape != red.shape:
        scl = np.resize(scl, red.shape)
    r, g = red.astype(np.float32), green.astype(np.float32)
    ok = np.isin(scl, SCL_OK) & (r > 0) & (g > 0)
    if ok.mean() < 0.3:
        return None, 'nubes'
    redness = float(np.mean((r[ok] - g[ok]) / (r[ok] + g[ok])))
    c = calib or CALIBRACION_DEFECTO
    return round(float(np.clip((redness - c['r0']) / (c['r1'] - c['r0']), 0, 1)), 3), 'ok'
