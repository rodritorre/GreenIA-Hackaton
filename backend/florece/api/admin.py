"""Internal panel endpoints (Greenia staff). Every route needs a session; some need the admin role."""
from __future__ import annotations

from datetime import timedelta

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy import delete, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .. import models as m
from .. import schemas as s
from ..db import SessionLocal, now, today
from ..services import alertas, auth, consultas, correo, importar, modelo
from ..services.ingesta import runner
from .deps import Db, editor, solo_admin

router = APIRouter(prefix='/admin', tags=['admin'])


def _destino(db: Session, id_: str) -> m.Destino:
    d = db.get(m.Destino, id_)
    if d is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, 'Destino no encontrado')
    return d


# ─── Data and ingestion ──────────────────────────────────────────────────────
@router.get('/fuentes', response_model=list[s.FuenteAdmin], summary='Estado de cada fuente de datos')
def fuentes(db: Session = Db, _=Depends(editor)):
    return db.scalars(select(m.FuenteEstado).order_by(m.FuenteEstado.id)).all()


@router.get('/ingesta/log', response_model=list[s.LogEntrada], summary='Registro de ingesta (últimas 24 h)')
def log(horas: int = Query(24, le=24 * 30), db: Session = Db, _=Depends(editor)):
    return db.scalars(select(m.IngestaLog).where(m.IngestaLog.hora >= now() - timedelta(hours=horas)).order_by(m.IngestaLog.hora)).all()


@router.get('/ingesta/ejecuciones', response_model=list[s.Ejecucion], summary='Últimas ejecuciones de la ingesta')
def ejecuciones(db: Session = Db, _=Depends(editor)):
    return db.scalars(select(m.IngestaEjecucion).order_by(m.IngestaEjecucion.iniciada_en.desc()).limit(20)).all()


def _ingesta_en_segundo_plano(ej_id: int) -> None:
    with SessionLocal() as db:
        db.delete(db.get(m.IngestaEjecucion, ej_id))  # placeholder row; the runner creates the real one
        db.commit()
        runner.ejecutar(db, 'manual')


@router.post('/ingesta/ejecutar', response_model=s.Ejecucion, status_code=status.HTTP_202_ACCEPTED,
             summary='Ejecutar la ingesta ahora (el mismo código que el job diario)')
def ejecutar(background: BackgroundTasks, db: Session = Db, _=Depends(solo_admin)):
    en_curso = db.scalar(select(m.IngestaEjecucion).where(m.IngestaEjecucion.estado == 'en_curso',
                                                          m.IngestaEjecucion.iniciada_en > now() - timedelta(hours=1)))
    if en_curso:
        raise HTTPException(status.HTTP_409_CONFLICT, 'Ya hay una ingesta en curso')
    ej = m.IngestaEjecucion(origen='manual', iniciada_en=now(), estado='en_curso')
    db.add(ej)
    db.commit()
    background.add_task(_ingesta_en_segundo_plano, ej.id)
    return ej


@router.post('/importar', response_model=s.ImportResultado, summary='Importar un dataset proporcionado (CSV)')
async def importar_csv(
    destino_id: str = Form(..., alias='destinoId'),
    dataset: str = Form(..., description=', '.join(importar.DATASETS)),
    archivo: UploadFile = File(...),
    recalcular: bool = Form(True),
    db: Session = Db,
    u: m.Usuario = Depends(solo_admin),
):
    d = _destino(db, destino_id)
    try:
        arch, avisos = importar.importar(db, d, dataset, archivo.filename or 'datos.csv', await archivo.read(), u.email)
    except importar.ErrorImportacion as e:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, str(e)) from None
    if recalcular:
        modelo.recalcular(db, d, today())
        db.commit()
    return s.ImportResultado(dataset=dataset, filas=arch.filas, archivo_id=arch.id, avisos=avisos)


# ─── Forecasts ───────────────────────────────────────────────────────────────
@router.get('/previsiones', response_model=list[s.PrevisionAdmin], summary='Ventanas vigentes de todos los destinos')
def previsiones(db: Session = Db, _=Depends(editor)):
    vent = consultas.ventanas_vigentes(db)
    out = []
    for d in db.scalars(select(m.Destino).order_by(m.Destino.nombre)):
        for v in vent.get(d.id, []):
            out.append(s.PrevisionAdmin(destino_id=d.id, destino=d.nombre, tipo=d.tipo, ventana=s.VentanaFase.model_validate(v),
                                        entradas_hasta=d.entradas_hasta, generada_en=d.generada_en))
    return out


@router.post('/previsiones/recalcular', response_model=s.Mensaje, summary='Recalcular estados y previsiones')
def recalcular(db: Session = Db, _=Depends(solo_admin)):
    res = modelo.recalcular_todo(db, today())
    return s.Mensaje(mensaje=f'Previsiones recalculadas: {len(res)} destinos')


@router.get('/previsiones/comparativa', response_model=list[s.Comparativa], summary='Nuestro modelo frente a la previsión proporcionada')
def comparativa(db: Session = Db, _=Depends(editor)):
    return db.scalars(select(m.ComparativaModelo).order_by(m.ComparativaModelo.destino_id)).all()


# ─── Photo moderation ────────────────────────────────────────────────────────
def _foto_admin(f: m.ObservacionCiudadana) -> s.FotoAdmin:
    base = consultas.foto_publica(f).model_dump()
    base['url'] = f'/api/v1/admin/fotos/{f.id}/imagen' if f.foto_ruta else None
    return s.FotoAdmin(**base, distancia_km=f.distancia_km, horas=f.horas, motivo=f.motivo, revisada_por=f.revisada_por,
                       recibida_en=f.recibida_en)


@router.get('/fotos', response_model=list[s.FotoAdmin], summary='Cola de moderación')
def fotos(estado: str | None = Query(None, pattern='^(pendiente|valida|rechazada)$'), db: Session = Db, _=Depends(editor)):
    q = select(m.ObservacionCiudadana)
    if estado:
        q = q.where(m.ObservacionCiudadana.estado == estado)
    orden = {'pendiente': 0, 'rechazada': 1, 'valida': 2}
    rows = sorted(db.scalars(q.order_by(m.ObservacionCiudadana.recibida_en.desc()).limit(500)), key=lambda f: orden[f.estado])
    return [_foto_admin(f) for f in rows]


@router.get('/fotos/{foto_id}/imagen', summary='Imagen de cualquier foto (moderación)')
def foto_imagen(foto_id: int, db: Session = Db, _=Depends(editor)):
    from fastapi.responses import FileResponse

    f = db.get(m.ObservacionCiudadana, foto_id)
    if f is None or not f.foto_ruta:
        raise HTTPException(status.HTTP_404_NOT_FOUND, 'Foto no disponible')
    return FileResponse(f.foto_ruta, media_type='image/jpeg')


@router.post('/fotos/{foto_id}/moderar', response_model=s.FotoAdmin, summary='Aprobar o rechazar una foto')
def moderar(foto_id: int, body: s.Moderacion, db: Session = Db, u: m.Usuario = Depends(editor)):
    f = db.get(m.ObservacionCiudadana, foto_id)
    if f is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, 'Foto no encontrada')
    f.estado, f.motivo = body.estado, body.motivo if body.estado == 'rechazada' else None
    f.revisada_por, f.revisada_en = u.email, now()
    db.commit()
    return _foto_admin(f)


# ─── Alerts ──────────────────────────────────────────────────────────────────
@router.get('/alertas/suscripciones', response_model=list[s.SuscripcionResumen], summary='Suscripciones por destino y fase')
def suscripciones(db: Session = Db, _=Depends(editor)):
    rows = db.execute(
        select(m.Alerta.destino_id, m.Alerta.fase,
               func.count().filter(m.Alerta.confirmada.is_(True)), func.count().filter(m.Alerta.confirmada.is_(False)),
               func.min(m.Alerta.antelacion_dias))
        .where(m.Alerta.baja_en.is_(None)).group_by(m.Alerta.destino_id, m.Alerta.fase)
    ).all()
    vent = consultas.ventanas_vigentes(db)
    out = []
    for destino_id, fase, conf, sin, antel in rows:
        v = next((w for w in vent.get(destino_id, []) if w.fase == fase), None)
        out.append(s.SuscripcionResumen(destino_id=destino_id, fase=fase, confirmadas=conf, sin_confirmar=sin,
                                        proximo_envio=(v.desde - timedelta(days=antel)) if v else None))
    return out


@router.post('/alertas/prueba', response_model=s.EmailOut, summary='Enviar un aviso de prueba (se ve en la bandeja de salida)')
def prueba(body: s.PruebaAvisoIn, db: Session = Db, u: m.Usuario = Depends(editor)):
    d = _destino(db, body.destino_id)
    v = db.scalar(select(m.VentanaFase).where(m.VentanaFase.destino_id == d.id, m.VentanaFase.fase == body.fase,
                                              m.VentanaFase.vigente.is_(True)))
    if v is None:
        raise HTTPException(status.HTTP_409_CONFLICT, 'Ese destino no tiene previsión para esa fase')
    asunto, cuerpo = alertas.cuerpo_aviso(db, d, v, 7, None)
    msg = correo.enviar(db, body.para or u.email, f'[PRUEBA] {asunto}', cuerpo, 'prueba')
    db.commit()
    return msg


@router.post('/alertas/despachar', response_model=s.Mensaje, summary='Ejecutar ahora el envío diario de avisos')
def despachar(db: Session = Db, _=Depends(solo_admin)):
    n = alertas.despachar(db, today())
    return s.Mensaje(mensaje=f'{n} avisos enviados')


@router.get('/correos', response_model=list[s.EmailOut], summary='Bandeja de salida (todos los emails enviados o simulados)')
def correos(db: Session = Db, _=Depends(editor)):
    return db.scalars(select(m.EmailOutbox).order_by(m.EmailOutbox.creado_en.desc()).limit(100)).all()


# ─── Destinations (configuration) ────────────────────────────────────────────
@router.get('/destinos', response_model=list[s.DestinoConfig], summary='Configuración de todos los destinos')
def destinos(db: Session = Db, _=Depends(editor)):
    out = []
    for d in db.scalars(select(m.Destino).order_by(m.Destino.nombre)):
        hab = db.scalars(select(m.FechaHabitual).where(m.FechaHabitual.destino_id == d.id)).all()
        out.append(s.DestinoConfig(
            id=d.id, nombre=d.nombre, lugar=d.lugar, provincia=d.provincia, region=d.region, especie=d.especie, fenomeno=d.fenomeno,
            tipo=d.tipo, lat=d.lat, lon=d.lon, color=d.color, ilustracion=d.ilustracion, temporada=d.temporada,
            fin_temporada=d.fin_temporada, datos_reales=d.datos_reales, activo=d.activo, umbrales=s.Umbrales(**d.umbrales),
            aemet_estacion=d.aemet_estacion, aemet_municipio=d.aemet_municipio, usa_satelite=d.usa_satelite,
            zonas=[s.ZonaIn(id=z.id, nombre=z.nombre, lat=z.lat, lon=z.lon, radio_m=z.radio_m) for z in d.zonas],
            habituales=[s.FechaHabitual.model_validate(h) for h in hab],
        ))
    return out


@router.post('/destinos', response_model=s.Mensaje, status_code=status.HTTP_201_CREATED, summary='Añadir un destino')
def crear_destino(body: s.DestinoConfig, db: Session = Db, _=Depends(solo_admin)):
    if db.get(m.Destino, body.id):
        raise HTTPException(status.HTTP_409_CONFLICT, 'Ya existe un destino con ese id')
    datos = body.model_dump(exclude={'zonas', 'habituales'})
    datos['umbrales'] = body.umbrales.model_dump()
    d = m.Destino(**datos, geom=f'SRID=4326;POINT({body.lon} {body.lat})')
    for i, z in enumerate(body.zonas):
        d.zonas.append(m.Zona(id=z.id, nombre=z.nombre, orden=i, lat=z.lat, lon=z.lon, radio_m=z.radio_m,
                              geom=f'SRID=4326;POINT({z.lon} {z.lat})'))
    db.add(d)
    try:
        db.flush()  # the rows below reference the destination
    except IntegrityError:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, 'Algún id de zona ya existe') from None
    for h in body.habituales:
        db.add(m.FechaHabitual(destino_id=d.id, **h.model_dump()))
    db.add(m.ContenidoEditorial(destino_id=d.id, idioma='es'))
    db.flush()
    modelo.recalcular(db, d, today())
    db.commit()
    return s.Mensaje(mensaje=f'Destino {d.nombre} creado')


@router.patch('/destinos/{destino_id}', response_model=s.Mensaje, summary='Cambiar la configuración de un destino')
def editar_destino(destino_id: str, body: s.DestinoConfigPatch, db: Session = Db, _=Depends(solo_admin)):
    d = _destino(db, destino_id)
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(d, k, v)
    if body.umbrales is not None:
        modelo.recalcular(db, d, today())
    db.commit()
    return s.Mensaje(mensaje='Guardado')


# ─── Editorial and commercial content ────────────────────────────────────────
@router.get('/destinos/{destino_id}/editorial', response_model=s.Editorial, summary='Contenido editorial de un destino')
def get_editorial(destino_id: str, idioma: str = 'es', db: Session = Db, _=Depends(editor)):
    e = db.get(m.ContenidoEditorial, (destino_id, idioma))
    if e is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, 'Sin contenido')
    return e


@router.put('/destinos/{destino_id}/editorial', response_model=s.Editorial, summary='Guardar el contenido editorial')
def put_editorial(destino_id: str, body: s.Editorial, idioma: str = 'es', db: Session = Db, u: m.Usuario = Depends(editor)):
    _destino(db, destino_id)
    e = db.get(m.ContenidoEditorial, (destino_id, idioma)) or m.ContenidoEditorial(destino_id=destino_id, idioma=idioma)
    for k in ('historia', 'que_ver', 'como_llegar', 'acceso', 'consejos'):
        setattr(e, k, getattr(body, k))
    e.actualizado_en, e.actualizado_por = now(), u.email
    db.merge(e)
    db.commit()
    return e


@router.put('/destinos/{destino_id}/patrocinio', response_model=s.Patrocinio | None, summary='Patrocinador del destino (vacío = ninguno)')
def put_patrocinio(destino_id: str, body: s.Patrocinio | None = None, db: Session = Db, _=Depends(solo_admin)):
    _destino(db, destino_id)
    db.execute(delete(m.Patrocinio).where(m.Patrocinio.destino_id == destino_id))
    if body and body.entidad.strip():
        db.add(m.Patrocinio(destino_id=destino_id, **body.model_dump()))
    db.commit()
    return body


@router.get('/ofertas', response_model=list[s.Oferta], summary='Todas las ofertas, también las inactivas')
def get_ofertas(destino_id: str | None = Query(None, alias='destinoId'), db: Session = Db, _=Depends(editor)):
    return consultas.ofertas(db, destino_id, solo_activas=False)


@router.post('/ofertas', response_model=s.Oferta, status_code=status.HTTP_201_CREATED, summary='Crear una oferta')
def crear_oferta(body: s.OfertaIn, db: Session = Db, _=Depends(editor)):
    _destino(db, body.destino_id)
    n = db.scalar(select(func.count()).select_from(m.Oferta)) + 1
    o = m.Oferta(id=f'{body.destino_id[:2]}-{n}-{now():%H%M%S}', **body.model_dump())
    db.add(o)
    db.commit()
    return o


@router.patch('/ofertas/{oferta_id}', response_model=s.Oferta, summary='Editar una oferta (p. ej. marcar como patrocinada)')
def editar_oferta(oferta_id: str, body: s.OfertaPatch, db: Session = Db, _=Depends(editor)):
    o = db.get(m.Oferta, oferta_id)
    if o is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, 'Oferta no encontrada')
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(o, k, v)
    db.commit()
    return o


@router.delete('/ofertas/{oferta_id}', status_code=status.HTTP_204_NO_CONTENT, summary='Borrar una oferta')
def borrar_oferta(oferta_id: str, db: Session = Db, _=Depends(solo_admin)):
    db.execute(delete(m.Oferta).where(m.Oferta.id == oferta_id))
    db.commit()


# ─── Users ───────────────────────────────────────────────────────────────────
@router.get('/usuarios', response_model=list[s.UsuarioOut], summary='Cuentas del panel')
def usuarios(db: Session = Db, _=Depends(solo_admin)):
    return db.scalars(select(m.Usuario).order_by(m.Usuario.email)).all()


@router.post('/usuarios', response_model=s.UsuarioOut, status_code=status.HTTP_201_CREATED, summary='Crear una cuenta')
def crear_usuario(body: s.UsuarioIn, db: Session = Db, _=Depends(solo_admin)):
    try:
        return auth.crear_usuario(db, body.email, body.nombre, body.password, body.rol)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, 'Ya existe una cuenta con ese email') from None


@router.patch('/usuarios/{usuario_id}', response_model=s.UsuarioOut, summary='Activar o desactivar una cuenta')
def activar_usuario(usuario_id: int, activo: bool, db: Session = Db, yo: m.Usuario = Depends(solo_admin)):
    u = db.get(m.Usuario, usuario_id)
    if u is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, 'Cuenta no encontrada')
    if u.id == yo.id and not activo:
        raise HTTPException(status.HTTP_409_CONFLICT, 'No puedes desactivar tu propia cuenta')
    u.activo = activo
    if not activo:
        db.execute(delete(m.Sesion).where(m.Sesion.usuario_id == u.id))
    db.commit()
    return u
