# Deploying on your Linux server

Everything runs with Docker Compose: PostgreSQL + PostGIS, the API, the scheduled-jobs worker and
Caddy (website + HTTPS + reverse proxy for `/api`).

```
Internet ──443──▶ Caddy (web) ──/api/*──▶ api (FastAPI) ──▶ db (PostGIS)
                    │                         ▲
                    └── website files          worker (06:00 ingestion, 07:00 alerts)
```

## 1. Prepare the server (once)

1. Any recent Linux server (for example Ubuntu 24.04 or Debian 12), 2 vCPU, 4 GB RAM, 20 GB disk.
2. Install Docker Engine and the Compose plugin: https://docs.docker.com/engine/install/
3. Open ports **80** and **443** (TCP, and UDP 443 for HTTP/3) in the firewall.
4. Point your domain at the server: a DNS **A** record (and **AAAA** for IPv6) for `DOMAIN`.
   Caddy can only get the certificate once DNS resolves to this server.

## 2. Install

```bash
sudo mkdir -p /opt/cuando-florece && sudo chown $USER /opt/cuando-florece
cd /opt/cuando-florece
unzip ~/cuando-florece.zip           # or git clone your repository here
cd deploy
cp .env.example .env
nano .env                            # DOMAIN, ACME_EMAIL, POSTGRES_PASSWORD, FLORECE_SECRET_KEY, AEMET key
docker compose up -d --build         # first build takes a few minutes
docker compose ps                    # api: healthy, db: healthy, web and worker: up
```

The API applies the database migrations automatically on start.

## 3. First data and first admin

```bash
docker compose exec api florece seed              # destinations, content, offers (add --demo for sample data)
docker compose exec api florece crear-admin you@example.es --nombre "Tu nombre"   # asks for the password
```

Open `https://DOMAIN` (public site) and `https://DOMAIN/#admin` (internal panel).

Then, in the panel:
- **Destinos**: set each destination's AEMET station and municipality codes, and turn on the satellite index where useful.
- **Datos e ingesta**: import the organisers' CSV files; "Ejecutar ingesta ahora" runs the daily job immediately.
- **Usuarios**: create the rest of the team's accounts.

## 4. Day to day

| Task | Command (from `deploy/`) |
|---|---|
| See logs | `docker compose logs -f api worker` |
| Run ingestion now | `docker compose exec api florece ingesta` |
| Recompute forecasts | `docker compose exec api florece recalcular` |
| Send due alerts now | `docker compose exec api florece avisos` |
| Import a CSV | `docker compose cp file.csv api:/tmp/f.csv && docker compose exec api florece importar tejera-negra indice /tmp/f.csv` |
| Update to a new version | replace the files, then `docker compose up -d --build` |
| Back up | `./backup.sh` (add to cron: `15 3 * * * /opt/cuando-florece/deploy/backup.sh`) |
| Restore the database | `docker compose exec -T db pg_restore -U florece -d florece --clean < db-YYYYMMDD-HHMM.dump` |

## 5. Checks

- `curl https://DOMAIN/api/v1/salud` → `{"ok":true,...}`
- API documentation: `https://DOMAIN/api/v1/docs`
- The worker log shows `Planificador en marcha: ingesta 06:00, avisos 07:00 (Europe/Madrid)`.

## Troubleshooting

- **No certificate / browser warning**: DNS not pointing at the server yet, or ports 80/443 closed. `docker compose logs web` explains it.
- **`api` unhealthy**: `docker compose logs api` (usually a wrong `POSTGRES_PASSWORD` after the database was first created with another one).
- **AEMET skipped**: the ingestion log says "sin clave de API": set `FLORECE_AEMET_API_KEY` and `docker compose up -d`.
