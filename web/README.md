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

## Notas

- El código se extrajo del bundle compilado original, así que los nombres de variables
  son cortos (`Ot` = destinos, `tt` = traducciones, `a` = JSX runtime, `ce` = React).
  Al tocar algo, renombrad con calma lo que vayáis entendiendo.
- Para editar destinos, empezad por `js/data/destinos.js`; para textos, `js/i18n.js`.
- A partir del zoom 10 el mapa usa la ortofoto de Esri World Imagery (necesita internet).
