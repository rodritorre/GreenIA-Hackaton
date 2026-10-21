"""Admin accounts and sessions (decision D-04: email + password, roles admin/editor).

Passwords: Argon2id. Sessions: random token in an HttpOnly, Secure, SameSite=Strict cookie; only its
SHA-256 is stored, so a database leak doesn't leak live sessions. Logging out deletes the session.
"""
from __future__ import annotations

import hashlib
import secrets
from datetime import timedelta

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerifyMismatchError
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from .. import models as m
from ..config import get_settings
from ..db import now

_ph = PasswordHasher()
COOKIE = 'florece_sesion'


def hash_password(pw: str) -> str:
    return _ph.hash(pw)


def _sha(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def autenticar(db: Session, email: str, password: str) -> m.Usuario | None:
    u = db.scalar(select(m.Usuario).where(m.Usuario.email == email.lower(), m.Usuario.activo.is_(True)))
    if u is None:
        _ph.hash(password)  # same work either way, so response time doesn't reveal which emails exist
        return None
    try:
        _ph.verify(u.password_hash, password)
    except (VerifyMismatchError, InvalidHashError):
        return None
    if _ph.check_needs_rehash(u.password_hash):
        u.password_hash = hash_password(password)
    u.ultimo_acceso = now()
    return u


def crear_sesion(db: Session, u: m.Usuario) -> str:
    token = secrets.token_urlsafe(32)
    db.execute(delete(m.Sesion).where(m.Sesion.expira_en < now()))
    db.add(m.Sesion(token_hash=_sha(token), usuario_id=u.id, creada_en=now(),
                    expira_en=now() + timedelta(days=get_settings().session_days)))
    db.commit()
    return token


def usuario_de_sesion(db: Session, token: str | None) -> m.Usuario | None:
    if not token:
        return None
    s = db.get(m.Sesion, _sha(token))
    if s is None or s.expira_en < now() or not s.usuario.activo:
        return None
    return s.usuario


def cerrar_sesion(db: Session, token: str | None) -> None:
    if token:
        db.execute(delete(m.Sesion).where(m.Sesion.token_hash == _sha(token)))
        db.commit()


def crear_usuario(db: Session, email: str, nombre: str, password: str, rol: str) -> m.Usuario:
    u = m.Usuario(email=email.lower(), nombre=nombre, password_hash=hash_password(password), rol=rol, activo=True, creado_en=now())
    db.add(u)
    db.commit()
    return u
