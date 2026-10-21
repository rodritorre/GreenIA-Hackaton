// Presentation helpers over API data (no business rules: states and forecasts come from the API).
import type { DestinoResumen } from '../api';
import { addDays } from './fechas';

export const FASES_ACTIVAS = ['inicio', 'avance', 'pleno', 'final'] as const;

export const ventanaPleno = (d: DestinoResumen) => d.ventanas.find((v) => v.fase === 'pleno');

/** For the 12-cell calendar: 0 = nothing to see, 1 = in season, 2 = peak window overlaps the month. */
export function intensidadMes(d: DestinoResumen, year: number, month: number): 0 | 1 | 2 {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const end = addDays(`${month === 12 ? year + 1 : year}-${String(month === 12 ? 1 : month + 1).padStart(2, '0')}-01`, -1);
  const pleno = ventanaPleno(d);
  if (pleno && pleno.desde <= end && pleno.hasta >= start) return 2;
  const first = d.ventanas[0]?.desde;
  if (first && first <= end && d.finTemporada >= start) return 1;
  return 0;
}
