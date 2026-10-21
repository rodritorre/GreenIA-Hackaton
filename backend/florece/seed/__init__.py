"""Initial data. `seed(db, demo=False)` loads destinations, zones, usual dates, editorial content,
offers and sponsors from fixture.json (exported from the front end's mock data).
With demo=True it also loads the sample observations, forecasts and photos so the site looks like
the mockup until the organisers' real datasets are imported.
"""
from __future__ import annotations

import json
from datetime import date, datetime, timedelta
from pathlib import Path

from sqlalchemy import delete
from sqlalchemy.orm import Session

from .. import models as m
from ..db import now

FIXTURE = Path(__file__).with_name('fixture.json')
DEMO = 'Datos de ejemplo'

FUENTES = [
    ('aemet', 'AEMET OpenData', 'meteo', 'Máximas observadas y previstas a 7 días.'),
    ('sentinel', 'Copernicus Sentinel-2', 'satelite', 'Índice de color por zona.'),
    ('greenia', 'Datos proporcionados (Greenia)', 'proporcionado', 'Tejera Negra (DAT-1…4) y Brihuega (DAT-5).'),
    ('editorial', 'Contenido de los destinos', 'editorial', 'Historia, qué ver, accesos y consejos.'),
]


def _d(s: str) -> date:
    return date.fromisoformat(s[:10])


def _dt(s: str) -> datetime:
    return datetime.fromisoformat(s)


def seed(db: Session, demo: bool = False) -> dict:
    data = json.loads(FIXTURE.read_text())
    for tabla in (m.Destino, m.FuenteEstado):
        db.execute(delete(tabla))
    for id_, nombre, tipo, detalle in FUENTES:
        db.add(m.FuenteEstado(id=id_, nombre=nombre, tipo=tipo, estado='desactualizado', detalle=detalle))

    for x in data['destinos']:
        d = m.Destino(
            id=x['id'], nombre=x['nombre'], lugar=x['lugar'], provincia=x['provincia'], region=x['region'],
            especie=x['especie'], fenomeno=x['fenomeno'], tipo=x['tipo'], lat=x['lat'], lon=x['lon'],
            geom=f'SRID=4326;POINT({x["lon"]} {x["lat"]})', color=x['color'], ilustracion=x['ilustracion'],
            temporada=x['temporada'], fin_temporada=_d(x['finTemporada']), datos_reales=x['datosReales'], activo=True,
            umbrales=x['umbrales'], usa_satelite=False,
        )
        for i, z in enumerate(x.get('zonas') or []):
            d.zonas.append(m.Zona(id=f'{x["id"]}-{z["id"]}', nombre=z['nombre'], orden=i, lat=z['lat'], lon=z['lon'],
                                  geom=f'SRID=4326;POINT({z["lon"]} {z["lat"]})'))
        db.add(d)
        db.flush()  # rows below reference the destination without an ORM relationship
        for h in x['habituales']:
            db.add(m.FechaHabitual(destino_id=d.id, fase=h['fase'], tipica=h['tipica'], rango_min=h['rangoMin'], rango_max=h['rangoMax']))
        e = x['editorial']
        db.add(m.ContenidoEditorial(destino_id=d.id, idioma='es', historia=e['historia'], que_ver=e['queVer'],
                                    como_llegar=e['comoLlegar'], acceso=e['acceso'], consejos=e['consejos'], actualizado_en=now()))
        if x.get('patrocinio'):
            db.add(m.Patrocinio(destino_id=d.id, entidad=x['patrocinio']['entidad'], mensaje=x['patrocinio']['mensaje']))
        if demo:
            _demo_destino(db, d, x)

    for o in data['ofertas']:
        db.add(m.Oferta(id=o['id'], destino_id=o['destinoId'], tipo=o['tipo'], nombre=o['nombre'], descripcion=o['descripcion'],
                        distancia_km=o['distanciaKm'], precio=o['precio'], patrocinado=o['patrocinado'], activa=True))
    if demo:
        _demo_global(db, data)
    db.commit()
    return {'destinos': len(data['destinos']), 'ofertas': len(data['ofertas']), 'demo': demo}


def _demo_destino(db: Session, d: m.Destino, x: dict) -> None:
    gen = _dt(x['generadaEn'])
    d.entradas_hasta, d.generada_en = _d(x['entradasHasta']), gen
    db.add(m.EstadoActual(destino_id=d.id, fase=x['estado']['fase'], tipo_dato=x['estado']['tipoDato'],
                          actualizado_en=_dt(x['estado']['actualizadoEn']), fuente=x['estado']['fuente'], resumen=x['estado']['resumen']))
    for v in x['ventanas']:
        db.add(m.VentanaFase(destino_id=d.id, fase=v['fase'], desde=_d(v['desde']), hasta=_d(v['hasta']), tipo_dato=v['tipoDato'],
                             confianza=v['confianza'], probabilidad=v['probabilidad'], metodo=v['metodo'], fuente=v['fuente'],
                             generada_en=gen, vigente=True))
    pleno = next(v for v in x['ventanas'] if v['fase'] == 'pleno')
    for h in x.get('historicoMargen') or []:
        g = datetime.combine(_d(h['generadaEn']), datetime.min.time(), gen.tzinfo)
        db.add(m.VentanaFase(destino_id=d.id, fase='pleno', desde=_d(h['desde']), hasta=_d(h['hasta']), tipo_dato='previsto',
                             confianza='baja', probabilidad=pleno['probabilidad'], metodo=pleno['metodo'], fuente=pleno['fuente'],
                             generada_en=g, vigente=False))
    serie = x.get('serie') or []
    zonas = x.get('zonas') or []
    if serie and zonas:
        # The mock series is the mean of the zones; spread it over the zones so each ends at its own value
        ultimo = next(p['indice'] for p in reversed(serie) if p['indice'] is not None)
        for z in zonas:
            zid = f'{d.id}-{z["id"]}'
            delta = (z['indice'] - ultimo) if z['indice'] is not None else 0
            for p in serie:
                nubes = p['indice'] is None or (z['indice'] is None and p is serie[-1])
                v = None if nubes else round(min(1, max(0, p['indice'] + delta * (serie.index(p) / len(serie)))), 3)
                db.add(m.ObservacionIndice(zona_id=zid, fecha=_d(p['fecha']), valor=v, calidad='nubes' if nubes else 'ok',
                                           fuente=DEMO, ingestado_en=gen))
        for p in serie:
            db.add(m.ObservacionMeteo(destino_id=d.id, fecha=_d(p['fecha']), t_max=p['tMax'], previsto=False, fuente=DEMO, ingestado_en=gen))
    for p in x.get('serieprevision') or []:
        db.add(m.SeriePrevision(destino_id=d.id, fecha=_d(p['fecha']), p10=p['p10'], p50=p['p50'], p90=p['p90'], generada_en=gen))
    c = x.get('comparativa')
    if c:
        db.add(m.ComparativaModelo(
            destino_id=d.id, fase=c['fase'], proporcionada_desde=_d(c['proporcionada']['desde']),
            proporcionada_hasta=_d(c['proporcionada']['hasta']), propia_desde=_d(c['propia']['desde']),
            propia_hasta=_d(c['propia']['hasta']), propia_probabilidad=c['propia']['probabilidad'], mae_dias=c['maeDias'],
            cobertura=c['cobertura'], explicacion=c['explicacion'], calculada_en=gen))


def _demo_global(db: Session, data: dict) -> None:
    for f in data['fotos']:
        db.flush()
        zona = None
        if f.get('zona'):
            num = f['zona'].split()[-1]
            zona = f'{f["destinoId"]}-z{num}'
        db.add(m.ObservacionCiudadana(
            destino_id=f['destinoId'], zona_id=zona, zona_nombre=f.get('zona'), lat=f['lat'], lon=f['lon'],
            geom=f'SRID=4326;POINT({f["lon"]} {f["lat"]})', capturada_en=_dt(f['capturadaEn']),
            recibida_en=_dt(f['capturadaEn']) + timedelta(minutes=5), fase_reportada=f['faseReportada'],
            distancia_km=f.get('distanciaKm'), horas=f.get('horas'), estado=f['estado'], motivo=f.get('motivo'),
        ))
    for fu in data['fuentes']:
        row = db.get(m.FuenteEstado, fu['id'])
        if row:
            row.ultima_carga, row.estado, row.detalle = _dt(fu['ultimaCarga']), fu['estado'], fu['detalle']
    ej = m.IngestaEjecucion(origen='cron', iniciada_en=_dt(data['ultimaActualizacion']) - timedelta(hours=1),
                            terminada_en=_dt(data['ultimaActualizacion']), estado='parcial')
    db.add(ej)
    db.flush()
    base = _dt(data['ultimaActualizacion'])
    for e in data['log']:
        hh, mm = map(int, e['hora'].split(':'))
        db.add(m.IngestaLog(ejecucion_id=ej.id, hora=base.replace(hour=hh, minute=mm), nivel=e['nivel'], mensaje=e['mensaje']))
