# Decisions and pending inputs

This file lists the technical decisions taken so far (**D-xx**) and everything that still needs an
answer or an input from you (**P-xx**). Update it as things get decided.

Status key: ✅ decided · 🟡 decided for now, revisit later · ⛔ blocked on an input from you

---

## 1. Decisions

| ID | Decision | Why | Status |
|---|---|---|---|
| D-01 | **Backend: Python 3.12 + FastAPI** | Best ecosystem for the satellite, weather and forecasting work (rasterio, numpy). FastAPI generates the OpenAPI contract automatically. | ✅ (your choice) |
| D-02 | **Database: PostgreSQL 16 + PostGIS 3.4** | Concurrent writes, real migrations (Alembic), spatial queries for photo-to-zone distances. | ✅ (your choice) |
| D-03 | **Deployment: Docker Compose + Caddy** on one Linux server | One command starts database, API, scheduled jobs and website; Caddy gets and renews HTTPS certificates by itself. | ✅ (your choice) |
| D-04 | **Admin login: email + password accounts, roles `admin` / `editor`** | Each person has their own account. Argon2id password hashing; sessions in an HttpOnly + Secure + SameSite=Strict cookie, stored hashed and revocable. Writes from other origins are refused (CSRF defence). | ✅ (your choice) |
| D-05 | **Same domain, API under `/api/v1`** | No CORS, one certificate. `FLORECE_CORS_ORIGINS` exists if a partner site ever calls the API from a browser. | ✅ (your choice) |
| D-06 | **Forecasting: provided data + simple baseline** | Imported forecasts (DAT-4) are published as they are. Otherwise: logistic fit on this season's colour curve when there are ≥ 6 points, else usual date ± historical spread. One module (`services/modelo.py`), easy to replace. | ✅ (your choice) |
| D-07 | **Email: mock only (`console` backend)** | No cost now. Every email (opt-in confirmation, alert, admin test) is logged and stored in the outbox shown in the admin panel. A real provider = one new class implementing `enviar()` + `FLORECE_EMAIL_BACKEND`. | 🟡 see P-05 |
| D-08 | **Real ingestion: AEMET OpenData + Sentinel-2 L2A** | Daily job at 06:00 (Europe/Madrid), alerts at 07:00. Same code from the admin button and the CLI. A failing source keeps its last valid data and is flagged as stale. Verified against the live Sentinel-2 archive (Oct 2026 scenes). | ✅ |
| D-09 | **One versioned public API (`/api/v1`) as the only contract** | The UI only talks to it. TypeScript types are generated from `openapi.json`; a new UI can be built from the OpenAPI document alone. Breaking changes → `/api/v2`. | ✅ |
| D-10 | **JSON in camelCase, domain names in Spanish** | Matches the spec's data model (`ventanas`, `tipoDato`, `fechaHabitual`…), so the spec, the database and the API use the same words. | ✅ |
| D-11 | **Three layers kept apart** in the model and in the API: calculated / editorial / commercial | Spec PRIN-3.1 and MON-3: editorial and commercial content have no write path into forecasts. `GET /destinos/{id}` returns them as separate blocks. | ✅ |
| D-12 | **Every forecast is a range with a confidence**; every value carries its data type and source | Spec PRIN-1.1, HON-2/3. Confidence: alta ≥ 85 %, media 75–85 %, baja < 75 %. | ✅ |
| D-13 | **Gaps are never interpolated** | A cloudy zone/day is stored as `null` with quality `nubes` and shown as "sin dato" (HON-4). | ✅ |
| D-14 | **Front end has two API adapters**: HTTP (real) and in-browser mock | The shared demo link can't reach a server, so `npm run build:demo` bundles a mock with the same API shapes. Production uses HTTP only. | ✅ |
| D-15 | **Satellite basemap bundled with the site** (Sentinel-2 mosaic + seasonal close-ups, ~9 MB) | Works offline and with a strict Content-Security-Policy; no third-party tile service, no cost. | 🟡 see P-14 |
| D-16 | **Citizen photos**: auto-accepted within 3 km of a zone and < 72 h old; no GPS → manual review; too far/old/duplicate → rejected; 5 photos per person per day | Spec CIT-3/CIT-6. Duplicates detected by SHA-256 and a perceptual hash. Only a re-encoded copy without any metadata is stored (CIT-7). Thresholds are environment variables. | 🟡 see P-13 |
| D-17 | **Dataset import as CSV** (`indice`, `temperaturas`, `habituales`, `prevision`) | The organisers' format is still unknown (spec §15.1). Raw files are kept untouched with SHA-256 and uploader (DATA-2/5). Formats documented in `backend/florece/services/importar.py`. | ⛔ see P-04 |
| D-18 | **Satellite colour index = calibrated "redness" (R−G)/(R+G)** per zone, clouds masked with the Sentinel-2 scene classification | A transparent placeholder until we know the organisers' index (spec §15.2). Calibration (`r0`, `r1`) and thresholds are per destination. | ⛔ see P-04 |
| D-19 | **Seed data**: `florece seed` loads the 4 destinations, content and offers; `--demo` also loads the sample observations/forecasts/photos | The site looks complete before real data arrives. In production run `seed` once (without `--demo`), then import the real data. | ✅ |
| D-20 | **API text and emails in Spanish**; editorial content has a language column (`es` only filled) | Spanish is the main language (UX-7). The UI is ES/EN; English editorial content needs translations (P-09). | 🟡 |
| D-21 | **Backups**: `deploy/backup.sh` (pg_dump + uploads), keeps 14 days locally | Simple and restorable. Off-server copy still needed (P-12). | 🟡 see P-12 |
| D-22 | **No analytics, no tracking cookies** | The only cookie is the admin session (strictly necessary), so no cookie banner is needed. | 🟡 see P-15 |
| D-23 | **"Today" can be pinned** with `FLORECE_FIXED_TODAY` | For demos (the hackathon week) and tests. Leave empty in production. | ✅ |

---

## 2. What I need from you

### Before going live

| ID | What | Where it goes | Blocking? |
|---|---|---|---|
| P-01 | **Domain name**, with a DNS `A` (and `AAAA` if IPv6) record pointing at the server, and an **email for Let's Encrypt** notices | `deploy/.env`: `DOMAIN`, `ACME_EMAIL` | ⛔ yes |
| P-02 | **Server details**: Linux distribution, Docker + Docker Compose installed, ports **80 and 443** open. Suggested minimum 2 vCPU, 4 GB RAM, 20 GB disk | — | ⛔ yes |
| P-03 | **AEMET OpenData API key** (free: https://opendata.aemet.es/centrodedescargas/altaUsuario) and, per destination, the **nearest AEMET station code (`idema`)** and the **municipality INE code** | Key: `deploy/.env` `FLORECE_AEMET_API_KEY`. Codes: admin › Destinos | ⛔ for weather data |
| P-07 | **Who gets admin accounts** (emails, and admin or editor role). I create nothing by default; the first admin is created with `florece crear-admin` | Server CLI, then admin › Usuarios | ⛔ yes |
| P-06 | **Legal texts**: privacy policy (alerts emails, citizen photos, GDPR), legal notice/terms, and who the **data controller** is (Greenia? the team?) | New pages on the site; the footer links are placeholders | ⛔ before collecting real emails/photos |

### Data and model

| ID | What | Notes |
|---|---|---|
| P-04 | **The organisers' datasets** (DAT-1…DAT-5): files, format, time coverage, **zone geometries** (polygons or only names?), **what the colour index is** (NDVI, own index, RGB?) and its range | With these I adapt the importer, set the zones' real positions/polygons and calibrate the satellite index and the phase thresholds (spec §15.1–15.5). Today's zone positions are placeholders. |
| P-10 | **Model validation data**: past seasons (dates of each phase, index series) to measure our model's error (MAE) and interval coverage. And: should we **beat, replicate, or only display** the provided forecast? (spec §15.4) | Until then the admin shows "Sin validar todavía" for MAE and coverage. |
| P-16 | **Destinations 3 and 4**: confirm Jerte and the Alpujarra (or swap for Azahar de Sevilla), and the sources for their usual dates | Usual dates in the seed are approximate placeholders. |

### Email (alerts / newsletter)

| ID | What | Notes |
|---|---|---|
| P-05 | **Email provider, when you want real sending**: any SMTP (Brevo, Postmark, SES, your hosting…) or a provider API; a **sender address on your domain** with SPF, DKIM and DMARC records | Only the mock exists (D-07). Adding a provider is a small change. Gmail/Yahoo require one-click unsubscribe; the `List-Unsubscribe` headers are already set. |
| P-17 | **Newsletter**: do you want a general newsletter on top of the per-destination alerts? | Not built. Alerts are transactional (one destination, one phase, double opt-in). A newsletter needs list management and campaign tooling, usually from the provider (Brevo, Mailchimp…), plus its own consent wording. |

### Admin panel and operations

| ID | What | Notes |
|---|---|---|
| P-08 | **Commercial content**: real stays/activities, their **affiliate or booking URLs**, prices, and any sponsor agreements (which destination, what text) | Today offers are samples with `[PRECIO]`. Editable in admin › Contenido y patrocinio (offers have a URL field in the API; the panel edits the sponsored flag and sponsor). |
| P-09 | **Editorial review and English translations** of each destination's story, what to see, access and tips | Editable in admin › Contenido. English content needs a language switch in that form (small change) once texts exist. |
| P-12 | **Off-server backups** (another server, S3-compatible bucket…) and **uptime monitoring** (e.g. a free external check on `/api/v1/salud`) | `backup.sh` keeps local copies only. |
| P-13 | **Photo moderation policy**: confirm the 3 km / 72 h / 5-per-day rules, who moderates, how long photos are kept, and whether photos may be shown publicly (spec §15.9) | All thresholds are environment variables. |
| P-14 | **Basemap**: OK with the bundled 2025 Sentinel-2 mosaic? Sharper imagery everywhere would need a paid tile provider (e.g. Mapbox, MapTiler, Esri) | Close-ups exist only around the 4 destinations. |
| P-15 | **Analytics**: none today. If wanted, prefer a cookieless, EU-hosted option (Plausible, Matomo self-hosted) to avoid a cookie banner | — |
| P-11 | **Brand**: "Cuándo Florece" or Greenia's brand in the product? (spec §15.10) | Name and logo are easy to change. |

---

## 3. How to change a decision

Most decisions are configuration (see `deploy/.env.example`). Code-level ones live in a single place:

| Decision | File |
|---|---|
| Forecast model (D-06) | `backend/florece/services/modelo.py` |
| Email provider (D-07) | `backend/florece/services/correo.py` |
| Satellite index (D-18) | `backend/florece/services/ingesta/sentinel.py` |
| Photo rules (D-16) | `backend/florece/services/fotos.py` + `FLORECE_PHOTO_*` |
| Import formats (D-17) | `backend/florece/services/importar.py` |
| API contract (D-09) | `backend/florece/schemas.py` → `florece openapi` → `npm run api:types` |
