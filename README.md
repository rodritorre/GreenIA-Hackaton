# Cuándo Florece

> **Rama `luka`.** Une la app de Marco (código fuente React + TypeScript, backend FastAPI con tests) con el
> modelo de negocio nuevo, y adopta el aspecto y el contenido de la web del equipo (`web/`). La web original
> sigue en `web/` para comparar. El estado y el TODO del equipo están en [docs/estado-equipo.md](docs/estado-equipo.md).

The living bloom map of Spain (Greenia challenge, EPS UFV Hackathon, October 2026).
It answers three questions: **where** the bloom is, **when** it will arrive, and **how confident** we are.

```
frontend/          React + TypeScript site and internal panel (#admin). Talks only to the API.
backend/           Python + FastAPI API, PostGIS database, daily ingestion (AEMET, Sentinel-2), forecast model, alerts.
deploy/            Live demo hosting: Caddy serving the demo build (see "Live demo" below).
deploy/fullstack/  Docker Compose + Caddy for the full production stack (db, api, worker, web).
scripts/deploy.sh  Pulls main and rebuilds the live demo on the server.
docs/              DECISIONS.md (decisions + what's pending from you), DEPLOY.md, API.md, openapi.json.
```

## Live demo

**https://cuandoflorece.cabecerastudio.com** runs the same frontend with the in-browser mock of the API
(`npm run build:demo`), so it never depends on a backend being up. The real backend lives in `backend/`
with its tests; `deploy/fullstack/` is how it would run in production.

Only the operator deploys: push to `main`, then the operator runs `scripts/deploy.sh` on the server.

Demo routes: the public site at `/`, the destination panel at `#destino` (one click, no login; pick
Brihuega or Tejera Negra), Greenia's internal panel at `#admin`.

### What is real and what is simulated

**Real**
- The organisers' datasets in `data/organizadores/`, turned into the demo's data by
  `frontend/scripts/import_floral_data.py` (output: `frontend/src/api/mock/datosOrganizadores.ts`):
  - Tejera Negra: the colour index series (21 Jul to 14 Oct 2026), cloud gaps from the Sentinel-2 passes,
    daily maximum temperatures, the start milestone (4 Sep 2026) and the 8-season reference dates.
  - Brihuega: the 2026 harvest (10 % cut on 21 Jul, 50 % on 11 Aug, 61 % of 832 ha) and the provided
    2027 forecast (full bloom 1 to 8 Jul, central 5 Jul, v0-climatologia over 10 years).
- Phase thresholds recalibrated to the real index range: inicio 0.20 (it reproduces the organisers'
  detected start), avance 0.30, pleno 0.40.
- The backend (FastAPI + PostGIS + worker), its tests and the OpenAPI contract. The seed fixture is
  regenerated from the same mock (`npm run export-fixture`).
- The satellite basemap (Copernicus Sentinel-2 2025 mosaic).

**Estimated from real data**
- Per-zone values in Tejera Negra: the organisers give the median and the 25th to 75th percentile across
  zones; we spread the zones with data across that range, ordered by each zone's own satellite change.
  Zone positions on the map are placeholders (the datasets have zone ids, not geometries).

**Simulated** (labelled "simulado" or "(simulado)" on screen)
- The v0 model's forecast band after the last observation, and phase windows the organisers did not
  provide (Tejera Negra full colour and end; Brihuega first flowers).
- Everything in the destination panel's demand and impact figures. Alerts typed into the demo do add to
  the "by province" count.
- AI moderation of business listings: scripted rules in the demo. In production it is a call to an LLM
  API with human review of doubtful cases.
- Email sending (outbox only), logins, booking links (`[PRECIO]`).
- Jerte: public historical dates only, low confidence. Alpujarra: "coming soon", no real data.

Demo state (visibility, capacity, sign-ups, agenda, story) lives in the browser's localStorage, so a reload
keeps it. "Reiniciar demo" in the panel clears it. The panel's destination licence, visibility control,
business moderation and capacity endpoints exist in the frontend's API contract (`src/api/types.ts`) and
the mock; the backend does not implement them yet.

- **Deploy the full stack on your server**: [docs/DEPLOY.md](docs/DEPLOY.md)
- **Decisions and inputs still needed**: [docs/DECISIONS.md](docs/DECISIONS.md)
- **API**: [docs/API.md](docs/API.md), live docs at `/api/v1/docs`

## Architecture

```
            ┌──────────── Docker Compose on one server ─────────────┐
 browser ──▶│ web (Caddy: HTTPS, site files) ──/api/*──▶ api (FastAPI)│──▶ db (PostgreSQL + PostGIS)
            │                                     worker (06:00 / 07:00 jobs)
            └────────────────────────────────────────────────────────┘
                     AEMET OpenData ─┐        ┌─ Sentinel-2 L2A (AWS open data)
                                     └─ daily ingestion ─┘
```

**Decoupled by contract.** The backend's Pydantic schemas generate the OpenAPI document
(`docs/openapi.json`); the front end's TypeScript types are generated from it
(`frontend/src/api/schema.d.ts`). The UI holds no business logic: phase states, forecasts, photo
checks and alerts all come from the API, so a completely different UI (or a mobile app, or a partner)
can use the same API.

The front end has two interchangeable API adapters (`frontend/src/api/`): `http` (production) and
`mock` (an in-browser copy used for the offline demo link, `npm run build:demo`).

## Local development

Requirements: Node 22, Python 3.12+, PostgreSQL 16 with PostGIS (or just `docker compose up db` from `deploy/fullstack/`).

```bash
# backend
cd backend
python -m venv .venv && . .venv/bin/activate
pip install -e ".[dev]"
export FLORECE_DATABASE_URL=postgresql+psycopg://florece:florece@localhost:5432/florece
export FLORECE_COOKIE_SECURE=false FLORECE_FIXED_TODAY=2026-10-20   # demo date
florece migrar && florece seed --demo && florece crear-admin you@example.es
uvicorn florece.main:app --reload --port 8000

# frontend (another terminal): http://localhost:5173, /api is proxied to :8000
cd frontend
npm install
npm run dev
```

Tests: `cd backend && FLORECE_TEST_DATABASE_URL=postgresql+psycopg://…/florece_test pytest` (25 tests: API, alerts,
photo checks with real EXIF, roles, CSRF, CSV import, model, AEMET parsing).

After changing the API: `florece openapi --salida ../frontend/src/api/openapi.json` then `npm run api:types` in `frontend/`.

## Command line (`florece …`)

| Command | What |
|---|---|
| `migrar` | Create/update tables |
| `seed [--demo]` | Load destinations, content, offers (+ sample data) |
| `crear-admin EMAIL` | Create a panel account |
| `ingesta [--solo aemet\|sentinel]` | Run the daily ingestion and recompute |
| `recalcular` | Recompute states and forecasts |
| `avisos` | Send the alerts that are due |
| `importar DESTINO DATASET ARCHIVO.csv` | Import a provided dataset |
| `openapi` | Write the API contract |

## Spec coverage

| Area | IDs | Where |
|---|---|---|
| Navigable map, 4 destinations, phase by colour and shape, legend | MIN-1, MAP-1…4 | `frontend/src/components/BloomMap.tsx` |
| Time selector, forecast with uncertainty | MAP-6, MAP-7 | `GET /mapa?fecha=` |
| 7 zones of Tejera Negra, "no data" for clouds | MAP-8, FIC-7, HON-4 | `GET /destinos/{id}`, Sentinel-2 ingestion |
| Every forecast a range + confidence; data type and source on every value | PRIN-1.1/1.2, HON-2/3 | `schemas.py`, `services/modelo.py` |
| Margin narrowing, data-cutoff date | PRIN-1.3, TRA-2 | forecast history (`ventana_fase.vigente`) |
| Calculated / editorial / commercial layers kept apart | PRIN-3.1, MON-3 | data model + `DestinoFicha` blocks |
| Automatic ingestion, stale source kept and flagged, logs, manual run | PRIN-2.1…2.5, NFR-4 | `services/ingesta/`, `worker.py` |
| Destination added by configuration | PRIN-2.4 | `POST /admin/destinos` |
| Import of provided datasets, raw files kept with provenance | DATA-1…6 | `services/importar.py` |
| Own model vs provided forecast | PRED-1…4, 6 | `services/modelo.py`, admin › Previsiones |
| Alerts with double opt-in and one-click unsubscribe | EXT-3, ALR-1…5, NFR-7 | `services/alertas.py` |
| Citizen photos: EXIF location/time, radius, duplicates, rate limit, metadata stripped | EXT-2, CIT-1…7 | `services/fotos.py` |
| Admin accounts, roles, sessions | D-04 | `services/auth.py`, `api/admin.py` |
| Credentials only in environment variables | ARQ-4 | `deploy/fullstack/.env.example` |
| Offline-capable map, attribution | NFR-3, NFR-6 | bundled Sentinel-2 basemap |
| Spanish UI, English ready; responsive; accessible | UX-5…7 | `frontend/src/i18n`, CSS |

## Satellite basemap

`frontend/public/sat/` holds WebP tiles packed into JSON (~9 MB): a cloud-free summer-2025 Sentinel-2 mosaic of
Spain and Portugal (zoom 5–9) and close-ups of each destination in its own season (zoom 10–14). Rebuild with
`frontend/scripts/build_satellite_tiles.py`. Attribution: "Contains modified Copernicus Sentinel-2 data (2025)".
