# Cuándo Florece — UI mockup

The living bloom map of Spain (Greenia challenge, EPS UFV Hackathon, 20–22 Oct 2026).
It answers three questions: **where** the bloom is, **when** it will arrive, and **how confident** we are.

> **UI mockup only.** All data in `src/data/` is placeholder data shaped like the API contract (spec §8, §9.1).
> No business logic yet: ingestion, the state engine, the forecast model, alert emails and photo checks are simulated.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build
```

## Stack and why

| Piece | Choice | Why | Ruled out |
|---|---|---|---|
| Frontend | React 18 + TypeScript + Vite | Typed data contract, fast dev loop, static build that's easy to host | Plain HTML (gets hard to manage with this many states) |
| Map | Leaflet 1.9 + react-leaflet | Free, BSD licence, no API key | Google Maps (cost, key), MapLibre (vector tiles not needed yet) |
| Basemap | Bundled Sentinel-2 imagery (`public/sat/`), built by `scripts/build_satellite_tiles.py` | Same satellite the product uses; works offline and on hosts that block tile servers (NFR-3) | Live imagery tile services (need network, some have non-commercial licences) |
| Styling | Plain CSS with design tokens (`src/styles/tokens.css`) | Carries over the "Bloom Map Spain" design 1:1 | CSS framework |
| i18n | Small built-in dictionary (`src/i18n`) | ES first, EN ready (UX-7) | i18n library (overkill for now) |

## Satellite basemap

`public/sat/` holds WebP tiles packed into JSON (about 15 MB in total), read by `src/components/SatelliteLayers.tsx`:

- `base-z5-8.json`, `base-z9.json`: cloud-free summer 2025 mosaic of Spain and its neighbours.
- `detail.json`: close-ups (zoom 10–14) of each destination, taken in its own season: Tejera Negra in November 2025, Brihuega in July, Jerte in March and the Alpujarra in February.

They come from the public Sentinel-2 L2A archive on AWS (`s3://sentinel-cogs`). To rebuild them:

```bash
pip install rasterio mercantile mgrs shapely pillow numpy packaging
python scripts/build_satellite_tiles.py            # or: ... detail | base
```

Attribution: "Contains modified Copernicus Sentinel-2 data (2025)".

## Public site and admin panel

- `/` is the public site for tourists.
- `/#admin` is the internal Greenia panel (`src/admin/`): data sources and ingestion, forecast validation, photo moderation, alert test sends, destination set-up and editing of content and sponsorship. It's linked from the footer. In production it would be a separate, authenticated app; here it's a hash route so the mockup stays a single page.

## Structure

```
src/
  types.ts              data contract (Destino, VentanaFase, Zona, Prevision…)
  data/                 MOCK data: destinations, series, offers, photos, sources, demo clock
  lib/fenologia.ts      mock state engine (phase at a date) for the time selector
  lib/fechas.ts         date formatting (always ranges, never a single forecast date)
  i18n/                 es.ts (primary), en.ts
  components/           Header, Hero, MapSection, BloomMap, SatelliteLayers, DestinoList, ficha/*,
                        charts/*, PlansSection, AlertsSection, CitizenSection, BusinessSection,
                        MethodModal, Footer, ui/FlowerArt (species illustrations)
  admin/                internal panel: DataSection, ForecastSection, PhotosSection,
                        AlertsAdminSection, DestinationsSection, ContentSection
scripts/                build_satellite_tiles.py
```

The demo date is fixed in `src/data/config.ts` (`HOY = 2026-10-20`).

## Spec coverage (UI)

| Area | IDs | Where |
|---|---|---|
| Real navigable map, 4 destinations (Tejera Negra, Brihuega, Jerte, Alpujarra) | MIN-1, MAP-1, MAP-2 | `BloomMap` |
| Phase shown by colour **and** shape; legend | MAP-3, MAP-4, UX-6 | `PhaseGlyph`, `Legend` |
| Time selector (12 months + exact date), forecast mode with an uncertainty ring | MAP-6, MAP-7 | `DateSelector`, marker halo |
| Tejera Negra's 7 zones layer + zone detail with "no data" (clouds) | MAP-8, FIC-7, HON-4 | map layer, `CuandoIr` |
| Filter, search, synced list | MAP-9…11 | `DestinoList` |
| Visitor photo layer | MAP-12, FIC-14 | map layer, ficha |
| Destination page: "when to go" first, range + confidence, data type, source, update time | FIC-1…4, PRIN-1.1/1.2/1.4, PRIN-4.1, HON-2/3, UX-2/3 | `ficha/CuandoIr` |
| Index chart with forecast band, gaps not interpolated; temperature chart | FIC-5, FIC-6, HON-4 | `charts/Charts` |
| Margin narrowing over time; data-cutoff date | PRIN-1.3, TRA-2 | `MarginChart` |
| Provided forecast vs own model (MAE, coverage, one-line explanation) | PRED-4…6 | admin › Previsiones |
| Calculated / editorial / commercial blocks kept visibly separate | PRIN-3.1, PRIN-3.3, AC-7 | `LayerHeading`, ficha tabs |
| Honesty notice + "How we calculate this" | HON-1, HON-5, FIC-8, TRA-1, ENT-7 | `MethodModal` |
| Where to stay / what to do, sponsored items labelled | PRIN-4.2/4.3, FIC-11/12/15, MON-1…3 | `Comercial`, `PlansSection` |
| Alerts: destination + phase + notice period, double opt-in; test send in admin | EXT-3, ALR-1…5, NFR-7 | `AlertsSection`, admin › Avisos |
| Citizen verification: photo, location/time checks, one-tap phase, consent; moderation queue | EXT-2, CIT-1…7 | `CitizenSection`, admin › Fotos |
| Data status, stale source kept and flagged, logs, "run ingestion" button | PRIN-2.3, PRIN-2.5, NFR-4, UX-8/9 | admin › Datos, map status badge |
| Destination set-up by configuration; editorial/commercial editing | PRIN-2.4, PRIN-3.2, PHA-2 | admin › Destinos, Contenido |
| Business case on the page | MIN-4, MON-4…6 | `BusinessSection` |
| Map/data attribution (Copernicus, Natural Earth, AEMET) | NFR-6 | map + footer |
| Spanish UI, English ready; responsive | UX-5, UX-7 | `i18n`, CSS |

## Still to do (outside the UI mockup)

- Import DAT-1…DAT-5 and replace `src/data/*` with the real data (formats are still open questions, spec §15).
- AEMET/Sentinel ingestion job, state engine, forecast model, email sending, photo EXIF checks.
- Real zone polygons for Tejera Negra (currently points).
