"""Scheduled jobs (PRIN-2.1, PRIN-2.2). Runs as its own container: `python -m florece.worker`.

06:00 Europe/Madrid  ingestion (AEMET + Sentinel-2) → recompute states and forecasts
07:00 Europe/Madrid  send the alerts that are due
"""
from __future__ import annotations

import logging

from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger

from .config import get_settings
from .db import SessionLocal, today
from .services import alertas
from .services.ingesta import runner

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(name)s: %(message)s')
log = logging.getLogger('florece.worker')


def job_ingesta() -> None:
    with SessionLocal() as db:
        ej = runner.ejecutar(db, 'cron')
        log.info('Ingesta %s terminada: %s', ej.id, ej.estado)


def job_avisos() -> None:
    with SessionLocal() as db:
        log.info('%s avisos enviados', alertas.despachar(db, today()))


def main() -> None:
    s = get_settings()
    sched = BlockingScheduler(timezone=s.timezone)
    # misfire_grace_time: if the server was down at 06:00, still run when it comes back that morning
    sched.add_job(job_ingesta, CronTrigger(hour=s.ingest_hour, minute=0, timezone=s.timezone), id='ingesta',
                  misfire_grace_time=6 * 3600, coalesce=True, max_instances=1)
    sched.add_job(job_avisos, CronTrigger(hour=s.alerts_hour, minute=0, timezone=s.timezone), id='avisos',
                  misfire_grace_time=6 * 3600, coalesce=True, max_instances=1)
    log.info('Planificador en marcha: ingesta %02d:00, avisos %02d:00 (%s)', s.ingest_hour, s.alerts_hour, s.timezone)
    sched.start()


if __name__ == '__main__':
    main()
