// UI-facing names for the API contract. schema.d.ts is generated from the backend's OpenAPI
// document (`npm run api:types`); never edit it by hand.
import type { components } from './schema';

type S = components['schemas'];

export type DestinoResumen = S['DestinoResumen'];
export type DestinoFicha = S['DestinoFicha'];
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
export type AlertaIn = S['AlertaIn'];
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
