"""Command line: `florece <command>`. Every scheduled job can also be run by hand (ARQ-3)."""
from __future__ import annotations

import getpass
import json
import logging
from datetime import date
from pathlib import Path

import typer

from .db import SessionLocal, today

app = typer.Typer(help='Cuándo Florece: administración del backend', no_args_is_help=True)
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(name)s: %(message)s')


@app.command()
def migrar() -> None:
    """Crear o actualizar las tablas de la base de datos."""
    from alembic import command
    from alembic.config import Config

    cfg = Config(str(Path(__file__).parent / 'migrations' / 'alembic.ini'))
    command.upgrade(cfg, 'head')
    typer.echo('Base de datos al día')


@app.command()
def seed(demo: bool = typer.Option(False, help='Cargar también observaciones, previsiones y fotos de ejemplo')) -> None:
    """Cargar destinos, contenido y ofertas iniciales. BORRA los destinos existentes."""
    from .seed import seed as cargar

    with SessionLocal() as db:
        typer.echo(json.dumps(cargar(db, demo=demo)))


@app.command('crear-admin')
def crear_admin(email: str, nombre: str = typer.Option('Administración'), rol: str = typer.Option('admin')) -> None:
    """Crear una cuenta del panel (pide la contraseña)."""
    from .services.auth import crear_usuario

    pw = getpass.getpass('Contraseña (mín. 10 caracteres): ')
    if len(pw) < 10 or pw != getpass.getpass('Repite la contraseña: '):
        raise typer.BadParameter('Las contraseñas no coinciden o son demasiado cortas')
    with SessionLocal() as db:
        u = crear_usuario(db, email, nombre, pw, rol)
        typer.echo(f'Cuenta creada: {u.email} ({u.rol})')


@app.command()
def ingesta(solo: str = typer.Option('', help='aemet o sentinel; vacío = todas')) -> None:
    """Ejecutar la ingesta diaria y recalcular previsiones."""
    from .services.ingesta import runner

    fuentes = (solo,) if solo else ('aemet', 'sentinel')
    with SessionLocal() as db:
        ej = runner.ejecutar(db, 'cli', fuentes)
        typer.echo(f'Ingesta {ej.id}: {ej.estado}')


@app.command()
def recalcular(fecha: str = typer.Option('', help='Fecha "hoy" (YYYY-MM-DD) para pruebas')) -> None:
    """Recalcular estados y previsiones sin descargar datos."""
    from .services.modelo import recalcular_todo

    with SessionLocal() as db:
        for r in recalcular_todo(db, date.fromisoformat(fecha) if fecha else today()):
            typer.echo(json.dumps(r))


@app.command()
def avisos() -> None:
    """Enviar los avisos que tocan hoy."""
    from .services.alertas import despachar

    with SessionLocal() as db:
        typer.echo(f'{despachar(db, today())} avisos enviados')


@app.command()
def importar(destino: str, dataset: str, archivo: Path, recalcular_despues: bool = True) -> None:
    """Importar un CSV proporcionado (indice, temperaturas, habituales, prevision)."""
    from . import models as m
    from .services import importar as imp
    from .services.modelo import recalcular as recalc

    with SessionLocal() as db:
        d = db.get(m.Destino, destino)
        if d is None:
            raise typer.BadParameter(f'Destino desconocido: {destino}')
        arch, avisos_ = imp.importar(db, d, dataset, archivo.name, archivo.read_bytes(), 'cli')
        for a in avisos_:
            typer.echo(f'aviso: {a}')
        if recalcular_despues:
            recalc(db, d, today())
            db.commit()
        typer.echo(f'{arch.filas} filas importadas ({dataset})')


@app.command()
def openapi(salida: Path = Path('openapi.json')) -> None:
    """Escribir el contrato OpenAPI (para generar clientes)."""
    from .main import app as api

    salida.write_text(json.dumps(api.openapi(), ensure_ascii=False, indent=1))
    typer.echo(f'Escrito {salida}')


if __name__ == '__main__':
    app()
