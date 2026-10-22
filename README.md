# Cuándo Florece · Reto Greenia

**Hackathon EPS UFV, 20–22 de octubre de 2026.** Un mapa vivo de la floración en España que responde a tres preguntas: **adónde** ir, **cuándo** y **con qué confianza**.

🔗 **Demo publicada:** https://cuandoflorece.cabecerastudio.com

## Archivos entregados

| Carpeta | Contenido |
| --- | --- |
| `web/` | Web estática (React + Leaflet, sin compilación): mapa, fichas, packs, avisos, reservas y alta de negocios |
| `frontend/` | La misma app en React + TypeScript, con el panel de destino (`#destino`) e interno (`#admin`). Es la versión publicada |
| `backend/` | API en Python (FastAPI + PostGIS), con ingesta diaria (AEMET, Sentinel-2), modelo de previsión, avisos y 25 tests |
| `origin/` | Los 9 CSV de Greenia (Tejera Negra, Montejo y Brihuega) |
| `scripts/` | `csv-a-web.mjs`, que convierte los CSV en datos para `web/`, y el script de despliegue |
| `deploy/`, `emailjs/` | Docker Compose y Caddy para producción, y plantillas de correo |
| `docs/` | Documentación técnica, decisiones, API y estado del equipo |

## Cómo ejecutarlo

**Web estática** (lo más rápido, solo hace falta Node):

```bash
cd web
npx serve .          # y abrir http://localhost:3000
```

Si llegan CSV nuevos de Greenia: `node scripts/csv-a-web.mjs` desde la raíz.

**App completa** (requiere Node 22, Python 3.12 y PostgreSQL con PostGIS): ver [`docs/TECNICO.md`](docs/TECNICO.md). Para una demo sin servidor: `cd frontend && npm install && npm run build:demo`.

## Funcionalidades

- **Mapa navegable** con 7 destinos: Tejera Negra, Montejo, Brihuega, Jerte, Alpujarra, Tejeda y Teide. Incluye Canarias en un recuadro, zoom hasta nivel de calle y estado de cada destino con icono, texto y color.
- **Selector de fecha y previsión con margen:** siempre un rango de fechas y un nivel de confianza, nunca una fecha exacta.
- **Ficha de destino:** cuándo ir, gráficas con datos reales (índice de color y temperaturas, o avance de la cosecha), detalle por zona, qué ver, cómo llegar y fuentes enlazadas.
- **Filtros** por fase, región, especie y datos de Greenia.
- **Packs de viaje** por mes, con alojamiento y comida, y solicitud de reserva.
- **Avisos** («avísame cuando llegue la flor»), verificación ciudadana con fotos, e inicio de sesión con roles (viajero, negocio, ayuntamiento).
- **Modelo de negocio:** comisión del 8 al 10 % por reserva, panel de pago para ayuntamientos y alta de negocios con moderación.

## Resultados con los datos de Greenia

- **Tejera Negra:** el satélite marca el inicio del color el 4 de septiembre, unos 31 días antes de lo habitual (7 de octubre). Greenia lo tiene pendiente de revisar. El índice sigue por debajo del umbral de avance: 0,257 el 14 de octubre. 15 de los 45 pasos del satélite tienen nubes y se muestran como hueco, sin rellenar.
- **Brihuega:** en la cosecha de 2026 se cortó el 61 % de unas 830 ha (el 10 % el 21 de julio y el 50 % el 11 de agosto). La previsión para 2027 sitúa la plena flor entre el 1 y el 8 de julio.
- **Montejo:** según las fechas de referencia, el pleno color llega entre el 2 y el 13 de noviembre. Es un rango histórico de 6 años, con un 71 % de probabilidad.

## Limitaciones

- Solo **Tejera Negra, Montejo y Brihuega** tienen datos de Greenia. Jerte, Alpujarra, Tejeda y Teide usan fechas orientativas de fuentes públicas, con confianza baja.
- No hemos podido reproducir el índice de color **por zona** con los datos agregados. Las posiciones de las 7 zonas en el mapa son aproximadas, porque los CSV no traen coordenadas.
- Las fases que el satélite aún no ha visto se estiman con fechas de otros años, así que sus ventanas son amplias. Por ejemplo, el pleno de Tejera Negra va del 15 de octubre al 19 de diciembre.
- En la web estática, las cuentas, avisos y reservas se guardan solo en el navegador. Para enviar correos hay que configurar EmailJS en `web/js/config.js`.
- En la demo publicada, las cifras de demanda e impacto del panel de destino y la moderación de negocios son simuladas, y aparecen marcadas como tales.
- Antes de publicar la web estática hay que completar el dominio (`TU-DOMINIO.es`) y los datos de `privacidad.html`.
