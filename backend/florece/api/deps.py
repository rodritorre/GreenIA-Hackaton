from __future__ import annotations

from collections.abc import Callable
from urllib.parse import urlparse

from fastapi import Cookie, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from .. import models as m
from ..config import get_settings
from ..db import get_db
from ..services import auth

Db = Depends(get_db)


def usuario_actual(request: Request, db: Session = Db, florece_sesion: str | None = Cookie(default=None)) -> m.Usuario:
    u = auth.usuario_de_sesion(db, florece_sesion)
    if u is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, 'Inicia sesión')
    _mismo_origen(request)
    return u


def _mismo_origen(request: Request) -> None:
    """CSRF defence in depth (the cookie is already SameSite=Strict): writes must come from our own site."""
    if request.method in ('GET', 'HEAD', 'OPTIONS'):
        return
    origen = request.headers.get('origin') or request.headers.get('referer')
    if not origen:
        return  # non-browser clients (curl, scripts) send neither header
    host = urlparse(origen).netloc
    permitidos = {request.url.netloc, urlparse(get_settings().public_url).netloc} | {urlparse(o).netloc for o in get_settings().cors_origins}
    if host not in permitidos:
        raise HTTPException(status.HTTP_403_FORBIDDEN, 'Origen no permitido')


def requiere(*roles: str) -> Callable[..., m.Usuario]:
    def dep(u: m.Usuario = Depends(usuario_actual)) -> m.Usuario:
        if u.rol not in roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, 'Tu rol no permite esta acción')
        return u

    return dep


solo_admin = requiere('admin')
editor = requiere('admin', 'editor')
