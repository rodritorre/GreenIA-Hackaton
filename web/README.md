# Cuándo Florece · web

Prototipo del mapa vivo de la floración en España (React + Leaflet), sin paso de build:
el navegador carga directamente los módulos ES de `js/`.

## Cómo arrancarla

Necesita un servidor local (los módulos y los datos de `data/` no cargan con `file://`):

```bash
cd web
npx serve .            # o: python -m http.server 8000
```

## Estructura

```
web/
├── index.html                 Solo el esqueleto: enlaza estilos y js/main.js
├── css/
│   ├── tokens.css             Variables de diseño (colores, radios…) en :root
│   ├── base.css               Ajustes base (safe-area, color-scheme)
│   ├── styles.css             Estilos de la app
│   └── vendor/leaflet.min.css
├── js/
│   ├── main.js                Punto de entrada: monta la app y el router (#admin)
│   ├── i18n.js                Textos ES/EN y hook tt()
│   ├── sections.js            Cabecera, hero, calendario, negocio, pie…
│   ├── explorar.js            Listado de destinos, filtros, leyenda y avisos
│   ├── ficha.js               Ficha de destino (cuándo ir, qué ver, dormir y hacer)
│   ├── admin.js               Panel de administración (#admin)
│   ├── map/map.js             Mapa Leaflet: capas de satélite, marcadores, zoom
│   ├── components/            Iconos, ilustraciones SVG y piezas de UI
│   ├── data/                  Destinos, ofertas/fotos y geometría de España
│   ├── utils/                 Fechas y cálculo de fases
│   └── vendor/                React, ReactDOM, Leaflet y react-leaflet (minificados)
└── data/sat/                  Teselas Sentinel-2 en base64 (zoom 5–9 y detalle 10–14)
```

## Datos reales (CSV de Greenia)

Los CSV de Greenia están en `origin/` (en la raíz del repo). Un script los convierte en
`js/data/reales.js`, del que salen Tejera Negra, Brihuega y Montejo en `js/data/destinos.js`:

```bash
node scripts/csv-a-web.mjs     # ejecutar desde la raíz del repo cada vez que lleguen CSV nuevos
```

| CSV | Qué se usa en la web |
| --- | --- |
| `otono_avance_tejera_negra.csv` | Gráfica del índice de color (mediana y rango p25–p75 entre zonas) |
| `s2_otono_tejera_negra.csv` | Pasos con nubes (huecos en la gráfica) y detalle por zona (cálculo propio) |
| `otono_clima_tejera_negra.csv` | Gráfica de máximas diarias |
| `otono_hitos.csv` | Inicio del color observado (con aviso si está pendiente de revisar) |
| `referencia_fechas.csv` | Fechas habituales y ventanas de las fases aún no observadas (Tejera Negra y Montejo) |
| `avance_brihuega.csv`, `temporada_brihuega.csv` | Cosecha 2026 de Brihuega (gráfica y resumen) |
| `prediccion_2027_brihuega.csv` | Plena flor y cosecha 2027, con margen probable y amplio |
| `s2_brihuega.csv` | Solo el resumen de cobertura (parcelas y pasos de satélite) |

Los textos de cada destino (historia, qué ver, acceso, consejos), sus coordenadas y sus fuentes están en
`js/data/editorial.js`. Jerte, Alpujarra, Tejeda y Teide no tienen datos de Greenia: sus fechas habituales
resumen lo que dicen las fuentes citadas (`habitualesConFuente`) y cada ficha enlaza esas fuentes en «Qué ver».
Regla: si un dato no tiene fuente, no se pone.
Ofertas, fotos ciudadanas y suscripciones siguen siendo datos de ejemplo.

Canarias aparece en un recuadro en la esquina del mapa. Al pulsarlo, el mapa vuela a las islas.
Allí, a zoom bajo, se usa la ortofoto de Esri, porque las teselas Sentinel propias no cubren las islas.

## Notas

- El código se extrajo del bundle compilado original, así que los nombres de variables
  son cortos (`Ot` = destinos, `tt` = traducciones, `a` = JSX runtime, `ce` = React).
  Al tocar algo, renombrad con calma lo que vayáis entendiendo.
- Para editar destinos, empezad por `js/data/destinos.js`; para textos, `js/i18n.js`.
- A partir del zoom 10 el mapa usa la ortofoto de Esri World Imagery (necesita internet).
