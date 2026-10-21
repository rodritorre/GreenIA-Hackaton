// Series for Tejera Negra. The observed colour index and temperatures are the organisers' data
// (datosOrganizadores.ts, DAT-1 and DAT-2). The forecast band after the last observation is the
// v0 model's projection on the same scale; it is a simulation until the model is validated.
import type { PuntoPrevisionSerie, PuntoSerie } from './tipos';
import { addDays } from '../../lib/fechas';
import { TEJERA_NEGRA, TN_SERIE } from './datosOrganizadores';

export const serieTejeraNegra = (): PuntoSerie[] => TN_SERIE.map((p) => ({ ...p }));

const PICO = '2026-10-31'; // centre of the v0 model's full-colour window
const FIN = '2026-11-25';

export function previsionTejeraNegra(): PuntoPrevisionSerie[] {
  const { fecha, indice } = TEJERA_NEGRA.ultima;
  const out: PuntoPrevisionSerie[] = [];
  const total = Math.round((Date.parse(FIN) - Date.parse(fecha)) / 86_400_000);
  const subida = Math.round((Date.parse(PICO) - Date.parse(fecha)) / 86_400_000);
  for (let d = 1; d <= total; d++) {
    // rises towards the peak, then drops as leaves fall
    const p50 = d <= subida ? indice + (0.42 - indice) * (d / subida) : 0.42 - (d - subida) * 0.012;
    const spread = 0.03 + d * 0.0025;
    out.push({
      fecha: addDays(fecha, d),
      p10: Number((p50 - spread).toFixed(3)),
      p50: Number(p50.toFixed(3)),
      p90: Number((p50 + spread).toFixed(3)),
    });
  }
  return out;
}
