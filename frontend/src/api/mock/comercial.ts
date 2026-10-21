// MOCK commercial and community layers. These never feed the computed layer (MON-3).
import type { EntradaLog, EstadoFuente, FotoCiudadana, OfertaComercial, Suscripcion } from './tipos';

// No sample offers, photos or subscribers (the team's rule): they fill in with real ones when they exist.
export const OFERTAS: OfertaComercial[] = [];

export const FOTOS: FotoCiudadana[] = [];

export const FUENTES: EstadoFuente[] = [
  { id: 'aemet', nombre: 'AEMET OpenData', tipo: 'meteo', ultimaCarga: '2026-10-20T06:10:00+02:00', estado: 'ok', detalle: 'Máximas observadas y previstas a 7 días.' },
  { id: 'sentinel', nombre: 'Copernicus Sentinel-2', tipo: 'satelite', ultimaCarga: '2026-10-18T12:40:00+02:00', estado: 'desactualizado', detalle: 'Nubes sobre la zona 4 el 19/10. Se mantiene el último dato válido.' },
  { id: 'greenia', nombre: 'Datos proporcionados (Greenia)', tipo: 'proporcionado', ultimaCarga: '2026-10-20T06:00:00+02:00', estado: 'ok', detalle: 'Tejera Negra (DAT-1…4) y Brihuega (DAT-5).' },
  { id: 'editorial', nombre: 'Contenido de los destinos', tipo: 'editorial', ultimaCarga: '2026-10-15T10:00:00+02:00', estado: 'ok', detalle: 'Historia, qué ver, accesos y consejos.' },
];

export const LOG_INGESTA: EntradaLog[] = [
  { hora: '06:00', nivel: 'info', mensaje: 'Inicio de la ingesta diaria' },
  { hora: '06:10', nivel: 'info', mensaje: 'AEMET: 4 estaciones, 28 valores nuevos' },
  { hora: '06:14', nivel: 'warn', mensaje: 'Sentinel-2: 1 de 7 zonas con nubes → "sin dato" (no se interpola)' },
  { hora: '06:30', nivel: 'info', mensaje: 'Previsiones recalculadas: 4 destinos' },
];

export const SUSCRIPCIONES: Suscripcion[] = [];
