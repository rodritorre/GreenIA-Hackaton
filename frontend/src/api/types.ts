// UI-facing names for the API contract. schema.d.ts is generated from the backend's OpenAPI
// document (`npm run api:types`); never edit it by hand.
import type { components } from './schema';

type S = components['schemas'];

// ---- Demo features for the business model (destination licence, business listings).
// Not yet in the backend's OpenAPI: the mock adapter implements them with the shapes the real
// endpoints will have, so the UI and the architecture tell the same story.

export type ModoVisibilidad = 'normal' | 'reducida' | 'pausada';

/** What the town decides about its own exposure on the public site (licence feature). */
export interface Visibilidad {
  destinoId: string;
  modo: ModoVisibilidad;
  /** Visitors per day the town can take. */
  aforoDiario: number;
  actualizadoEn: string | null;
}

/** A nearby, lesser-known place we suggest instead ("pueblos por descubrir"). */
export interface Alternativa {
  nombre: string;
  distanciaKm: number;
  motivo: string;
}

/** Public view of a destination's capacity, from GET /aforo. */
export interface EstadoAforo {
  destinoId: string;
  modo: ModoVisibilidad;
  /** Set when the public site must stop promoting the destination. */
  completo: { motivo: 'pausa' | 'aforo'; desde: string; hasta: string } | null;
  /** Quieter weekdays inside the same bloom window. */
  entreSemana: { desde: string; hasta: string } | null;
  alternativas: Alternativa[];
}

export interface DemandaVentana {
  desde: string;
  hasta: string;
  finDeSemana: boolean;
  personas: number;
  /** Expected visitors per day in that window, from alerts and past seasons. */
  visitantesDia: number;
}

export interface KpiImpacto {
  clave: string;
  valor: string;
  tendencia: string;
}

export type TipoNegocio = 'alojamiento' | 'actividad' | 'finca' | 'productor';
export type NormasFinca = 'abierta' | 'entrada' | 'prohibida';

export interface SolicitudNegocioIn {
  destinoId: string;
  nombre: string;
  tipo: TipoNegocio;
  pueblo: string;
  descripcion: string;
  normas?: NormasFinca;
  /** Review the business wants to show on its listing. */
  resena?: string;
  /** Distance from the village of the photo's GPS position. */
  fotoDistanciaKm?: number;
  /** Demo hint: the review came from the business's own connection. */
  mismaIp?: boolean;
  /** Contact email: gets the confirmation and the town's answer. */
  email?: string;
  idioma?: string;
}

/** "Solicitar información" about the destination licence (town councils, parks). */
export interface ContactoDestinoIn {
  nombre: string;
  entidad: string;
  email: string;
  telefono?: string;
  destino: string;
  mensaje?: string;
  idioma?: string;
}

export interface Veredicto {
  estado: 'aprobado' | 'rechazado' | 'revision';
  motivo: string;
  comprobaciones: { clave: string; ok: boolean; detalle: string }[];
  modelo: string;
}

export interface SolicitudNegocio extends SolicitudNegocioIn {
  id: number;
  recibidaEn: string;
  veredicto: Veredicto;
}

export interface EventoAgenda {
  fecha: string;
  titulo: string;
}

/** Everything the town council sees in its panel, from GET /destino/{id}/panel. */
export interface PanelDestino {
  destinoId: string;
  entidad: string;
  plan: string;
  demanda: { total: number; porProvincia: { provincia: string; personas: number }[]; porVentana: DemandaVentana[] };
  kpis: KpiImpacto[];
  visibilidad: Visibilidad;
  aforo: EstadoAforo;
  solicitudes: SolicitudNegocio[];
  fotosPendientes: number;
  agenda: EventoAgenda[];
  widget: string;
}

export type DestinoResumen = S['DestinoResumen'];
/** A cited source for a destination's facts (the team's rule: no source, no fact). */
export interface FuenteCitada {
  nombre: string;
  url: string | null;
}
export type DestinoFicha = S['DestinoFicha'] & { fuentes?: FuenteCitada[] };
export type VentanaFase = S['VentanaFase'];
export type FechaHabitual = S['FechaHabitual'];
export type EstadoActual = S['EstadoActual'];
export type EstadoEnFecha = S['EstadoEnFecha'];
export type Mapa = S['Mapa'];
export type Zona = S['Zona'];
export type HistoricoMargen = S['HistoricoMargen'];
export type Serie = S['Serie'];
export type PuntoSerie = S['PuntoSerie'];
export type PuntoPrevisionSerie = S['PuntoPrevisionSerie'];
export type Umbrales = S['Umbrales'];
export type Editorial = S['Editorial'];
export type Oferta = S['Oferta'];
export type Patrocinio = S['Patrocinio'];
export type FotoPublica = S['FotoPublica'];
export type EstadoDatos = S['EstadoDatos'];
/** The province feeds the town's demand-by-province chart (aggregated and anonymous). */
export type AlertaIn = S['AlertaIn'] & { provincia?: string };
export type ObservacionResultado = S['ObservacionResultado'];
export type Mensaje = S['Mensaje'];
export type Usuario = S['UsuarioOut'];
export type UsuarioIn = S['UsuarioIn'];
export type FuenteAdmin = S['FuenteAdmin'];
export type LogEntrada = S['LogEntrada'];
export type Ejecucion = S['Ejecucion'];
export type PrevisionAdmin = S['PrevisionAdmin'];
export type Comparativa = S['Comparativa'];
export type FotoAdmin = S['FotoAdmin'];
export type SuscripcionResumen = S['SuscripcionResumen'];
export type EmailOut = S['EmailOut'];
export type DestinoConfig = S['DestinoConfig'];
export type DestinoConfigPatch = S['DestinoConfigPatch'];
export type OfertaIn = S['OfertaIn'];
export type OfertaPatch = S['OfertaPatch'];
export type ImportResultado = S['ImportResultado'];

export type Fase = EstadoActual['fase'];
export type FaseActiva = VentanaFase['fase'];
export type TipoDato = VentanaFase['tipoDato'] | 'editorial';
export type Confianza = VentanaFase['confianza'];
export type TipoFenomeno = DestinoResumen['tipo'];
export type Ilustracion = DestinoResumen['ilustracion'];
export type CalidadDato = Zona['calidad'];

/** Everything a UI can ask the backend. Implemented over HTTP (production) and in memory (offline demo). */
export interface Api {
  readonly modo: 'http' | 'mock';
  estadoDatos(): Promise<EstadoDatos>;
  destinos(): Promise<DestinoResumen[]>;
  ficha(id: string, idioma?: string): Promise<DestinoFicha>;
  serie(id: string): Promise<Serie>;
  mapa(fecha?: string): Promise<Mapa>;
  ofertas(destinoId?: string): Promise<Oferta[]>;
  fotos(destinoId?: string): Promise<FotoPublica[]>;
  suscribir(body: AlertaIn): Promise<Mensaje>;
  subirFoto(datos: { foto: File; destinoId: string; fase: FaseActiva; consentimiento: boolean; lat?: number; lon?: number }): Promise<ObservacionResultado>;
  aforo(): Promise<EstadoAforo[]>;
  alternativas(destinoId: string): Promise<Alternativa[]>;
  agenda(destinoId: string): Promise<EventoAgenda[]>;
  /** Business sign-up: the listing goes through automatic moderation and comes back with a verdict. */
  altaNegocio(body: SolicitudNegocioIn): Promise<SolicitudNegocio>;
  contactoDestino(body: ContactoDestinoIn): Promise<Mensaje>;
  /** Businesses of a destination that passed moderation (verified listings). */
  negocios(destinoId: string): Promise<SolicitudNegocio[]>;

  /** Panel for a paying destination (town council, natural park). */
  destino: {
    panel(id: string): Promise<PanelDestino>;
    guardarVisibilidad(id: string, body: Pick<Visibilidad, 'modo' | 'aforoDiario'>): Promise<Visibilidad>;
    guardarAgenda(id: string, agenda: EventoAgenda[]): Promise<EventoAgenda[]>;
    guardarHistoria(id: string, historia: string): Promise<Mensaje>;
    reiniciarDemo(): Promise<Mensaje>;
  };

  login(email: string, password: string): Promise<Usuario>;
  logout(): Promise<void>;
  yo(): Promise<Usuario>;

  admin: {
    fuentes(): Promise<FuenteAdmin[]>;
    log(): Promise<LogEntrada[]>;
    ejecutarIngesta(): Promise<Ejecucion>;
    ejecuciones(): Promise<Ejecucion[]>;
    importar(destinoId: string, dataset: string, archivo: File): Promise<ImportResultado>;
    previsiones(): Promise<PrevisionAdmin[]>;
    recalcular(): Promise<Mensaje>;
    comparativa(): Promise<Comparativa[]>;
    fotos(estado?: string): Promise<FotoAdmin[]>;
    moderar(id: number, estado: 'valida' | 'rechazada', motivo?: string): Promise<FotoAdmin>;
    suscripciones(): Promise<SuscripcionResumen[]>;
    prueba(destinoId: string, fase: FaseActiva): Promise<EmailOut>;
    despachar(): Promise<Mensaje>;
    correos(): Promise<EmailOut[]>;
    destinos(): Promise<DestinoConfig[]>;
    crearDestino(body: DestinoConfig): Promise<Mensaje>;
    editarDestino(id: string, body: DestinoConfigPatch): Promise<Mensaje>;
    editorial(id: string): Promise<Editorial>;
    guardarEditorial(id: string, body: Editorial): Promise<Editorial>;
    guardarPatrocinio(id: string, body: Patrocinio | null): Promise<Patrocinio | null>;
    ofertas(destinoId?: string): Promise<Oferta[]>;
    crearOferta(body: OfertaIn): Promise<Oferta>;
    editarOferta(id: string, body: OfertaPatch): Promise<Oferta>;
    usuarios(): Promise<Usuario[]>;
    crearUsuario(body: UsuarioIn): Promise<Usuario>;
  };
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
