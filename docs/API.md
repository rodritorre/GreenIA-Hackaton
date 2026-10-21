# API v1

Base URL: `https://DOMAIN/api/v1`. Interactive documentation: `/api/v1/docs`.
Machine-readable contract: `/api/v1/openapi.json` (a copy is in `docs/openapi.json`).

Conventions: JSON in camelCase; dates `YYYY-MM-DD`; timestamps ISO 8601 with offset (Europe/Madrid).
Errors: `{"detail": "message"}` with the usual HTTP status codes. Every forecast is a range
(`desde`, `hasta`) with `confianza` and `probabilidad`; every value carries `tipoDato` and `fuente`.

## Public (no login)

| Method | Path | What |
|---|---|---|
| GET | `/salud` | Health check |
| GET | `/estado-datos` | Today's date, last update, status of each source |
| GET | `/destinos` | Active destinations with current state, phase windows and usual dates |
| GET | `/destinos/{id}?idioma=es` | Full page: `destino`, `calculado`, `editorial`, `comercial` blocks |
| GET | `/destinos/{id}/serie?desde&hasta` | Daily colour index (mean of zones) + max temperature, forecast band |
| GET | `/destinos/{id}/prevision` | Phase windows with confidence, method and source |
| GET | `/mapa?fecha=YYYY-MM-DD` | State of every destination on a date (observed today, forecast later) |
| GET | `/ofertas?destinoId=` | Stays and activities (commercial layer) |
| GET | `/fotos?destinoId=` | Verified citizen photos; image at `/fotos/{id}/imagen` |
| POST | `/alertas` | Subscribe (`email`, `destinoId`, `fase`, `antelacionDias`, `consentimiento`) → confirmation email |
| GET | `/alertas/confirmar?token=` | Double opt-in link |
| GET/POST | `/alertas/baja?token=` | One-click unsubscribe (RFC 8058) |
| POST | `/observaciones` | Multipart photo upload (`foto`, `destinoId`, `fase`, `consentimiento`, optional `lat`/`lon`) → checks |

## Auth

| Method | Path | What |
|---|---|---|
| POST | `/auth/login` | `{email, password}` → sets the session cookie |
| POST | `/auth/logout` | Ends the session |
| GET | `/auth/yo` | Current user |

## Admin (session required; ★ = admin role, the rest also editor)

| Method | Path | What |
|---|---|---|
| GET | `/admin/fuentes`, `/admin/ingesta/log`, `/admin/ingesta/ejecuciones` | Data status |
| POST ★ | `/admin/ingesta/ejecutar` | Run the daily ingestion now |
| POST ★ | `/admin/importar` | Upload a CSV dataset (`destinoId`, `dataset`, `archivo`) |
| GET | `/admin/previsiones`, `/admin/previsiones/comparativa` | Forecasts and model comparison |
| POST ★ | `/admin/previsiones/recalcular` | Recompute states and forecasts |
| GET | `/admin/fotos?estado=` · POST `/admin/fotos/{id}/moderar` | Moderation queue |
| GET | `/admin/alertas/suscripciones`, `/admin/correos` | Subscriptions, outbox |
| POST | `/admin/alertas/prueba` · POST ★ `/admin/alertas/despachar` | Test alert, send due alerts |
| GET · POST ★ · PATCH ★ | `/admin/destinos[/{id}]` | Destination configuration |
| GET · PUT | `/admin/destinos/{id}/editorial` | Editorial content |
| PUT ★ | `/admin/destinos/{id}/patrocinio` | Sponsor |
| GET · POST · PATCH · DELETE ★ | `/admin/ofertas[/{id}]` | Offers |
| GET ★ · POST ★ · PATCH ★ | `/admin/usuarios[/{id}]` | Accounts |

## Building another client

Generate types from the contract, e.g. TypeScript: `npx openapi-typescript docs/openapi.json -o schema.d.ts`,
Python: `datamodel-codegen --input docs/openapi.json`. The web front end does exactly this
(`frontend/src/api/schema.d.ts`).
