"""Tests run against a real PostgreSQL + PostGIS database.

Set FLORECE_TEST_DATABASE_URL (default: a local database called florece_test). Each test session
recreates the schema with the migrations and loads the demo seed.
"""
import os

import pytest

TEST_URL = os.environ.get('FLORECE_TEST_DATABASE_URL', 'postgresql+psycopg://florece:florece@localhost:5432/florece_test')
os.environ['FLORECE_DATABASE_URL'] = TEST_URL
os.environ['FLORECE_FIXED_TODAY'] = '2026-10-20'
os.environ['FLORECE_COOKIE_SECURE'] = 'false'
os.environ['FLORECE_PUBLIC_URL'] = 'http://testserver'
os.environ.setdefault('FLORECE_DATA_DIR', '/tmp/florece-test-data')

from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import text  # noqa: E402

from florece.cli import migrar  # noqa: E402
from florece.db import SessionLocal, engine  # noqa: E402
from florece.main import app  # noqa: E402
from florece.seed import seed  # noqa: E402
from florece.services.auth import crear_usuario  # noqa: E402


@pytest.fixture(scope='session', autouse=True)
def base_de_datos():
    with engine().begin() as c:
        c.execute(text('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;'))
    migrar()
    with SessionLocal() as db:
        seed(db, demo=True)
        crear_usuario(db, 'admin@example.com', 'Admin', 'contraseña-larga-1', 'admin')
        crear_usuario(db, 'editor@example.com', 'Editora', 'contraseña-larga-2', 'editor')
    yield


@pytest.fixture
def client():
    return TestClient(app)


def _login(client: TestClient, email: str, pw: str) -> TestClient:
    r = client.post('/api/v1/auth/login', json={'email': email, 'password': pw})
    assert r.status_code == 200, r.text
    return client


@pytest.fixture
def admin(client):
    return _login(client, 'admin@example.com', 'contraseña-larga-1')


@pytest.fixture
def editor(client):
    return _login(client, 'editor@example.com', 'contraseña-larga-2')
