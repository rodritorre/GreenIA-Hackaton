"""Read side: builds API responses from the database."""
from __future__ import annotations

from datetime import UTC, date, datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .. import models as m
from .. import schemas as s
from .fenologia import estado_en, fase_por_indice


def ventanas_vigentes(db: Session, destino_id: str | None = None) -> dict[str, list[m.VentanaFase]]:
    q = select(m.VentanaFase).where(m.VentanaFase.vigente.is_(True))
    if destino_id:
        q = q.where(m.VentanaFase.destino_id == destino_id)
    out: dict[str, list[m.VentanaFase]] = {}
    for v in db.scalars(q.order_by(m.VentanaFase.desde)):
        out.setdefault(v.destino_id, []).append(v)
    return out


def _estado_por_defecto(d: m.Destino) -> s.EstadoActual:
    return s.EstadoActual(fase='fuera_temporada', tipo_dato='previsto', actualizado_en=d.generada_en or datetime(2000, 1, 1, tzinfo=UTC),
                          fuente='Sin datos todavía', resumen='')


def resumen(db: Session, d: m.Destino, ventanas: list[m.VentanaFase] | None = None) -> s.DestinoResumen:
    if ventanas is None:
        ventanas = ventanas_vigentes(db, d.id).get(d.id, [])
    actual = db.get(m.EstadoActual, d.id)
    habituales = db.scalars(select(m.FechaHabitual).where(m.FechaHabitual.destino_id == d.id)).all()
    orden = ['inicio', 'avance', 'pleno', 'final']
    return s.DestinoResumen(
        id=d.id, nombre=d.nombre, lugar=d.lugar, provincia=d.provincia, region=d.region, especie=d.especie,
        fenomeno=d.fenomeno, tipo=d.tipo, lat=d.lat, lon=d.lon, color=d.color, ilustracion=d.ilustracion,
        temporada=d.temporada, fin_temporada=d.fin_temporada, datos_reales=d.datos_reales,
        estado=s.EstadoActual.model_validate(actual) if actual else _estado_por_defecto(d),
        ventanas=[s.VentanaFase.model_validate(v) for v in sorted(ventanas, key=lambda v: orden.index(v.fase))],
        habituales=[s.FechaHabitual.model_validate(h) for h in sorted(habituales, key=lambda h: orden.index(h.fase))],
        entradas_hasta=d.entradas_hasta, generada_en=d.generada_en,
    )


def destinos_activos(db: Session) -> list[m.Destino]:
    return list(db.scalars(select(m.Destino).where(m.Destino.activo.is_(True)).order_by(m.Destino.nombre)))


def lista_destinos(db: Session) -> list[s.DestinoResumen]:
    vent = ventanas_vigentes(db)
    return [resumen(db, d, vent.get(d.id, [])) for d in destinos_activos(db)]


def zonas_actuales(db: Session, d: m.Destino) -> list[s.Zona]:
    out = []
    for z in d.zonas:
        obs = db.scalars(
            select(m.ObservacionIndice).where(m.ObservacionIndice.zona_id == z.id).order_by(m.ObservacionIndice.fecha.desc()).limit(1)
        ).first()
        valor = obs.valor if obs else None
        out.append(s.Zona(
            id=z.id, nombre=z.nombre, lat=z.lat, lon=z.lon, indice=valor,
            calidad=obs.calidad if obs else 'sin_dato',
            fase=fase_por_indice(valor, d.umbrales),
            fecha=obs.fecha if obs else None,
        ))
    return out


def historico_margen(db: Session, destino_id: str, fase: str = 'pleno') -> list[s.HistoricoMargen]:
    rows = db.scalars(
        select(m.VentanaFase)
        .where(m.VentanaFase.destino_id == destino_id, m.VentanaFase.fase == fase, m.VentanaFase.tipo_dato == 'previsto')
        .order_by(m.VentanaFase.generada_en)
    ).all()
    # one snapshot per day, the last one computed that day
    por_dia: dict[date, m.VentanaFase] = {}
    for v in rows:
        por_dia[v.generada_en.date()] = v
    return [s.HistoricoMargen(generada_en=k, desde=v.desde, hasta=v.hasta) for k, v in sorted(por_dia.items())]


def ofertas(db: Session, destino_id: str | None = None, solo_activas: bool = True) -> list[s.Oferta]:
    q = select(m.Oferta)
    if destino_id:
        q = q.where(m.Oferta.destino_id == destino_id)
    if solo_activas:
        q = q.where(m.Oferta.activa.is_(True))
    return [s.Oferta.model_validate(o) for o in db.scalars(q.order_by(m.Oferta.patrocinado.desc(), m.Oferta.nombre))]


def ficha(db: Session, d: m.Destino, idioma: str = 'es') -> s.DestinoFicha:
    ed = db.get(m.ContenidoEditorial, (d.id, idioma)) or db.get(m.ContenidoEditorial, (d.id, 'es'))
    pat = db.get(m.Patrocinio, d.id)
    return s.DestinoFicha(
        destino=resumen(db, d),
        calculado=s.Calculado(
            umbrales=s.Umbrales(**d.umbrales),
            zonas=zonas_actuales(db, d),
            historico_margen=historico_margen(db, d.id),
        ),
        editorial=s.Editorial.model_validate(ed) if ed else None,
        comercial=s.Comercial(ofertas=ofertas(db, d.id), patrocinio=s.Patrocinio.model_validate(pat) if pat else None),
    )


def serie(db: Session, d: m.Destino, desde: date | None, hasta: date | None) -> s.Serie:
    """Daily colour index (mean of the destination's zones, only over zones with data) and max temperature."""
    q = (
        select(m.ObservacionIndice.fecha, func.avg(m.ObservacionIndice.valor), func.count(m.ObservacionIndice.valor))
        .join(m.Zona, m.Zona.id == m.ObservacionIndice.zona_id)
        .where(m.Zona.destino_id == d.id)
        .group_by(m.ObservacionIndice.fecha)
    )
    if desde:
        q = q.where(m.ObservacionIndice.fecha >= desde)
    if hasta:
        q = q.where(m.ObservacionIndice.fecha <= hasta)
    indices = {f: (avg, n) for f, avg, n in db.execute(q)}
    tq = select(m.ObservacionMeteo).where(m.ObservacionMeteo.destino_id == d.id, m.ObservacionMeteo.previsto.is_(False))
    temps = {t.fecha: t.t_max for t in db.scalars(tq)}
    fechas = sorted(set(indices) | {f for f in temps if (not desde or f >= desde) and (not hasta or f <= hasta)})
    puntos = []
    for f in fechas:
        avg, n = indices.get(f, (None, 0))
        puntos.append(s.PuntoSerie(
            fecha=f, indice=round(avg, 3) if n else None, calidad='ok' if n else ('nubes' if f in indices else 'sin_dato'),
            t_max=temps.get(f),
        ))
    prev = db.scalars(select(m.SeriePrevision).where(m.SeriePrevision.destino_id == d.id).order_by(m.SeriePrevision.fecha))
    return s.Serie(puntos=puntos, prevision=[s.PuntoPrevisionSerie.model_validate(p) for p in prev])


def mapa(db: Session, fecha: date, hoy: date) -> s.Mapa:
    vent = ventanas_vigentes(db)
    items = []
    for d in destinos_activos(db):
        e = estado_en(vent.get(d.id, []), d.fin_temporada, db.get(m.EstadoActual, d.id), hoy, fecha)
        items.append(s.MapaItem(destino_id=d.id, estado=s.EstadoEnFecha(
            fase=e.fase, tipo_dato=e.tipo_dato, confianza=e.confianza, es_prevision=e.es_prevision,
            transicion=s.VentanaFase.model_validate(e.transicion) if e.transicion else None,
            siguiente=s.VentanaFase.model_validate(e.siguiente) if e.siguiente else None,
        )))
    return s.Mapa(fecha=fecha, hoy=hoy, es_prevision=fecha > hoy, destinos=items)


def foto_publica(f: m.ObservacionCiudadana) -> s.FotoPublica:
    return s.FotoPublica(
        id=f.id, destino_id=f.destino_id, lat=f.lat, lon=f.lon, capturada_en=f.capturada_en,
        fase_reportada=f.fase_reportada, estado=f.estado, zona=f.zona_nombre,
        url=f'/api/v1/fotos/{f.id}/imagen' if f.foto_ruta else None,
    )


def estado_datos(db: Session, hoy: date) -> s.EstadoDatos:
    fuentes = db.scalars(select(m.FuenteEstado).order_by(m.FuenteEstado.id)).all()
    ultima = max((f.ultima_carga for f in fuentes if f.ultima_carga), default=None)
    return s.EstadoDatos(hoy=hoy, ultima_actualizacion=ultima, fuentes=[s.FuentePublica.model_validate(f) for f in fuentes])
