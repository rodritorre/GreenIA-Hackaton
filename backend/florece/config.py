"""Runtime configuration, read from environment variables (or a .env file).

Every secret (database password, AEMET key, session secret) comes from the environment,
never from the repository (spec ARQ-4).
"""
from functools import lru_cache
from pathlib import Path
from zoneinfo import ZoneInfo

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix='FLORECE_', env_file='.env', extra='ignore')

    # Database (PostgreSQL + PostGIS)
    database_url: str = 'postgresql+psycopg://florece:florece@localhost:5432/florece'

    # Public URL of the site, used in email links (confirm / unsubscribe)
    public_url: str = 'http://localhost:5173'
    # Extra origins allowed to call the API from a browser. Empty = same-origin only (site and API share a domain).
    cors_origins: list[str] = []

    # Used to hash client identifiers (photo rate limit). Set a long random value in production.
    secret_key: str = 'change-me'

    # Admin sessions
    session_days: int = 14
    cookie_secure: bool = True

    # Where uploaded citizen photos and raw dataset files are stored
    data_dir: Path = Path('data')

    # Timezone used for "today", schedules and display
    timezone: str = 'Europe/Madrid'
    # Optional fixed "today" for demos and tests (YYYY-MM-DD). Empty = real date.
    fixed_today: str = ''

    # AEMET OpenData (https://opendata.aemet.es/centrodedescargas/altaUsuario). Empty = AEMET ingestion skipped.
    aemet_api_key: str = ''
    aemet_base_url: str = 'https://opendata.aemet.es/opendata/api'

    # Sentinel-2 L2A open data (AWS, no key needed)
    sentinel_bucket_url: str = 'https://sentinel-cogs.s3.us-west-2.amazonaws.com'
    sentinel_max_cloud: float = 60.0
    sentinel_lookback_days: int = 10

    # Email: 'console' writes messages to the log and the outbox table (mock). See docs/DECISIONS.md.
    email_backend: str = 'console'
    email_from: str = 'Cuándo Florece <avisos@example.com>'

    # Citizen photos (spec CIT-3, CIT-6)
    photo_max_km: float = 3.0
    photo_max_hours: int = 72
    photo_daily_limit: int = 5
    photo_max_mb: int = 15

    # Daily jobs (local time, Europe/Madrid)
    ingest_hour: int = 6
    alerts_hour: int = 7

    @property
    def tz(self) -> ZoneInfo:
        return ZoneInfo(self.timezone)

    @property
    def uploads_dir(self) -> Path:
        return self.data_dir / 'uploads'

    @property
    def raw_dir(self) -> Path:
        return self.data_dir / 'raw'


@lru_cache
def get_settings() -> Settings:
    return Settings()
