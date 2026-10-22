# Cuándo Florece

**Llevamos visitantes a la España rural en su mejor momento, y el pueblo decide cuántos.**
Mapa de floración de España con previsión y margen de confianza: el viajero sabe adónde ir y cuándo, el destino controla su visibilidad y su aforo, y el negocio local aparece cuando el viajero decide. Reto Greenia, Hackathon EPS UFV, octubre de 2026.

**Prototipo en vivo:** https://cuandoflorece.cabecerastudio.com · Panel del pueblo: `/#destino`

## Archivos entregados

| Archivo | Contenido |
|---|---|
| Presentación | La del pitch |
| `business-model-canvas.pdf` | Los 9 bloques del modelo de negocio |
| `memoria-viabilidad.pdf` | Propuesta de valor, ingresos, costes, implantación, barreras, impacto e indicadores |
| `arquitectura-c4.pdf` | Arquitectura, diagramas C4 (contexto, contenedores, componentes), tecnologías, seguridad y límites |
| Este repositorio | `frontend/` (web, React + TypeScript), `backend/` (API FastAPI, tareas, 25 tests), `deploy/` (prototipo en vivo), `deploy/fullstack/` (despliegue de producción), `origin/` (datos de Greenia), `docs/` (API, decisiones, guía de desarrollo) |

## Cómo ejecutarlo

- **Demo (sin servidor de aplicación, como la web en vivo):** con Node 22, `cd frontend && npm ci && npm run build:demo && npm run preview`, y abrir http://localhost:4173.
- **Producción completa (API, base de datos y tareas):** con Docker, `cd deploy/fullstack && cp .env.example .env` (rellenar `DOMAIN`, `ACME_EMAIL`, `POSTGRES_PASSWORD`, `FLORECE_SECRET_KEY`; `FLORECE_AEMET_API_KEY` opcional) y `docker compose up -d`.
- **Tests del backend:** con una base PostgreSQL + PostGIS, `cd backend && pip install ".[dev]"` y `FLORECE_TEST_DATABASE_URL=postgresql+psycopg://usuario:clave@host:5432/florece_test pytest`.
- Más detalle: [docs/DESARROLLO.md](docs/DESARROLLO.md), [docs/API.md](docs/API.md).

## Funcionalidades

- Mapa de 7 destinos (hayedos, lavanda, cerezo, almendro, tajinaste) con el estado de hoy y la previsión por fechas, siempre como ventana con su confianza.
- Ficha de cada destino: cuándo ir, qué ver, dónde dormir y comer, con sus fuentes.
- Avisos «avísame cuando florezca», fotos ciudadanas con verificación y filtros del mapa.
- Packs de viaje con alojamientos y restaurantes reales, y reserva con confirmación por correo.
- Alta de negocio con moderación (aprobada o rechazada con su motivo).
- Panel del pueblo: demanda prevista por fechas y por origen, control de visibilidad y aforo; el mapa público muestra «aforo completo» y propone días y pueblos alternativos.

## Resultados

- Datos reales de Greenia integrados: Tejera Negra (índice de color por satélite en 7 zonas, temperaturas, hitos, previsión) y la lavanda de Brihuega.
- Los formularios envían correo real al equipo y una confirmación a quien los rellena.
- Backend con 25 tests automáticos que pasan; la web comprueba sus tipos contra el contrato OpenAPI de la API.
- Web en vivo con HTTPS y cabeceras de seguridad, en un servidor de la UE.

## Limitaciones

- En la web en vivo la API funciona dentro del navegador con el mismo contrato que la real; el backend está construido y probado, pero no desplegado.
- La demanda y el impacto del panel del pueblo son simulados y lo indica la web.
- La moderación con IA son casos preparados; el servicio está diseñado, no construido.
- Las reservas son de demostración: no se cobra nada.
- El índice de color por satélite es una estimación, no una medida. Jerte, Alpujarra, Tejeda, Teide y Montejo usan fechas de fuentes públicas, no datos de satélite propios.
- La fecha de «hoy» de la demo está fijada al 20 de octubre de 2026, la de los datos.

La versión original de la web del equipo se conserva en `web/` para comparar.
