from alembic import context
from sqlalchemy import engine_from_config, pool

from florece import models  # noqa: F401  (registers the tables)
from florece.config import get_settings
from florece.db import Base

config = context.config
config.set_main_option('sqlalchemy.url', get_settings().database_url.replace('%', '%%'))


def include_object(obj, name, type_, reflected, compare_to):
    # PostGIS ships its own tables (spatial_ref_sys, tiger/topology schemas): never touch them
    return not (type_ == 'table' and reflected and compare_to is None)


def run_migrations_online() -> None:
    connectable = engine_from_config(config.get_section(config.config_ini_section, {}), prefix='sqlalchemy.', poolclass=pool.NullPool)
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=Base.metadata, include_object=include_object)
        with context.begin_transaction():
            context.run_migrations()


run_migrations_online()
