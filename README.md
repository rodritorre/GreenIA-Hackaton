# Cuándo Florece · Reto Greenia

**Hackathon EPS UFV, 20–22 de octubre de 2026.** Un mapa vivo de la floración en España que dice **adónde** ir, **cuándo** y **con qué confianza**. El viajero lo usa gratis; los destinos y los negocios lo contratan.

🔗 **Web en vivo:** https://cuandoflorece.cabecerastudio.com

## Archivos entregados

| Entregable | Archivo |
| --- | --- |
| Presentación del pitch | `entregables/` *(pendiente)* |
| Business Model Canvas | [entregables/business-model-canvas.pdf](entregables/business-model-canvas.pdf) |
| Memoria de viabilidad | [entregables/memoria-viabilidad.pdf](entregables/memoria-viabilidad.pdf) |
| Arquitectura y diagramas C4 | `entregables/` *(pendiente)* |
| Código | Este repositorio: `frontend/` (React + TypeScript), `backend/` (FastAPI + PostGIS), `origin/` (CSV de Greenia), `deploy/` (Docker y Caddy) |

## Cómo ejecutarlo

```bash
# Web (con la API simulada en el navegador, igual que la versión en vivo)
cd frontend && npm ci && npm run build:demo && npm run preview
```

El backend real y sus tests se explican en [`backend/`](backend/) y [`deploy/fullstack/`](deploy/fullstack/); los detalles técnicos están en [docs/TECNICO.md](docs/TECNICO.md).

## Funcionalidades

- **Mapa con 7 destinos:** Tejera Negra, Montejo, Brihuega, Jerte, Alpujarra, Tejeda y Teide. Cada uno con su estado y una previsión con margen: siempre un rango de fechas y su confianza, nunca una fecha exacta.
- **Ficha de cada destino:** cuándo ir, gráficas con los datos del satélite, qué ver y fuentes enlazadas.
- **Avisos** («avísame cuando llegue la flor») y **fotos ciudadanas** para confirmar el estado sobre el terreno.
- **Packs de viaje** con alojamiento y restaurantes reales, y **solicitud de reserva** sin pago.
- **Alta de negocios** con moderación.
- **Panel del pueblo:** muestra la demanda y permite controlar la visibilidad y el aforo.

## Resultados

- **Datos reales de Greenia integrados:**
  - Tejera Negra: índice de color por satélite, temperaturas, hitos y fechas de referencia. El inicio del color se detectó el 4 de septiembre, un mes antes de lo habitual.
  - Brihuega: cosecha de 2026 (61 % de unas 830 ha) y previsión para 2027 (plena flor entre el 1 y el 8 de julio).
  - Montejo: fechas de referencia de varios años.
- **Correo real:** los 5 formularios (aviso, foto, alta de negocio, contacto y reserva) llegan al equipo, y quien los envía recibe una confirmación.
- **Backend con 25 tests:** API, avisos, fotos, roles, importación de CSV, modelo y AEMET.

## Limitaciones

- En la web en vivo, la API funciona dentro del navegador. El backend real está probado, pero no desplegado.
- El índice de color por satélite es una estimación, no una medida. Las nubes dejan huecos, que no se rellenan.
- Solo Tejera Negra, Montejo y Brihuega tienen datos de Greenia. Jerte, Alpujarra, Tejeda y Teide usan fechas de fuentes públicas, con confianza baja.
- La moderación con IA son casos preparados: todavía no llama a ningún modelo.
- La demanda y los indicadores de impacto del panel del pueblo son simulados, y la web los marca como tales.
- La «fecha de hoy» de la demo está fijada en el 20 de octubre de 2026, la fecha de los datos.
- El plan gratuito de EmailJS permite 200 correos al mes y no admite adjuntos.
