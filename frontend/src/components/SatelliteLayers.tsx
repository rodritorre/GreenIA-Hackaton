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
export const ESRI_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const ESRI_LABELS = 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}';
/** Our own Sentinel tiles only cover the Peninsula and the Balearics. */
export const CANARIAS: L.LatLngBoundsExpression = [
  [27.55, -18.25],
  [29.5, -13.3],
];

/** Country-wide summer mosaic (z5–9), seasonal close-ups of each destination (z10–14), and Esri
 *  orthophoto for the Canary Islands at low zoom and everywhere from zoom 10 (needs internet). */
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
    const canarias = L.tileLayer(ESRI_URL, { minZoom: 5, maxZoom: 9, bounds: [[26.5, -19], [30.5, -12.5]] });
    const cerca = L.tileLayer(ESRI_URL, { minZoom: 10, maxZoom: 18, maxNativeZoom: 18, keepBuffer: 4, attribution: 'Ortofoto © Esri, Maxar, Earthstar Geographics' });
    const nombres = L.tileLayer(ESRI_LABELS, { minZoom: 10, maxZoom: 18, maxNativeZoom: 18 });
    const capas = [base, detail, canarias, cerca, nombres];
    capas.forEach((c) => c.addTo(map));
    return () => capas.forEach((c) => c.remove());
  }, [map]);
  return null;
}
