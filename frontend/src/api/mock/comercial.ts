// MOCK commercial and community layers. These never feed the computed layer (MON-3).
import type { EntradaLog, EstadoFuente, FotoCiudadana, OfertaComercial, Suscripcion } from './tipos';

export const OFERTAS: OfertaComercial[] = [
  { id: 'tn-a1', destinoId: 'tejera-negra', tipo: 'alojamiento', nombre: 'Casa rural de pizarra', descripcion: 'Casa entera para 6 en Cantalojas, a 10 min del aparcamiento del hayedo.', distanciaKm: 8, precio: '[PRECIO]', patrocinado: true },
  { id: 'tn-a2', destinoId: 'tejera-negra', tipo: 'alojamiento', nombre: 'Hostal en Galve de Sorbe', descripcion: 'Habitaciones dobles con desayuno incluido.', distanciaKm: 17, precio: '[PRECIO]', patrocinado: false },
  { id: 'tn-x1', destinoId: 'tejera-negra', tipo: 'actividad', nombre: 'Ruta guiada por el hayedo', descripcion: 'Senda de Carretas con guía de naturaleza. 3 h, grupos reducidos.', distanciaKm: 0, precio: '[PRECIO]', patrocinado: false },
  { id: 'tn-x2', destinoId: 'tejera-negra', tipo: 'actividad', nombre: 'Taller de fotografía otoñal', descripcion: 'Salida al amanecer para fotografiar el color.', distanciaKm: 0, precio: '[PRECIO]', patrocinado: false },
  { id: 'br-a1', destinoId: 'brihuega', tipo: 'alojamiento', nombre: 'Hotel en el casco histórico', descripcion: 'A 5 min a pie de la muralla.', distanciaKm: 1, precio: '[PRECIO]', patrocinado: false },
  { id: 'br-x1', destinoId: 'brihuega', tipo: 'actividad', nombre: 'Visita a una destilería de lavanda', descripcion: 'Del campo al aceite esencial. 1 h 30 min.', distanciaKm: 4, precio: '[PRECIO]', patrocinado: true },
  { id: 'br-x2', destinoId: 'brihuega', tipo: 'actividad', nombre: 'Paseo al atardecer entre campos', descripcion: 'Ruta guiada de 5 km por los campos en flor.', distanciaKm: 3, precio: '[PRECIO]', patrocinado: false },
  { id: 'je-a1', destinoId: 'jerte', tipo: 'alojamiento', nombre: 'Apartamentos en Cabezuela del Valle', descripcion: 'Con vistas a los bancales de cerezos.', distanciaKm: 2, precio: '[PRECIO]', patrocinado: false },
  { id: 'je-x1', destinoId: 'jerte', tipo: 'actividad', nombre: 'Ruta a la Garganta de los Infiernos', descripcion: 'Senderismo hasta Los Pilones. 4 h.', distanciaKm: 6, precio: '[PRECIO]', patrocinado: false },
  { id: 'al-a1', destinoId: 'alpujarra', tipo: 'alojamiento', nombre: 'Casa alpujarreña en Bubión', descripcion: 'Terraza sobre el Barranco del Poqueira.', distanciaKm: 3, precio: '[PRECIO]', patrocinado: false },
  { id: 'al-x1', destinoId: 'alpujarra', tipo: 'actividad', nombre: 'Ruta entre almendros y acequias', descripcion: 'Senderismo guiado de media jornada.', distanciaKm: 2, precio: '[PRECIO]', patrocinado: false },
];

export const FOTOS: FotoCiudadana[] = [
  { id: 'f1', destinoId: 'tejera-negra', lat: 41.258, lon: -3.41, capturadaEn: '2026-10-19T11:20:00+02:00', faseReportada: 'avance', estado: 'valida', distanciaKm: 0.6, zona: 'Zona 2', horas: 20 },
  { id: 'f2', destinoId: 'tejera-negra', lat: 41.262, lon: -3.417, capturadaEn: '2026-10-19T16:05:00+02:00', faseReportada: 'pleno', estado: 'valida', distanciaKm: 0.2, zona: 'Zona 1', horas: 15 },
  { id: 'f3', destinoId: 'tejera-negra', lat: 41.236, lon: -3.401, capturadaEn: '2026-10-20T09:40:00+02:00', faseReportada: 'avance', estado: 'pendiente', distanciaKm: 2.7, zona: 'Zona 5', horas: 2 },
  { id: 'f4', destinoId: 'tejera-negra', lat: 41.6, lon: -3.1, capturadaEn: '2026-10-20T08:10:00+02:00', faseReportada: 'pleno', estado: 'rechazada', motivo: 'lejos', distanciaKm: 42, zona: 'Zona 1', horas: 3 },
  { id: 'f5', destinoId: 'tejera-negra', lat: 41.25, lon: -3.405, capturadaEn: '2026-10-14T12:00:00+02:00', faseReportada: 'pleno', estado: 'rechazada', motivo: 'antigua', distanciaKm: 0.4, zona: 'Zona 3', horas: 141 },
];

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

export const SUSCRIPCIONES: Suscripcion[] = [
  { destinoId: 'tejera-negra', fase: 'pleno', confirmadas: 412, sinConfirmar: 37 },
  { destinoId: 'tejera-negra', fase: 'avance', confirmadas: 96, sinConfirmar: 8 },
  { destinoId: 'brihuega', fase: 'pleno', confirmadas: 1240, sinConfirmar: 102 },
  { destinoId: 'jerte', fase: 'pleno', confirmadas: 875, sinConfirmar: 64 },
  { destinoId: 'alpujarra', fase: 'pleno', confirmadas: 233, sinConfirmar: 19 },
];
