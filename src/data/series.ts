// MOCK series for Tejera Negra, shaped like DAT-1 (aggregated colour index) and
// DAT-2 (daily max temperatures). Replace with the organisers' files once received.
import type { PuntoPrevisionSerie, PuntoSerie } from '../types';
import { addDays } from '../lib/fechas';

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const logistic = (day: number, mid: number, k: number) => 0.08 + 0.85 / (1 + Math.exp(-(day - mid) / k));

const START = '2026-09-01';
const MID = 48; // ≈ 19 Oct, days since START
const CLOUDY = new Set(['2026-09-12', '2026-09-13', '2026-09-27', '2026-10-03', '2026-10-11', '2026-10-12']);

export function serieTejeraNegra(): PuntoSerie[] {
  const rnd = seeded(7);
  const out: PuntoSerie[] = [];
  for (let d = 0; d <= 49; d++) {
    const fecha = addDays(START, d);
    const nubes = CLOUDY.has(fecha);
    const indice = Math.max(0, Math.min(1, logistic(d, MID, 6) + (rnd() - 0.5) * 0.04));
    const tMax = 27 - d * 0.26 + (rnd() - 0.5) * 4;
    out.push({
      fecha,
      indice: nubes ? null : Number(indice.toFixed(3)),
      calidad: nubes ? 'nubes' : 'ok',
      tMax: Number(tMax.toFixed(1)),
    });
  }
  return out;
}

export function previsionTejeraNegra(): PuntoPrevisionSerie[] {
  const out: PuntoPrevisionSerie[] = [];
  for (let d = 50; d <= 75; d++) {
    const leafFall = d > 66 ? (d - 66) * 0.03 : 0;
    const p50 = Math.min(0.95, logistic(d, MID, 6)) - leafFall;
    const spread = 0.03 + (d - 50) * 0.006;
    out.push({
      fecha: addDays(START, d),
      p10: Number(Math.max(0, p50 - spread).toFixed(3)),
      p50: Number(p50.toFixed(3)),
      p90: Number(Math.min(1, p50 + spread).toFixed(3)),
    });
  }
  return out;
}
