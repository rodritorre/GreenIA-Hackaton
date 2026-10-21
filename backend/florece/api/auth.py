from __future__ import annotations

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from .. import models as m
from .. import schemas as s
from ..config import get_settings
from ..services import auth
from .deps import Db, usuario_actual

router = APIRouter(prefix='/auth', tags=['auth'])


@router.post('/login', response_model=s.UsuarioOut, summary='Iniciar sesión (cookie de sesión HttpOnly)')
def login(body: s.LoginIn, response: Response, db: Session = Db):
    u = auth.autenticar(db, body.email, body.password)
    if u is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, 'Email o contraseña incorrectos')
    token = auth.crear_sesion(db, u)
    cfg = get_settings()
    response.set_cookie(auth.COOKIE, token, max_age=cfg.session_days * 86400, httponly=True, secure=cfg.cookie_secure,
                        samesite='strict', path='/api')
    return u


@router.post('/logout', status_code=status.HTTP_204_NO_CONTENT, summary='Cerrar sesión')
def logout(response: Response, db: Session = Db, florece_sesion: str | None = Cookie(default=None)):
    auth.cerrar_sesion(db, florece_sesion)
    response.delete_cookie(auth.COOKIE, path='/api')


@router.get('/yo', response_model=s.UsuarioOut, summary='Usuario de la sesión actual')
def yo(u: m.Usuario = Depends(usuario_actual)):
    return u
