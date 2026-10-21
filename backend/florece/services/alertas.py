"""'Avísame cuando llegue la flor' (EXT-3: ALR-1…ALR-5).

Flow: subscribe → confirmation email (double opt-in) → confirmed → the daily job sends one notice per
season when the forecast window is within the chosen notice period, or when the satellite shows the
phase has arrived. Every email carries a one-click unsubscribe link.
"""
from __future__ import annotations

import secrets
from datetime import date, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models as m
from ..config import get_settings
from ..db import now
from . import correo

FASE_ES = {'inicio': 'Inicio', 'avance': 'Avance', 'pleno': 'Pleno', 'final': 'Final'}
CONF_ES = {'alta': 'Confianza alta', 'media': 'Confianza media', 'baja': 'Confianza baja'}


def _url(path: str) -> str:
    return get_settings().public_url.rstrip('/') + path


def _fecha(d: date) -> str:
    meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic']
    return f'{d.day} {meses[d.month - 1]} {d.year}'


def suscribir(db: Session, email: str, destino: m.Destino, fase: str, antelacion: int, idioma: str) -> m.Alerta:
    a = db.scalar(select(m.Alerta).where(m.Alerta.email == email, m.Alerta.destino_id == destino.id, m.Alerta.fase == fase))
    if a is None:
        a = m.Alerta(email=email, destino_id=destino.id, fase=fase, token=secrets.token_urlsafe(32), creada_en=now())
        db.add(a)
    a.antelacion_dias, a.idioma, a.baja_en = antelacion, idioma, None
    db.flush()
    if not a.confirmada:
        correo.enviar(
            db, email, f'Confirma tu aviso para {destino.nombre}',
            f'Hola:\n\nHas pedido que te avisemos de «{FASE_ES[fase]}» en {destino.nombre}.\n'
            f'Confirma el aviso aquí: {_url(f"/api/v1/alertas/confirmar?token={a.token}")}\n\n'
            'Si no lo pediste, ignora este correo: no te escribiremos más.',
            'confirmacion',
        )
    return a


def confirmar(db: Session, token: str) -> m.Alerta | None:
    a = db.scalar(select(m.Alerta).where(m.Alerta.token == token))
    if a and not a.confirmada:
        a.confirmada, a.confirmada_en = True, now()
    return a


def dar_de_baja(db: Session, token: str) -> m.Alerta | None:
    a = db.scalar(select(m.Alerta).where(m.Alerta.token == token))
    if a and a.baja_en is None:
        a.baja_en = now()
    return a


def cuerpo_aviso(db: Session, destino: m.Destino, v: m.VentanaFase, antelacion: int, token: str | None) -> tuple[str, str]:
    """Subject and body of a notice (ALR-3: range, confidence, links to stays and activities)."""
    ofertas = db.scalars(select(m.Oferta).where(m.Oferta.destino_id == destino.id, m.Oferta.activa.is_(True))
                         .order_by(m.Oferta.patrocinado.desc()).limit(2)).all()
    asunto = f'{FASE_ES[v.fase]} en {destino.nombre}: entre el {_fecha(v.desde)} y el {_fecha(v.hasta)}'
    lineas = [
        f'La previsión ya está a menos de {antelacion} días.',
        f'{CONF_ES[v.confianza]}, {round(v.probabilidad * 100)} % de probabilidad.',
        '',
        f'Ver el destino: {_url(f"/#{destino.id}")}',
    ]
    for o in ofertas:
        etiqueta = 'Dónde dormir' if o.tipo == 'alojamiento' else 'Qué hacer'
        lineas.append(f'{etiqueta}: {o.nombre}{" (patrocinado)" if o.patrocinado else ""} {o.url or ""}'.rstrip())
    if token:
        lineas += ['', f'Darme de baja: {_url(f"/api/v1/alertas/baja?token={token}")}']
    return asunto, '\n'.join(lineas)


def despachar(db: Session, hoy: date) -> int:
    """Daily job: send the notices that are due. Returns how many were sent."""
    enviados = 0
    alertas = db.scalars(select(m.Alerta).where(m.Alerta.confirmada.is_(True), m.Alerta.baja_en.is_(None))).all()
    for a in alertas:
        v = db.scalar(select(m.VentanaFase).where(m.VentanaFase.destino_id == a.destino_id, m.VentanaFase.fase == a.fase,
                                                  m.VentanaFase.vigente.is_(True)))
        if v is None or a.ultimo_aviso_para == v.desde or v.hasta < hoy:
            continue
        estado = db.get(m.EstadoActual, a.destino_id)
        llegada = estado is not None and estado.fase == a.fase
        if not (llegada or v.desde - timedelta(days=a.antelacion_dias) <= hoy):
            continue
        destino = db.get(m.Destino, a.destino_id)
        asunto, cuerpo = cuerpo_aviso(db, destino, v, a.antelacion_dias, a.token)
        correo.enviar(db, a.email, asunto, cuerpo, 'aviso', baja_url=_url(f'/api/v1/alertas/baja?token={a.token}'))
        a.ultimo_aviso_para, a.enviada_en = v.desde, now()
        enviados += 1
    db.commit()
    return enviados
