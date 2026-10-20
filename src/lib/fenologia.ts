// Mock "state engine" for the UI: picks which phase a destination shows on a given date
// from its phase windows. The real engine lives server-side (spec §9); this only exists
// so the time selector can be demoed.
import { HOY } from '../data/config';
import type { Confianza, Destino, Fase, TipoDato, VentanaFase } from '../types';
import { addDays, diffDays } from './fechas';

export const FASES_ACTIVAS = ['inicio', 'avance', 'pleno', 'final'] as const;
export const ORDEN_FASES: Fase[] = ['fuera_temporada', 'inicio', 'avance', 'pleno', 'final'];

export interface EstadoEnFecha {
  fase: Fase;
  tipoDato: Exclude<TipoDato, 'editorial'>;
  confianza: Confianza;
  esPrevision: boolean;
  /** The date sits inside the start window of the next phase: it may or may not have arrived. */
  transicion: VentanaFase | null;
  siguiente: VentanaFase | null;
}

const mid = (v: VentanaFase) => addDays(v.desde, Math.round(diffDays(v.hasta, v.desde) / 2));

export function estadoEn(d: Destino, fecha: string): EstadoEnFecha {
  const siguiente = d.ventanas.find((v) => v.desde > fecha) ?? null;
  const transicion = d.ventanas.find((v) => v.desde <= fecha && fecha <= v.hasta && v.tipoDato === 'previsto') ?? null;

  if (fecha === HOY) {
    const v = d.ventanas.find((w) => w.fase === d.estado.fase);
    return {
      fase: d.estado.fase,
      tipoDato: d.estado.tipoDato,
      confianza: v && v.tipoDato !== 'previsto' ? v.confianza : 'alta',
      esPrevision: false,
      transicion: null,
      siguiente,
    };
  }

  if (fecha > d.finTemporada) {
    return { fase: 'fuera_temporada', tipoDato: 'previsto', confianza: 'media', esPrevision: true, transicion: null, siguiente: null };
  }

  const pasadas = d.ventanas.filter((v) => mid(v) <= fecha);
  const actual = pasadas[pasadas.length - 1];
  if (!actual) {
    return {
      fase: 'fuera_temporada',
      tipoDato: 'previsto',
      confianza: transicion ? transicion.confianza : 'alta',
      esPrevision: fecha > HOY,
      transicion,
      siguiente,
    };
  }
  return {
    fase: actual.fase,
    tipoDato: fecha > HOY ? 'previsto' : actual.tipoDato,
    confianza: transicion ? transicion.confianza : actual.confianza,
    esPrevision: fecha > HOY,
    transicion,
    siguiente,
  };
}

export const ventanaPleno = (d: Destino) => d.ventanas.find((v) => v.fase === 'pleno')!;

export function confianzaDeProbabilidad(p: number): Confianza {
  if (p >= 0.85) return 'alta';
  if (p >= 0.75) return 'media';
  return 'baja';
}

/** Months with any active phase, for the 12-cell calendar. 0 = none, 1 = active, 2 = peak. */
export function intensidadMes(d: Destino, year: number, month: number): 0 | 1 | 2 {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const end = addDays(`${month === 12 ? year + 1 : year}-${String(month === 12 ? 1 : month + 1).padStart(2, '0')}-01`, -1);
  const pleno = ventanaPleno(d);
  if (pleno.desde <= end && pleno.hasta >= start) return 2;
  const first = d.ventanas[0].desde;
  if (first <= end && d.finTemporada >= start) return 1;
  return 0;
}
