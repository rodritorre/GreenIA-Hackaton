// Data contract shared by the UI and (later) the API — see SPECIFICATION §8 and §9.1.
// The UI only reads these shapes; nothing here is computed in the browser except
// the mock helpers in src/lib/fenologia.ts.

export type Fase = 'fuera_temporada' | 'inicio' | 'avance' | 'pleno' | 'final';
export type FaseActiva = Exclude<Fase, 'fuera_temporada'>;
export type TipoDato = 'observado' | 'estimado' | 'previsto' | 'editorial';
export type Confianza = 'alta' | 'media' | 'baja';
export type TipoFenomeno = 'floracion' | 'color_otonal';
export type CalidadDato = 'ok' | 'nubes' | 'sin_dato';

export interface Fuente {
  id: string;
  nombre: string;
  url?: string;
}

/** Window in which a phase starts. A forecast is ALWAYS a range (PRIN-1.1). */
export interface VentanaFase {
  fase: FaseActiva;
  desde: string; // ISO date
  hasta: string; // ISO date
  tipoDato: Exclude<TipoDato, 'editorial'>;
  confianza: Confianza;
  /** Probability that the phase starts inside [desde, hasta]. */
  probabilidad: number;
  metodo: 'dato_proporcionado' | 'modelo_v0' | 'satelite';
  fuente: string;
}

export interface FechaHabitual {
  fase: FaseActiva;
  /** Typical start, MM-DD */
  tipica: string;
  rangoMin: string;
  rangoMax: string;
}

export interface EstadoActual {
  fase: Fase;
  tipoDato: Exclude<TipoDato, 'editorial'>;
  actualizadoEn: string; // ISO datetime
  fuente: string;
  /** Plain-language one-liner shown under the status. */
  resumen: string;
}

export interface Zona {
  id: string;
  nombre: string;
  lat: number;
  lon: number;
  indice: number | null;
  calidad: CalidadDato;
  fase: Fase | null;
}

export interface PuntoSerie {
  fecha: string;
  indice: number | null;
  calidad: CalidadDato;
  tMax: number | null;
}

export interface PuntoPrevisionSerie {
  fecha: string;
  p10: number;
  p50: number;
  p90: number;
}

/** Past snapshots of the forecast for one phase, to show the margin narrowing (PRIN-1.3). */
export interface HistoricoMargen {
  generadaEn: string;
  desde: string;
  hasta: string;
}

export interface ComparativaModelo {
  fase: FaseActiva;
  proporcionada: { desde: string; hasta: string };
  propia: { desde: string; hasta: string; probabilidad: number };
  maeDias: number;
  cobertura: number;
  explicacion: string;
}

export interface Editorial {
  historia: string;
  queVer: string[];
  comoLlegar: string;
  acceso: string;
  consejos: string[];
}

export interface Destino {
  id: string;
  nombre: string;
  lugar: string;
  provincia: string;
  region: string;
  especie: string;
  fenomeno: string;
  tipo: TipoFenomeno;
  lat: number;
  lon: number;
  /** Species tint used for headers and cards (not for phase encoding). */
  color: string;
  temporada: string;
  /** End of the season being tracked: after this the destination is out of season. */
  finTemporada: string;
  /** True when the destination uses the organisers' datasets (MIN-2). */
  datosReales: boolean;
  estado: EstadoActual;
  ventanas: VentanaFase[];
  habituales: FechaHabitual[];
  entradasHasta: string;
  generadaEn: string;
  historicoMargen?: HistoricoMargen[];
  comparativa?: ComparativaModelo;
  zonas?: Zona[];
  serie?: PuntoSerie[];
  serieprevision?: PuntoPrevisionSerie[];
  umbrales: Record<FaseActiva, number>;
  editorial: Editorial;
  patrocinio?: { entidad: string; mensaje: string };
}

export type TipoOferta = 'alojamiento' | 'actividad';

export interface OfertaComercial {
  id: string;
  destinoId: string;
  tipo: TipoOferta;
  nombre: string;
  descripcion: string;
  distanciaKm: number;
  precio: string;
  patrocinado: boolean;
}

export interface FotoCiudadana {
  id: string;
  destinoId: string;
  lat: number;
  lon: number;
  capturadaEn: string;
  faseReportada: FaseActiva;
  estado: 'valida' | 'pendiente' | 'rechazada';
  motivo?: string;
}

export interface EstadoFuente {
  id: string;
  nombre: string;
  tipo: 'meteo' | 'satelite' | 'proporcionado' | 'editorial';
  ultimaCarga: string;
  estado: 'ok' | 'desactualizado' | 'error';
  detalle: string;
}

export interface EntradaLog {
  hora: string;
  nivel: 'info' | 'warn' | 'error';
  mensaje: string;
}
