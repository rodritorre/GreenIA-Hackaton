"""Build the bundled Sentinel-2 basemap used by the map (src/components/BloomMap.tsx).

Reads public Sentinel-2 L2A true-colour COGs (AWS Open Data, s3://sentinel-cogs)
and writes WebP tiles packed into JSON files under public/sat/:

  base-z5-8.json, base-z9.json   cloud-free summer mosaic of Spain and its neighbours
  detail.json                    close-ups (z10–z14) of each destination, taken in its season
  meta.json                      scenes used, for attribution

Usage (needs rasterio, mercantile, mgrs, shapely, pillow, numpy):
  python scripts/build_satellite_tiles.py
"""
import base64
import io
import json
import os
import sys
import urllib.request
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import mercantile
import mgrs
import numpy as np
import rasterio
from PIL import Image
from rasterio.transform import from_bounds
from rasterio.vrt import WarpedVRT
from rasterio.warp import Resampling, reproject
from shapely.geometry import Point, shape

os.environ.setdefault('GDAL_DISABLE_READDIR_ON_OPEN', 'EMPTY_DIR')
os.environ.setdefault('AWS_NO_SIGN_REQUEST', 'YES')
os.environ.setdefault('GDAL_HTTP_MAX_RETRY', '4')

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'public' / 'sat'
BUCKET = 'https://sentinel-cogs.s3.us-west-2.amazonaws.com'
PREFIX = 'sentinel-s2-l2a-cogs'
BBOX = (-9.6, 35.8, 4.4, 43.9)  # lon/lat
BASE_MONTHS = [(2025, 6), (2025, 7), (2025, 8)]
WEBP_Q = 72

DETAIL = [
    # id, lat, lon, half-size deg (lat, lon), zooms, months to search (season of the phenomenon)
    ('tejera-negra', 41.245, -3.405, (0.08, 0.11), range(10, 15), [(2025, 10), (2025, 11)]),
    ('brihuega', 40.76, -2.868, (0.07, 0.09), range(10, 14), [(2025, 7), (2025, 6)]),
    ('jerte', 40.19, -5.8, (0.08, 0.1), range(10, 14), [(2025, 4), (2025, 3)]),
    ('alpujarra', 36.93, -3.35, (0.08, 0.1), range(10, 14), [(2025, 2), (2025, 3)]),
]


def http_json(url):
    with urllib.request.urlopen(url, timeout=60) as r:
        return r.read()


def list_items(tile, year, month):
    zone, band, sq = tile[:2].lstrip('0'), tile[2], tile[3:]
    prefix = f'{PREFIX}/{zone}/{band}/{sq}/{year}/{month}/'
    xml = http_json(f'{BUCKET}/?list-type=2&delimiter=/&prefix={prefix}')
    ns = {'s': 'http://s3.amazonaws.com/doc/2006-03-01/'}
    ids = [p.text.rstrip('/').split('/')[-1] for p in ET.fromstring(xml).findall('s:CommonPrefixes/s:Prefix', ns)]
    items = []
    for i in ids:
        try:
            d = json.loads(http_json(f'{BUCKET}/{prefix}{i}/{i}.json'))
        except Exception:
            continue
        p = d['properties']
        items.append({
            'id': i,
            'date': p['datetime'][:10],
            'cloud': p.get('eo:cloud_cover', 100),
            'nodata': p.get('s2:nodata_pixel_percentage', 100),
            'href': d['assets']['visual']['href'],
        })
    return items


def best_items(tile, months, n):
    items = []
    for y, m in months:
        try:
            items += list_items(tile, y, m)
        except Exception as e:
            print('  list failed', tile, y, m, e, file=sys.stderr)
    items.sort(key=lambda it: it['cloud'] * 2 + it['nodata'])
    return [it for it in items if it['cloud'] < 30][:n]


def tiles_for_region():
    """MGRS 100 km squares touching the land inside BBOX."""
    geo = json.loads((ROOT / 'src' / 'data' / 'basemap.json').read_text())
    land = [shape(f['geometry']).buffer(0.15) for f in geo['features']]
    m = mgrs.MGRS()
    out = set()
    for lat in np.arange(BBOX[1], BBOX[3] + 0.01, 0.15):
        for lon in np.arange(BBOX[0], BBOX[2] + 0.01, 0.15):
            if any(g.contains(Point(lon, lat)) for g in land):
                out.add(m.toMGRS(lat, lon, MGRSPrecision=0))
    return sorted(out)


def to_webp(rgb, alpha=None):
    if alpha is not None:
        img = Image.fromarray(np.dstack([rgb, alpha]).astype(np.uint8), 'RGBA')
    else:
        img = Image.fromarray(rgb.astype(np.uint8), 'RGB')
    buf = io.BytesIO()
    img.save(buf, 'WEBP', quality=WEBP_Q, method=6)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()


def tone(rgb):
    """Gentle contrast/saturation lift: TCI is quite flat."""
    f = rgb.astype(np.float32) / 255.0
    f = np.clip((f - 0.02) * 1.12, 0, 1) ** 0.92
    grey = f.mean(axis=0, keepdims=True)
    f = np.clip(grey + (f - grey) * 1.15, 0, 1)
    return (f * 255).astype(np.uint8)


def composite(stack):
    """Per-pixel cloud removal for one 100 km square: median of 3+ passes, else the darker pass."""
    stack = np.stack(stack).astype(np.float32)  # n, 3, h, w
    valid = stack.max(axis=1) > 0  # n, h, w
    stack[~np.repeat(valid[:, None], 3, axis=1)] = np.nan
    n = valid.sum(axis=0)
    with np.errstate(all='ignore'):
        med = np.nanmedian(stack, axis=0)
        bright = np.nansum(stack, axis=1)  # n, h, w
        bright[~valid] = np.inf
        darker = np.take_along_axis(stack, bright.argmin(axis=0)[None, None].repeat(3, axis=1), axis=0)[0]
    out = np.where(n[None] >= 3, med, darker)
    return np.nan_to_num(out, nan=0).astype(np.uint8)


def land_mask(transform, shape_hw):
    """Land (buffered ~2 km so coastal pixels are never cut) for masking the open sea."""
    from rasterio.features import rasterize
    from shapely.ops import transform as shp_transform
    geo = json.loads((ROOT / 'src' / 'data' / 'basemap.json').read_text())
    # Only the countries the product covers; neighbours stay as plain land on the map.
    shapes = [
        shp_transform(lambda xs, ys, zs=None: _merc(xs, ys), shape(f['geometry'])).buffer(2600)
        for f in geo['features']
        if f['properties']['iso'] in ('ES', 'PT', 'AD')
    ]
    return rasterize(shapes, out_shape=shape_hw, transform=transform, fill=0, default_value=1).astype(bool)


def _merc(xs, ys):
    xs, ys = np.asarray(xs), np.asarray(ys)
    mx = xs * 20037508.342789244 / 180
    my = np.log(np.tan((90 + ys) * np.pi / 360)) * 6378137
    return mx, my


def build_base():
    tiles = tiles_for_region()
    print(f'{len(tiles)} MGRS tiles')
    with ThreadPoolExecutor(12) as ex:
        picks = list(ex.map(lambda t: best_items(t, BASE_MONTHS, 5), tiles))
    print(f'{sum(len(p) for p in picks)} scenes')

    # Canvas = the z5 tiles covering BBOX, at z9 resolution, so every zoom level aligns.
    t5 = list(mercantile.tiles(*BBOX, 5))
    xs, ys = [t.x for t in t5], [t.y for t in t5]
    nx, ny = (max(xs) - min(xs) + 1) * 16, (max(ys) - min(ys) + 1) * 16  # z9 tiles
    ul = mercantile.xy_bounds(mercantile.Tile(min(xs), min(ys), 5))
    lr = mercantile.xy_bounds(mercantile.Tile(max(xs), max(ys), 5))
    W, H = nx * 256, ny * 256
    transform = from_bounds(ul.left, lr.bottom, lr.right, ul.top, W, H)
    canvas = np.zeros((3, H, W), np.uint8)
    filled = np.zeros((H, W), bool)

    def fetch_square(items):
        """All passes of one 100 km square share a grid, so they can be combined pixel by pixel."""
        stack, t, crs = [], None, None
        for it in items:
            try:
                with rasterio.open('/vsicurl/' + it['href']) as src:
                    size = 686
                    stack.append(src.read(out_shape=(3, size, size), resampling=Resampling.average))
                    t = src.transform * src.transform.scale(src.width / size, src.height / size)
                    crs = src.crs
            except Exception as e:
                print('  read failed', it['id'], e, file=sys.stderr)
        if not stack:
            return None, None, None
        return composite(stack), t, crs

    with ThreadPoolExecutor(8) as ex:
        for i, (data, t, crs) in enumerate(ex.map(fetch_square, [p for p in picks if p])):
            if data is None:
                continue
            tmp = np.zeros((3, H, W), np.uint8)
            reproject(data, tmp, src_transform=t, src_crs=crs, dst_transform=transform, dst_crs='EPSG:3857',
                      src_nodata=0, dst_nodata=0, resampling=Resampling.bilinear)
            valid = (tmp.max(axis=0) > 0) & ~filled
            canvas[:, valid] = tmp[:, valid]
            filled |= valid
            if i % 10 == 0:
                print(f'  {i}/{len(picks)} squares, {filled.mean():.0%} filled')

    filled &= land_mask(transform, (H, W))
    canvas = tone(canvas)
    canvas[:, ~filled] = 0
    out = {}
    for z in range(9, 4, -1):
        step = 2 ** (9 - z)
        n = 256 * step
        for ty in range(H // n):
            for tx in range(W // n):
                sl = (slice(ty * n, (ty + 1) * n), slice(tx * n, (tx + 1) * n))
                m = filled[sl]
                if m.mean() < 0.002:
                    continue
                rgb = canvas[:, sl[0], sl[1]].transpose(1, 2, 0)
                if step > 1:
                    rgb = np.asarray(Image.fromarray(rgb).resize((256, 256), Image.LANCZOS))
                    m = np.asarray(Image.fromarray(m.astype(np.uint8) * 255).resize((256, 256), Image.BILINEAR)) > 127
                alpha = None if m.all() else (m * 255).astype(np.uint8)
                X = min(xs) * 2 ** (z - 5) + tx
                Y = min(ys) * 2 ** (z - 5) + ty
                out[f'{z}/{X}/{Y}'] = to_webp(rgb, alpha)
        print(f'  z{z}: {sum(1 for k in out if k.startswith(f"{z}/"))} tiles')
    lo = {k: v for k, v in out.items() if int(k.split('/')[0]) <= 8}
    hi = {k: v for k, v in out.items() if k.startswith('9/')}
    (OUT / 'base-z5-8.json').write_text(json.dumps(lo))
    (OUT / 'base-z9.json').write_text(json.dumps(hi))
    dates = sorted({it['date'] for p in picks for it in p})
    return {'base': {'from': dates[0], 'to': dates[-1], 'scenes': sum(len(p) for p in picks)}}


def build_detail():
    m = mgrs.MGRS()
    out, meta = {}, {}
    for did, lat, lon, (dlat, dlon), zooms, months in DETAIL:
        # The box can straddle several 100 km granules: pick the best scene in each, centre first.
        grids = [m.toMGRS(lat, lon, MGRSPrecision=0)]
        for la in (lat - dlat, lat + dlat):
            for lo in (lon - dlon, lon + dlon):
                g = m.toMGRS(la, lo, MGRSPrecision=0)
                if g not in grids:
                    grids.append(g)
        chosen = []
        for g in grids:
            # several passes: a scene at the edge of the satellite's swath only covers part of the square
            chosen += best_items(g, months, 3)
        if not chosen:
            print('  no scene for', did, file=sys.stderr)
            continue
        print(did, ', '.join(f"{c['id']} ({c['cloud']:.1f}% cloud)" for c in chosen))
        meta[did] = {'scene': chosen[0]['id'], 'date': chosen[0]['date']}
        srcs = [rasterio.open('/vsicurl/' + c['href']) for c in chosen]
        vrts = [WarpedVRT(s, crs='EPSG:3857', resampling=Resampling.bilinear) for s in srcs]
        try:
            for z in zooms:
                for t in mercantile.tiles(lon - dlon, lat - dlat, lon + dlon, lat + dlat, z):
                    b = mercantile.xy_bounds(t)
                    acc = np.zeros((3, 256, 256), np.uint8)
                    valid = np.zeros((256, 256), bool)
                    for vrt in vrts:
                        vb = vrt.bounds
                        if b.right <= vb.left or b.left >= vb.right or b.top <= vb.bottom or b.bottom >= vb.top:
                            continue
                        dst = np.zeros((3, 256, 256), np.uint8)
                        win = vrt.window(max(b.left, vb.left), max(b.bottom, vb.bottom), min(b.right, vb.right), min(b.top, vb.top))
                        # place the clipped read into the right part of the 256 px tile
                        px = lambda v, lo, hi: int(round((v - lo) / (hi - lo) * 256))
                        x0, x1 = px(max(b.left, vb.left), b.left, b.right), px(min(b.right, vb.right), b.left, b.right)
                        y0, y1 = px(b.top - min(b.top, vb.top), 0, b.top - b.bottom), px(b.top - max(b.bottom, vb.bottom), 0, b.top - b.bottom)
                        if x1 - x0 < 1 or y1 - y0 < 1:
                            continue
                        part = vrt.read(window=win, out_shape=(3, y1 - y0, x1 - x0), resampling=Resampling.bilinear)
                        dst[:, y0:y1, x0:x1] = part
                        new = (dst.max(axis=0) > 0) & ~valid
                        acc[:, new] = dst[:, new]
                        valid |= new
                    if valid.mean() < 0.3:
                        continue
                    rgb = tone(acc)
                    out[f'{t.z}/{t.x}/{t.y}'] = to_webp(rgb.transpose(1, 2, 0), None if valid.all() else (valid * 255).astype(np.uint8))
        finally:
            for v in vrts:
                v.close()
            for s_ in srcs:
                s_.close()
        print(f'  {len(out)} detail tiles so far')
    (OUT / 'detail.json').write_text(json.dumps(out))
    return {'detail': meta}


def remask():
    """Re-apply land_mask() to already built base tiles (no download)."""
    for name in ('base-z5-8.json', 'base-z9.json'):
        idx = json.loads((OUT / name).read_text())
        out = {}
        for k, v in idx.items():
            z, x, y = map(int, k.split('/'))
            b = mercantile.xy_bounds(mercantile.Tile(x, y, z))
            m = land_mask(from_bounds(b.left, b.bottom, b.right, b.top, 256, 256), (256, 256))
            img = np.asarray(Image.open(io.BytesIO(base64.b64decode(v.split(',', 1)[1]))).convert('RGBA')).copy()
            img[..., 3] = np.where(m, img[..., 3], 0)
            if img[..., 3].mean() < 0.5:
                continue
            a = img[..., 3]
            out[k] = to_webp(img[..., :3], None if a.min() == 255 else a)
        (OUT / name).write_text(json.dumps(out))
        print(name, len(idx), '->', len(out))


if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    what = sys.argv[1:] or ['base', 'detail']
    meta_path = OUT / 'meta.json'
    meta = json.loads(meta_path.read_text()) if meta_path.exists() else {}
    if 'detail' in what:
        meta.update(build_detail())
    if 'base' in what:
        meta.update(build_base())
    if 'remask' in what:
        remask()
    meta_path.write_text(json.dumps(meta, indent=1))
    for f in sorted(OUT.glob('*.json')):
        print(f.name, f'{f.stat().st_size / 1e6:.1f} MB')
