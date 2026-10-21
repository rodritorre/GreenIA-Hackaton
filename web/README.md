# Cuándo Florece · web

Mapa vivo de la floración en España (React + Leaflet), sin paso de build:
el navegador carga directamente los módulos ES de `js/`. Es una web estática:
se publica tal cual la carpeta `web/`.

## Cómo arrancarla en local

Necesita un servidor local (los módulos y los datos de `data/` no cargan con `file://`):

```bash
cd web
npx serve .            # o: python -m http.server 8000
```

Para probar con cuentas y casos de prueba, pon `demo: true` en `js/config.js` (nunca en producción).

## Publicarla

1. Rellena `js/config.js`: `siteUrl` y las claves de EmailJS (ver `emailjs/README.md` en la raíz del repo).
2. Sustituye `TU-DOMINIO.es` en `index.html`, `robots.txt` y `sitemap.xml`.
3. Completa los `[COMPLETAR]` de `privacidad.html` con los datos del titular.
4. Sube la carpeta `web/` como raíz del sitio (Netlify o Cloudflare Pages: directorio de publicación `web`,
   sin comando de build). `_headers` trae la política de seguridad (CSP) y la caché; en otro hosting hay que
   trasladar esas cabeceras.
5. HTTPS obligatorio (lo dan los dos hostings anteriores).

## Formularios y correo (EmailJS)

Todos los formularios envían con `js/email.js` usando dos plantillas de EmailJS:
`equipo` (aviso interno con todos los datos) y `usuario` (confirmación para quien envía).

| Formulario | Dónde | Correo al equipo | Confirmación |
| --- | --- | --- | --- |
| Avisos de floración | `sections.js` (`Ff`) | sí | sí |
| Observación ciudadana (con foto comprimida adjunta) | `sections.js` (`Zf`) | sí | si deja email |
| Alta de negocio | `negocio.js` | sí | sí |
| Contacto para la licencia de destino | `negocio.js` | sí | sí |
| Solicitud de reserva de un pack (sin pago) | `reserva.html` + `js/reserva.js` | sí | sí |

Si EmailJS no está configurado, los formularios lo dicen al enviar y no fingen haber enviado nada.

## Limitaciones conocidas (sin servidor)

- **Cuentas y panel del pueblo**: se guardan en `localStorage`, solo en el navegador de cada persona.
  Lo que un pueblo publica (pausa, aforo, agenda, alternativas) no lo ven otros visitantes hasta que haya
  una base de datos (p. ej. Supabase o Firebase).
- **Panel interno (`#admin`)**: usa datos de ejemplo; solo se abre con `demo: true`.
- **Avisos**: llegan al correo del equipo; el envío del aviso cuando llega la fecha es manual.

## Estructura

```
web/
├── index.html                 Esqueleto: metadatos, estilos y js/main.js
├── reserva.html               Solicitud de reserva de un pack (sin pago)
├── privacidad.html            Aviso legal y privacidad (plantilla con [COMPLETAR])
├── favicon.svg, robots.txt, sitemap.xml, _headers
├── css/
│   ├── tokens.css             Variables de diseño (colores, radios…) en :root
│   ├── base.css               Ajustes base (safe-area, color-scheme)
│   ├── styles.css             Estilos de la app
│   ├── extra.css              Filtros, cuenta, panel del pueblo, impacto y precios
│   └── vendor/leaflet.min.css
├── js/
│   ├── config.js              ÚNICO archivo a tocar para publicar (dominio, EmailJS, modo demo)
│   ├── email.js               Envío con EmailJS y compresión de fotos
│   ├── main.js                Punto de entrada: monta la app y el router (#admin, #destino)
│   ├── i18n.js                Textos ES/EN y hook tt()
│   ├── i18n-extra.js          Textos nuevos y corregidos, fusionados en i18n.js
│   ├── sections.js            Cabecera, hero, avisos, verificación ciudadana, pie…
│   ├── explorar.js            Listado de destinos, filtros, leyenda
│   ├── ficha.js               Ficha de destino (cuándo ir, qué ver, dormir y hacer)
│   ├── packs.js               Packs de viaje por mes
│   ├── negocio.js             Impacto, «Quién paga», contacto y alta de negocio
│   ├── auth.js                Inicio de sesión y registro (localStorage)
│   ├── pueblo.js              Panel del pueblo (#destino): promoción, aforo, alternativas, agenda
│   ├── reserva.js             Lógica de reserva.html
│   ├── admin.js               Panel interno (#admin, solo modo demo)
│   ├── map/map.js             Mapa Leaflet: capas de satélite, marcadores, zoom
│   ├── components/            Iconos, ilustraciones SVG y piezas de UI
│   ├── data/                  Destinos, packs, tarifas, lo que publican los pueblos y geometría
│   ├── utils/                 Fechas, fases y scroll a secciones
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
Los packs (`packs.js`) y sus tarifas (`ofertasMes.js`) citan su fuente en cada dato.

**Regla: si un dato no tiene fuente, no se pone.** No hay ofertas, fotos, suscriptores ni cifras de demanda
de ejemplo en la web pública.

Canarias aparece en un recuadro en la esquina del mapa. Al pulsarlo, el mapa vuela a las islas.
Allí, a zoom bajo, se usa la ortofoto de Esri, porque las teselas Sentinel propias no cubren las islas.

## Notas

- El código se extrajo del bundle compilado original, así que los nombres de variables
  son cortos (`Ot` = destinos, `tt` = traducciones, `a` = JSX runtime, `ce` = React).
  Al tocar algo, renombrad con calma lo que vayáis entendiendo.
- Para editar destinos, empezad por `js/data/destinos.js`; para textos, `js/i18n.js` y `js/i18n-extra.js`.
- A partir del zoom 10 el mapa usa la ortofoto de Esri World Imagery (necesita internet).
