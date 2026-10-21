"""Public API contract (v1). JSON is camelCase; field names follow the spec's data model (§8).

These classes are the single source of truth for the OpenAPI document served at /api/v1/openapi.json.
"""
from __future__ import annotations

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field
from pydantic.alias_generators import to_camel

Fase = Literal['fuera_temporada', 'inicio', 'avance', 'pleno', 'final']
FaseActiva = Literal['inicio', 'avance', 'pleno', 'final']
TipoDato = Literal['observado', 'estimado', 'previsto']
Confianza = Literal['alta', 'media', 'baja']
TipoFenomeno = Literal['floracion', 'color_otonal']
Calidad = Literal['ok', 'nubes', 'sin_dato']
Ilustracion = Literal['haya', 'lavanda', 'cerezo', 'almendro']
Metodo = Literal['dato_proporcionado', 'modelo_v0', 'satelite']


class Model(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)


# ─── Calculated layer ────────────────────────────────────────────────────────
class VentanaFase(Model):
    fase: FaseActiva
    desde: date
    hasta: date
    tipo_dato: TipoDato
    confianza: Confianza
    probabilidad: float = Field(ge=0, le=1)
    metodo: Metodo
    fuente: str


class FechaHabitual(Model):
    fase: FaseActiva
    tipica: str = Field(description='MM-DD')
    rango_min: str
    rango_max: str


class EstadoActual(Model):
    fase: Fase
    tipo_dato: TipoDato
    actualizado_en: datetime
    fuente: str
    resumen: str


class Zona(Model):
    id: str
    nombre: str
    lat: float
    lon: float
    indice: float | None
    calidad: Calidad
    fase: Fase | None
    fecha: date | None = None


class HistoricoMargen(Model):
    generada_en: date
    desde: date
    hasta: date


class PuntoSerie(Model):
    fecha: date
    indice: float | None
    calidad: Calidad
    t_max: float | None


class PuntoPrevisionSerie(Model):
    fecha: date
    p10: float
    p50: float
    p90: float


class Serie(Model):
    puntos: list[PuntoSerie]
    prevision: list[PuntoPrevisionSerie]


class Umbrales(Model):
    inicio: float
    avance: float
    pleno: float
    final: float


class EstadoEnFecha(Model):
    """State of a destination on a given date (observed today, forecast in the future)."""

    fase: Fase
    tipo_dato: TipoDato
    confianza: Confianza
    es_prevision: bool
    transicion: VentanaFase | None = Field(description='The date falls inside the start window of this phase')
    siguiente: VentanaFase | None


# ─── Destinations ────────────────────────────────────────────────────────────
class DestinoResumen(Model):
    """Everything the map, list and cards need."""

    id: str
    nombre: str
    lugar: str
    provincia: str
    region: str
    especie: str
    fenomeno: str
    tipo: TipoFenomeno
    lat: float
    lon: float
    color: str
    ilustracion: Ilustracion
    temporada: str
    fin_temporada: date
    datos_reales: bool
    estado: EstadoActual
    ventanas: list[VentanaFase]
    habituales: list[FechaHabitual]
    entradas_hasta: date | None
    generada_en: datetime | None


class Calculado(Model):
    umbrales: Umbrales
    zonas: list[Zona]
    historico_margen: list[HistoricoMargen]


class Editorial(Model):
    historia: str
    que_ver: list[str]
    como_llegar: str
    acceso: str
    consejos: list[str]
    actualizado_en: datetime | None = None


class Oferta(Model):
    id: str
    destino_id: str
    tipo: Literal['alojamiento', 'actividad']
    nombre: str
    descripcion: str
    distancia_km: float
    precio: str
    url: str | None = None
    patrocinado: bool


class Patrocinio(Model):
    entidad: str
    mensaje: str
    url: str | None = None


class Comercial(Model):
    ofertas: list[Oferta]
    patrocinio: Patrocinio | None


class DestinoFicha(Model):
    """Full destination page, with the three layers in separate blocks (spec §9.1)."""

    destino: DestinoResumen
    calculado: Calculado
    editorial: Editorial | None
    comercial: Comercial


class MapaItem(Model):
    destino_id: str
    estado: EstadoEnFecha


class Mapa(Model):
    fecha: date
    hoy: date
    es_prevision: bool
    destinos: list[MapaItem]


class FotoPublica(Model):
    id: int
    destino_id: str
    lat: float | None
    lon: float | None
    capturada_en: datetime | None
    fase_reportada: FaseActiva
    estado: Literal['valida', 'pendiente', 'rechazada']
    zona: str | None = None
    url: str | None = None


class FuentePublica(Model):
    id: str
    nombre: str
    tipo: str
    ultima_carga: datetime | None
    estado: Literal['ok', 'desactualizado', 'error']


class EstadoDatos(Model):
    hoy: date
    ultima_actualizacion: datetime | None
    fuentes: list[FuentePublica]


# ─── Alerts and citizen photos (public writes) ───────────────────────────────
class AlertaIn(Model):
    email: EmailStr
    destino_id: str
    fase: FaseActiva = 'pleno'
    antelacion_dias: int = Field(7, ge=1, le=30)
    idioma: Literal['es', 'en'] = 'es'
    consentimiento: bool = Field(description='Must be true (GDPR consent, NFR-7)')


class Mensaje(Model):
    ok: bool = True
    mensaje: str


class Comprobacion(Model):
    clave: Literal['ubicacion', 'fecha', 'duplicada', 'limite']
    ok: bool
    detalle: str


class ObservacionResultado(Model):
    id: int
    estado: Literal['valida', 'pendiente', 'rechazada']
    motivo: str | None
    comprobaciones: list[Comprobacion]


# ─── Auth ────────────────────────────────────────────────────────────────────
class LoginIn(Model):
    email: EmailStr
    password: str


class UsuarioOut(Model):
    id: int
    email: str
    nombre: str
    rol: Literal['admin', 'editor']
    activo: bool
    ultimo_acceso: datetime | None = None


class UsuarioIn(Model):
    email: EmailStr
    nombre: str
    rol: Literal['admin', 'editor'] = 'editor'
    password: str = Field(min_length=10)


# ─── Admin ───────────────────────────────────────────────────────────────────
class FuenteAdmin(FuentePublica):
    detalle: str


class LogEntrada(Model):
    hora: datetime
    nivel: Literal['info', 'warn', 'error']
    mensaje: str


class Ejecucion(Model):
    id: int
    origen: str
    iniciada_en: datetime
    terminada_en: datetime | None
    estado: str


class PrevisionAdmin(Model):
    destino_id: str
    destino: str
    tipo: TipoFenomeno
    ventana: VentanaFase
    entradas_hasta: date | None
    generada_en: datetime | None


class Comparativa(Model):
    destino_id: str
    fase: FaseActiva
    proporcionada_desde: date
    proporcionada_hasta: date
    propia_desde: date
    propia_hasta: date
    propia_probabilidad: float
    mae_dias: float | None
    cobertura: float | None
    explicacion: str
    calculada_en: datetime


class FotoAdmin(FotoPublica):
    distancia_km: float | None
    horas: float | None
    motivo: str | None
    revisada_por: str | None
    recibida_en: datetime


class Moderacion(Model):
    estado: Literal['valida', 'rechazada']
    motivo: str | None = None


class SuscripcionResumen(Model):
    destino_id: str
    fase: FaseActiva
    confirmadas: int
    sin_confirmar: int
    proximo_envio: date | None


class PruebaAvisoIn(Model):
    destino_id: str
    fase: FaseActiva = 'pleno'
    para: EmailStr | None = None


class EmailOut(Model):
    id: int
    para: str
    asunto: str
    cuerpo: str
    tipo: str
    backend: str
    estado: str
    creado_en: datetime


class ZonaIn(Model):
    id: str
    nombre: str
    lat: float
    lon: float
    radio_m: int = 250


class DestinoConfig(Model):
    """Adding a destination is configuration, not code (PRIN-2.4)."""

    id: str = Field(pattern=r'^[a-z0-9-]{2,64}$')
    nombre: str
    lugar: str
    provincia: str
    region: str
    especie: str
    fenomeno: str
    tipo: TipoFenomeno
    lat: float = Field(ge=27, le=44.5)
    lon: float = Field(ge=-18.5, le=5)
    color: str = '#6F4FB8'
    ilustracion: Ilustracion = 'cerezo'
    temporada: str
    fin_temporada: date
    datos_reales: bool = False
    activo: bool = True
    umbrales: Umbrales
    aemet_estacion: str | None = None
    aemet_municipio: str | None = None
    usa_satelite: bool = False
    zonas: list[ZonaIn] = []
    habituales: list[FechaHabitual] = []


class DestinoConfigPatch(Model):
    nombre: str | None = None
    activo: bool | None = None
    umbrales: Umbrales | None = None
    aemet_estacion: str | None = None
    aemet_municipio: str | None = None
    usa_satelite: bool | None = None
    temporada: str | None = None
    fin_temporada: date | None = None


class OfertaIn(Model):
    destino_id: str
    tipo: Literal['alojamiento', 'actividad']
    nombre: str
    descripcion: str = ''
    distancia_km: float = 0
    precio: str = ''
    url: str | None = None
    patrocinado: bool = False
    activa: bool = True


class OfertaPatch(Model):
    nombre: str | None = None
    descripcion: str | None = None
    distancia_km: float | None = None
    precio: str | None = None
    url: str | None = None
    patrocinado: bool | None = None
    activa: bool | None = None


class ImportResultado(Model):
    dataset: str
    filas: int
    archivo_id: int
    avisos: list[str]
