"""Email sending behind one small interface.

Only the 'console' backend exists for now (decision D-07 in docs/DECISIONS.md): every message is
written to the log and to the email_outbox table, where the admin panel shows it. Adding a real
provider means adding a class with `enviar()` and selecting it with FLORECE_EMAIL_BACKEND; no
other code changes.
"""
from __future__ import annotations

import logging
from typing import Protocol

from sqlalchemy.orm import Session

from .. import models as m
from ..config import get_settings
from ..db import now

log = logging.getLogger('florece.correo')


class Remitente(Protocol):
    nombre: str

    def enviar(self, para: str, asunto: str, cuerpo: str, cabeceras: dict[str, str]) -> str:
        """Send and return the outbox state: 'enviado', 'simulado' or 'error'."""


class Consola:
    nombre = 'console'

    def enviar(self, para: str, asunto: str, cuerpo: str, cabeceras: dict[str, str]) -> str:
        log.info('EMAIL (simulado) para=%s asunto=%s\n%s', para, asunto, cuerpo)
        return 'simulado'


def remitente() -> Remitente:
    backend = get_settings().email_backend
    if backend == 'console':
        return Consola()
    raise RuntimeError(f'Email backend "{backend}" no implementado todavía (ver docs/DECISIONS.md, D-07)')


def enviar(db: Session, para: str, asunto: str, cuerpo: str, tipo: str, baja_url: str | None = None) -> m.EmailOutbox:
    cab = {'From': get_settings().email_from}
    if baja_url:
        # One-click unsubscribe (RFC 8058), required by Gmail/Yahoo for bulk senders (ALR-4)
        cab['List-Unsubscribe'] = f'<{baja_url}>'
        cab['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click'
    r = remitente()
    try:
        estado = r.enviar(para, asunto, cuerpo, cab)
    except Exception:  # noqa: BLE001
        log.exception('Fallo enviando email a %s', para)
        estado = 'error'
    msg = m.EmailOutbox(para=para, asunto=asunto, cuerpo=cuerpo, tipo=tipo, backend=r.nombre, estado=estado, creado_en=now())
    db.add(msg)
    return msg
