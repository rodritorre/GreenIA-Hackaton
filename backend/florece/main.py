"""FastAPI application. Everything lives under /api/v1; the OpenAPI document is the contract any UI uses."""
import logging

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from . import __version__
from .config import get_settings
from .db import SessionLocal

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(name)s: %(message)s')

from .api import admin, auth, public  # noqa: E402

app = FastAPI(
    title='Cuándo Florece API',
    version=__version__,
    description=(
        'Dónde está la flor, cuándo llegará y con qué confianza.\n\n'
        'Todas las previsiones son rangos con su confianza, nunca una fecha única. '
        'Cada valor indica su tipo (observado, estimado por satélite, previsto) y su fuente.'
    ),
    openapi_url='/api/v1/openapi.json',
    docs_url='/api/v1/docs',
    redoc_url=None,
)

if get_settings().cors_origins:
    app.add_middleware(CORSMiddleware, allow_origins=get_settings().cors_origins, allow_credentials=True,
                       allow_methods=['*'], allow_headers=['*'])

v1 = APIRouter(prefix='/api/v1')


@v1.get('/salud', tags=['sistema'], summary='Comprobación de salud (para Docker/monitorización)')
def salud():
    with SessionLocal() as db:
        db.execute(text('select 1'))
    return {'ok': True, 'version': __version__}


v1.include_router(public.router)
v1.include_router(auth.router)
v1.include_router(admin.router)
app.include_router(v1)
