// Map list filters (the team's web/js/explorar.js): type, phases, region, species, Greenia-only,
// out-of-season and sort order.
import type { DestinoResumen, FaseActiva, TipoFenomeno } from '../api';
import type { MapItem } from './BloomMap';

export type Orden = 'fase' | 'next' | 'name';

export interface Filtros {
  tipo: 'all' | TipoFenomeno;
  fases: FaseActiva[];
  region: string;
  /** Matches the destination's illustration kind, which stands for its species. */
  especie: string;
  reales: boolean;
  off: boolean;
  orden: Orden;
}

export const FILTROS_BASE: Filtros = { tipo: 'all', fases: [], region: '', especie: '', reales: false, off: true, orden: 'fase' };
export const FASES_FILTRO: FaseActiva[] = ['inicio', 'avance', 'pleno', 'final'];

/** How many filters differ from the default (shown on the "Filtros" button). */
export const nFiltros = (f: Filtros) =>
  Number(f.tipo !== 'all') + f.fases.length + Number(!!f.region) + Number(!!f.especie) + Number(f.reales) + Number(!f.off) + Number(f.orden !== 'fase');

export const regiones = (ds: DestinoResumen[]) => [...new Set(ds.map((d) => d.region))].sort((a, b) => a.localeCompare(b));
export const especies = (ds: DestinoResumen[]) => [...new Map(ds.map((d) => [d.ilustracion, d.especie.split(' (')[0]])).entries()];

const RANK = { pleno: 0, avance: 1, inicio: 2, final: 3, fuera_temporada: 4 } as const;
const proxima = (x: MapItem) => (x.e.fase !== 'fuera_temporada' ? '' : (x.e.siguiente?.desde ?? '9999'));

export function aplicar(items: MapItem[], q: string, f: Filtros): MapItem[] {
  const needle = q.trim().toLowerCase();
  const orden: Record<Orden, (a: MapItem, b: MapItem) => number> = {
    fase: (a, b) => RANK[a.e.fase] - RANK[b.e.fase] || a.d.nombre.localeCompare(b.d.nombre),
    next: (a, b) => proxima(a).localeCompare(proxima(b)) || RANK[a.e.fase] - RANK[b.e.fase],
    name: (a, b) => a.d.nombre.localeCompare(b.d.nombre),
  };
  return items
    .filter(({ d, e }) =>
      (f.tipo === 'all' || d.tipo === f.tipo) &&
      (!needle || `${d.nombre} ${d.lugar} ${d.provincia} ${d.region} ${d.especie} ${d.fenomeno}`.toLowerCase().includes(needle)) &&
      (f.off || e.fase !== 'fuera_temporada') &&
      (!f.fases.length || (e.fase !== 'fuera_temporada' && f.fases.includes(e.fase))) &&
      (!f.region || d.region === f.region) &&
      (!f.especie || d.ilustracion === f.especie) &&
      (!f.reales || d.datosReales),
    )
    .sort(orden[f.orden]);
}
