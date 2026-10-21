import L from 'leaflet';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

// Bundled Sentinel-2 imagery (built by scripts/build_satellite_tiles.py into public/sat/).
// Tiles are packed as data URIs in a few JSON files so the map works without any tile server.
type Index = Record<string, string>;

const cache = new Map<string, Promise<Index>>();
function load(file: string): Promise<Index> {
  if (!cache.has(file)) {
    cache.set(
      file,
      fetch(`${import.meta.env.BASE_URL}sat/${file}`)
        .then((r) => (r.ok ? (r.json() as Promise<Index>) : {}))
        .catch(() => ({})),
    );
  }
  return cache.get(file)!;
}

class PackedTiles extends L.GridLayer {
  constructor(
    private fileFor: (z: number) => string,
    options: L.GridLayerOptions,
  ) {
    super(options);
  }

  createTile(coords: L.Coords, done: L.DoneCallback): HTMLElement {
    const img = document.createElement('img');
    img.alt = '';
    img.className = 'sat-tile';
    img.setAttribute('role', 'presentation');
    img.style.visibility = 'hidden'; // an <img> with no source can paint a hairline outline
    load(this.fileFor(coords.z)).then((idx) => {
      const src = idx[`${coords.z}/${coords.x}/${coords.y}`];
      if (!src) return done(undefined, img);
      img.onload = () => {
        img.style.visibility = '';
        done(undefined, img);
      };
      img.onerror = () => done(undefined, img);
      img.src = src;
    });
    return img;
  }
}

export const SAT_ATTRIBUTION = 'Contains modified Copernicus Sentinel-2 data (2025) · Natural Earth';

/** Country-wide summer mosaic (z5–9) plus seasonal close-ups of each destination (z10–14). */
export function SatelliteLayers() {
  const map = useMap();
  useEffect(() => {
    const base = new PackedTiles((z) => (z <= 8 ? 'base-z5-8.json' : 'base-z9.json'), {
      minNativeZoom: 5,
      maxNativeZoom: 9,
      className: 'sat',
      attribution: SAT_ATTRIBUTION,
    });
    const detail = new PackedTiles(() => 'detail.json', { minZoom: 10, maxNativeZoom: 14, className: 'sat' });
    base.addTo(map);
    detail.addTo(map);
    return () => {
      base.remove();
      detail.remove();
    };
  }, [map]);
  return null;
}
