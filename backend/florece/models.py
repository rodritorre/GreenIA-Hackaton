"""Database model (spec §8). Three layers are kept apart (PRIN-3.1, MON-3):

- calculated: estado_actual, ventana_fase, comparativa_modelo, serie_prevision, observations
- editorial:  contenido_editorial
- commercial: oferta, patrocinio

Editorial and commercial tables have no write path into the calculated ones.
"""
from __future__ import annotations

from datetime import date, datetime

from geoalchemy2 import Geography
from sqlalchemy import (
    JSON,
    Boolean,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base

TZ = DateTime(timezone=True)


# ─── Admin users ─────────────────────────────────────────────────────────────
class Usuario(Base):
    __tablename__ = 'usuario'
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(254), unique=True, index=True)
    nombre: Mapped[str] = mapped_column(String(120))
    password_hash: Mapped[str] = mapped_column(String(255))
    rol: Mapped[str] = mapped_column(String(16))  # admin | editor
    activo: Mapped[bool] = mapped_column(Boolean, default=True)
    creado_en: Mapped[datetime] = mapped_column(TZ)
    ultimo_acceso: Mapped[datetime | None] = mapped_column(TZ)


class Sesion(Base):
    __tablename__ = 'sesion'
    token_hash: Mapped[str] = mapped_column(String(64), primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey('usuario.id', ondelete='CASCADE'), index=True)
    creada_en: Mapped[datetime] = mapped_column(TZ)
    expira_en: Mapped[datetime] = mapped_column(TZ)
    usuario: Mapped[Usuario] = relationship()


# ─── Destinations and zones ──────────────────────────────────────────────────
class Destino(Base):
    __tablename__ = 'destino'
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    nombre: Mapped[str] = mapped_column(String(160))
    lugar: Mapped[str] = mapped_column(String(160))
    provincia: Mapped[str] = mapped_column(String(120))
    region: Mapped[str] = mapped_column(String(120))
    especie: Mapped[str] = mapped_column(String(160))
    fenomeno: Mapped[str] = mapped_column(String(80))
    tipo: Mapped[str] = mapped_column(String(16))  # floracion | color_otonal
    lat: Mapped[float] = mapped_column(Float)
    lon: Mapped[float] = mapped_column(Float)
    geom = mapped_column(Geography('POINT', srid=4326))
    color: Mapped[str] = mapped_column(String(9))
    ilustracion: Mapped[str] = mapped_column(String(16))
    temporada: Mapped[str] = mapped_column(String(60))
    fin_temporada: Mapped[date] = mapped_column(Date)
    datos_reales: Mapped[bool] = mapped_column(Boolean, default=False)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)
    # Phase thresholds on the colour index (PHA-2), e.g. {"inicio": 0.2, "avance": 0.45, "pleno": 0.7, "final": 0.6}
    umbrales: Mapped[dict] = mapped_column(JSON)
    # Linear calibration from the raw satellite "redness" to the 0–1 colour index: {"r0": …, "r1": …}
    calibracion: Mapped[dict | None] = mapped_column(JSON)
    # Data sources configuration (PRIN-2.4): AEMET station/municipality codes, satellite on/off
    aemet_estacion: Mapped[str | None] = mapped_column(String(16))
    aemet_municipio: Mapped[str | None] = mapped_column(String(16))
    usa_satelite: Mapped[bool] = mapped_column(Boolean, default=False)
    entradas_hasta: Mapped[date | None] = mapped_column(Date)
    generada_en: Mapped[datetime | None] = mapped_column(TZ)

    zonas: Mapped[list[Zona]] = relationship(back_populates='destino', order_by='Zona.orden', cascade='all, delete-orphan')


class Zona(Base):
    __tablename__ = 'zona'
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    destino_id: Mapped[str] = mapped_column(ForeignKey('destino.id', ondelete='CASCADE'), index=True)
    nombre: Mapped[str] = mapped_column(String(120))
    orden: Mapped[int] = mapped_column(Integer, default=0)
    lat: Mapped[float] = mapped_column(Float)
    lon: Mapped[float] = mapped_column(Float)
    # Point for now; a polygon once the organisers share the zone geometries (open question 3)
    geom = mapped_column(Geography('GEOMETRY', srid=4326))
    radio_m: Mapped[int] = mapped_column(Integer, default=250)
    destino: Mapped[Destino] = relationship(back_populates='zonas')


# ─── Observations (raw facts) ────────────────────────────────────────────────
class ObservacionIndice(Base):
    """Satellite colour index per zone and day — an ESTIMATE, not a measurement (HON-1)."""

    __tablename__ = 'observacion_indice'
    __table_args__ = (UniqueConstraint('zona_id', 'fecha', 'fuente'),)
    id: Mapped[int] = mapped_column(primary_key=True)
    zona_id: Mapped[str] = mapped_column(ForeignKey('zona.id', ondelete='CASCADE'), index=True)
    fecha: Mapped[date] = mapped_column(Date, index=True)
    valor: Mapped[float | None] = mapped_column(Float)  # null when there is no data (HON-4)
    calidad: Mapped[str] = mapped_column(String(12))  # ok | nubes | sin_dato
    fuente: Mapped[str] = mapped_column(String(80))
    escena: Mapped[str | None] = mapped_column(String(80))
    ingestado_en: Mapped[datetime] = mapped_column(TZ)


class ObservacionMeteo(Base):
    __tablename__ = 'observacion_meteo'
    __table_args__ = (UniqueConstraint('destino_id', 'fecha', 'fuente'),)
    id: Mapped[int] = mapped_column(primary_key=True)
    destino_id: Mapped[str] = mapped_column(ForeignKey('destino.id', ondelete='CASCADE'), index=True)
    estacion: Mapped[str | None] = mapped_column(String(16))
    fecha: Mapped[date] = mapped_column(Date, index=True)
    t_max: Mapped[float | None] = mapped_column(Float)
    t_min: Mapped[float | None] = mapped_column(Float)
    precip: Mapped[float | None] = mapped_column(Float)
    previsto: Mapped[bool] = mapped_column(Boolean, default=False)
    fuente: Mapped[str] = mapped_column(String(80))
    ingestado_en: Mapped[datetime] = mapped_column(TZ)


# ─── Calculated layer ────────────────────────────────────────────────────────
class FechaHabitual(Base):
    __tablename__ = 'fecha_habitual'
    destino_id: Mapped[str] = mapped_column(ForeignKey('destino.id', ondelete='CASCADE'), primary_key=True)
    fase: Mapped[str] = mapped_column(String(12), primary_key=True)
    tipica: Mapped[str] = mapped_column(String(5))  # MM-DD
    rango_min: Mapped[str] = mapped_column(String(5))
    rango_max: Mapped[str] = mapped_column(String(5))


class VentanaFase(Base):
    """Window in which a phase starts. Always a range (PRIN-1.1). Old rows are kept (vigente=False)
    so the UI can show how the margin narrowed (PRIN-1.3)."""

    __tablename__ = 'ventana_fase'
    id: Mapped[int] = mapped_column(primary_key=True)
    destino_id: Mapped[str] = mapped_column(ForeignKey('destino.id', ondelete='CASCADE'), index=True)
    fase: Mapped[str] = mapped_column(String(12))
    desde: Mapped[date] = mapped_column(Date)
    hasta: Mapped[date] = mapped_column(Date)
    tipo_dato: Mapped[str] = mapped_column(String(12))  # observado | estimado | previsto
    confianza: Mapped[str] = mapped_column(String(8))  # alta | media | baja
    probabilidad: Mapped[float] = mapped_column(Float)
    metodo: Mapped[str] = mapped_column(String(24))  # dato_proporcionado | modelo_v0 | satelite
    fuente: Mapped[str] = mapped_column(String(120))
    generada_en: Mapped[datetime] = mapped_column(TZ)
    vigente: Mapped[bool] = mapped_column(Boolean, default=True, index=True)


class SeriePrevision(Base):
    __tablename__ = 'serie_prevision'
    destino_id: Mapped[str] = mapped_column(ForeignKey('destino.id', ondelete='CASCADE'), primary_key=True)
    fecha: Mapped[date] = mapped_column(Date, primary_key=True)
    p10: Mapped[float] = mapped_column(Float)
    p50: Mapped[float] = mapped_column(Float)
    p90: Mapped[float] = mapped_column(Float)
    generada_en: Mapped[datetime] = mapped_column(TZ)


class EstadoActual(Base):
    __tablename__ = 'estado_actual'
    destino_id: Mapped[str] = mapped_column(ForeignKey('destino.id', ondelete='CASCADE'), primary_key=True)
    fase: Mapped[str] = mapped_column(String(16))
    tipo_dato: Mapped[str] = mapped_column(String(12))
    actualizado_en: Mapped[datetime] = mapped_column(TZ)
    fuente: Mapped[str] = mapped_column(String(120))
    resumen: Mapped[str] = mapped_column(Text, default='')


class ComparativaModelo(Base):
    __tablename__ = 'comparativa_modelo'
    id: Mapped[int] = mapped_column(primary_key=True)
    destino_id: Mapped[str] = mapped_column(ForeignKey('destino.id', ondelete='CASCADE'), index=True)
    fase: Mapped[str] = mapped_column(String(12))
    proporcionada_desde: Mapped[date] = mapped_column(Date)
    proporcionada_hasta: Mapped[date] = mapped_column(Date)
    propia_desde: Mapped[date] = mapped_column(Date)
    propia_hasta: Mapped[date] = mapped_column(Date)
    propia_probabilidad: Mapped[float] = mapped_column(Float)
    mae_dias: Mapped[float | None] = mapped_column(Float)
    cobertura: Mapped[float | None] = mapped_column(Float)
    explicacion: Mapped[str] = mapped_column(Text)
    calculada_en: Mapped[datetime] = mapped_column(TZ)


# ─── Editorial layer ─────────────────────────────────────────────────────────
class ContenidoEditorial(Base):
    __tablename__ = 'contenido_editorial'
    destino_id: Mapped[str] = mapped_column(ForeignKey('destino.id', ondelete='CASCADE'), primary_key=True)
    idioma: Mapped[str] = mapped_column(String(2), primary_key=True, default='es')
    historia: Mapped[str] = mapped_column(Text, default='')
    que_ver: Mapped[list] = mapped_column(JSON, default=list)
    como_llegar: Mapped[str] = mapped_column(Text, default='')
    acceso: Mapped[str] = mapped_column(Text, default='')
    consejos: Mapped[list] = mapped_column(JSON, default=list)
    actualizado_en: Mapped[datetime | None] = mapped_column(TZ)
    actualizado_por: Mapped[str | None] = mapped_column(String(254))


# ─── Commercial layer ────────────────────────────────────────────────────────
class Oferta(Base):
    __tablename__ = 'oferta'
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    destino_id: Mapped[str] = mapped_column(ForeignKey('destino.id', ondelete='CASCADE'), index=True)
    tipo: Mapped[str] = mapped_column(String(16))  # alojamiento | actividad
    nombre: Mapped[str] = mapped_column(String(160))
    descripcion: Mapped[str] = mapped_column(Text, default='')
    distancia_km: Mapped[float] = mapped_column(Float, default=0)
    precio: Mapped[str] = mapped_column(String(40), default='')
    url: Mapped[str | None] = mapped_column(String(500))
    patrocinado: Mapped[bool] = mapped_column(Boolean, default=False)
    activa: Mapped[bool] = mapped_column(Boolean, default=True)


class Patrocinio(Base):
    __tablename__ = 'patrocinio'
    destino_id: Mapped[str] = mapped_column(ForeignKey('destino.id', ondelete='CASCADE'), primary_key=True)
    entidad: Mapped[str] = mapped_column(String(160))
    mensaje: Mapped[str] = mapped_column(Text, default='')
    url: Mapped[str | None] = mapped_column(String(500))


# ─── Alerts (EXT-3) ──────────────────────────────────────────────────────────
class Alerta(Base):
    __tablename__ = 'alerta'
    __table_args__ = (UniqueConstraint('email', 'destino_id', 'fase'),)
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(254), index=True)
    destino_id: Mapped[str] = mapped_column(ForeignKey('destino.id', ondelete='CASCADE'), index=True)
    fase: Mapped[str] = mapped_column(String(12))
    antelacion_dias: Mapped[int] = mapped_column(Integer, default=7)
    idioma: Mapped[str] = mapped_column(String(2), default='es')
    token: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    confirmada: Mapped[bool] = mapped_column(Boolean, default=False)
    creada_en: Mapped[datetime] = mapped_column(TZ)
    confirmada_en: Mapped[datetime | None] = mapped_column(TZ)
    baja_en: Mapped[datetime | None] = mapped_column(TZ)
    # Which phase window (by its start date) the last notice was about, so each season is notified once
    ultimo_aviso_para: Mapped[date | None] = mapped_column(Date)
    enviada_en: Mapped[datetime | None] = mapped_column(TZ)


class EmailOutbox(Base):
    """Every email the system sends. With the mock backend this is the only place they go."""

    __tablename__ = 'email_outbox'
    id: Mapped[int] = mapped_column(primary_key=True)
    para: Mapped[str] = mapped_column(String(254), index=True)
    asunto: Mapped[str] = mapped_column(String(300))
    cuerpo: Mapped[str] = mapped_column(Text)
    tipo: Mapped[str] = mapped_column(String(16))  # confirmacion | aviso | prueba
    backend: Mapped[str] = mapped_column(String(16))
    estado: Mapped[str] = mapped_column(String(12))  # enviado | simulado | error
    creado_en: Mapped[datetime] = mapped_column(TZ)


# ─── Citizen observations (EXT-2) ────────────────────────────────────────────
class ObservacionCiudadana(Base):
    __tablename__ = 'observacion_ciudadana'
    id: Mapped[int] = mapped_column(primary_key=True)
    destino_id: Mapped[str] = mapped_column(ForeignKey('destino.id', ondelete='CASCADE'), index=True)
    zona_id: Mapped[str | None] = mapped_column(ForeignKey('zona.id', ondelete='SET NULL'))
    zona_nombre: Mapped[str | None] = mapped_column(String(120))
    foto_ruta: Mapped[str | None] = mapped_column(String(300))
    foto_sha256: Mapped[str | None] = mapped_column(String(64), index=True)
    foto_ahash: Mapped[str | None] = mapped_column(String(16), index=True)
    lat: Mapped[float | None] = mapped_column(Float)
    lon: Mapped[float | None] = mapped_column(Float)
    geom = mapped_column(Geography('POINT', srid=4326), nullable=True)
    capturada_en: Mapped[datetime | None] = mapped_column(TZ)
    recibida_en: Mapped[datetime] = mapped_column(TZ)
    fase_reportada: Mapped[str] = mapped_column(String(12))
    distancia_km: Mapped[float | None] = mapped_column(Float)
    horas: Mapped[float | None] = mapped_column(Float)
    estado: Mapped[str] = mapped_column(String(12))  # pendiente | valida | rechazada
    motivo: Mapped[str | None] = mapped_column(String(24))  # lejos | antigua | sin_gps | duplicada | limite
    cliente_hash: Mapped[str | None] = mapped_column(String(64), index=True)
    revisada_por: Mapped[str | None] = mapped_column(String(254))
    revisada_en: Mapped[datetime | None] = mapped_column(TZ)


# ─── Data sources and ingestion ──────────────────────────────────────────────
class FuenteEstado(Base):
    __tablename__ = 'fuente_estado'
    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    nombre: Mapped[str] = mapped_column(String(120))
    tipo: Mapped[str] = mapped_column(String(16))  # meteo | satelite | proporcionado | editorial
    ultima_carga: Mapped[datetime | None] = mapped_column(TZ)
    estado: Mapped[str] = mapped_column(String(16))  # ok | desactualizado | error
    detalle: Mapped[str] = mapped_column(Text, default='')


class IngestaEjecucion(Base):
    __tablename__ = 'ingesta_ejecucion'
    id: Mapped[int] = mapped_column(primary_key=True)
    origen: Mapped[str] = mapped_column(String(12))  # cron | manual | cli
    iniciada_en: Mapped[datetime] = mapped_column(TZ)
    terminada_en: Mapped[datetime | None] = mapped_column(TZ)
    estado: Mapped[str] = mapped_column(String(12))  # en_curso | ok | parcial | error


class IngestaLog(Base):
    __tablename__ = 'ingesta_log'
    id: Mapped[int] = mapped_column(primary_key=True)
    ejecucion_id: Mapped[int | None] = mapped_column(ForeignKey('ingesta_ejecucion.id', ondelete='CASCADE'), index=True)
    hora: Mapped[datetime] = mapped_column(TZ, index=True)
    nivel: Mapped[str] = mapped_column(String(8))  # info | warn | error
    mensaje: Mapped[str] = mapped_column(Text)


class ArchivoCrudo(Base):
    """Provenance of every imported raw file (DATA-2, DATA-5). The file itself is kept untouched on disk."""

    __tablename__ = 'archivo_crudo'
    id: Mapped[int] = mapped_column(primary_key=True)
    destino_id: Mapped[str] = mapped_column(ForeignKey('destino.id', ondelete='CASCADE'), index=True)
    dataset: Mapped[str] = mapped_column(String(24))  # indice | temperaturas | habituales | prevision
    nombre: Mapped[str] = mapped_column(String(255))
    sha256: Mapped[str] = mapped_column(String(64))
    ruta: Mapped[str] = mapped_column(String(400))
    filas: Mapped[int] = mapped_column(Integer)
    subido_en: Mapped[datetime] = mapped_column(TZ)
    subido_por: Mapped[str | None] = mapped_column(String(254))
