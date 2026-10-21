from collections.abc import Iterator
from datetime import date, datetime

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from .config import get_settings


class Base(DeclarativeBase):
    pass


_engine = None
_Session: sessionmaker[Session] | None = None


def engine():
    global _engine, _Session
    if _engine is None:
        _engine = create_engine(get_settings().database_url, pool_pre_ping=True, future=True)
        _Session = sessionmaker(_engine, expire_on_commit=False)
    return _engine


def SessionLocal() -> Session:
    engine()
    assert _Session is not None
    return _Session()


def get_db() -> Iterator[Session]:
    """FastAPI dependency: one session per request, committed by the handler."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def today() -> date:
    s = get_settings()
    if s.fixed_today:
        return date.fromisoformat(s.fixed_today)
    return datetime.now(s.tz).date()


def now() -> datetime:
    return datetime.now(get_settings().tz)
