import type { Lang } from '../i18n';

const DAY = 86_400_000;

const toUTC = (iso: string) => new Date(iso.slice(0, 10) + 'T00:00:00Z');

export function addDays(iso: string, n: number): string {
  return new Date(toUTC(iso).getTime() + n * DAY).toISOString().slice(0, 10);
}

export function diffDays(a: string, b: string): number {
  return Math.round((toUTC(a).getTime() - toUTC(b).getTime()) / DAY);
}

const locale = (lang: Lang) => (lang === 'en' ? 'en-GB' : 'es-ES');

export function fmtDia(iso: string, lang: Lang, withYear = false): string {
  return toUTC(iso).toLocaleDateString(locale(lang), {
    day: 'numeric',
    month: 'short',
    year: withYear ? 'numeric' : undefined,
    timeZone: 'UTC',
  });
}

export function fmtDiaLargo(iso: string, lang: Lang): string {
  const s = toUTC(iso).toLocaleDateString(locale(lang), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function fmtMes(iso: string, lang: Lang, form: 'long' | 'short' = 'long'): string {
  return toUTC(iso).toLocaleDateString(locale(lang), { month: form, timeZone: 'UTC' });
}

export function fmtHora(isoDateTime: string, lang: Lang): string {
  const d = new Date(isoDateTime);
  return d.toLocaleString(locale(lang), {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Madrid',
  });
}

/** "24 – 31 oct" or "28 mar – 12 abr 2027" */
export function fmtRango(desde: string, hasta: string, lang: Lang, withYear = false): string {
  const sameMonth = desde.slice(0, 7) === hasta.slice(0, 7);
  const a = sameMonth ? String(toUTC(desde).getUTCDate()) : fmtDia(desde, lang);
  return `${a} – ${fmtDia(hasta, lang, withYear)}`;
}

/** MM-DD typical date → "28 oct" */
export function fmtTipica(mmdd: string, lang: Lang): string {
  return fmtDia(`2026-${mmdd}`, lang);
}

export function firstOfMonth(iso: string): string {
  return iso.slice(0, 8) + '01';
}

export function addMonths(iso: string, n: number): string {
  const d = toUTC(iso);
  d.setUTCMonth(d.getUTCMonth() + n, 1);
  return d.toISOString().slice(0, 10);
}
