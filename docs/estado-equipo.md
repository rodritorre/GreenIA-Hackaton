> **Documento histórico (21 de octubre).** El estado actual del proyecto está en el [README](../README.md).

# Cuándo Florece · Reto Greenia (Hackathon EPS UFV, 20–22 oct 2026)

Mapa vivo de la floración en España: adónde ir, cuándo y con qué confianza.

- **Web:** carpeta [`web/`](web/) (React + Leaflet, sin build). Cómo arrancarla y estructura en [`web/README.md`](web/README.md).
- **Datos de Greenia:** CSV en `origin/`. Se pasan a la web con `node scripts/csv-a-web.mjs`.
- **Lista de ideas original:** [`TODO.MD`](TODO.MD). Abajo está su estado revisado contra el código.

---

## Lo que queda por hacer (por prioridad)

### Antes de la mentoría (hoy, miércoles 21, 18:20–19:00)

- [ ] Llevar estas dudas a la mentoría:
  - ¿Cómo calculáis el índice de color por zona? Con los CSV agregados no lo podemos reproducir.
  - ¿Qué umbrales usáis para pasar de inicio a avance y a pleno? Nosotros usamos 0,20 · 0,45 · 0,70.
  - El inicio del 4 de septiembre en Tejera Negra está marcado como «revisar». ¿Puede ser estrés por sequía y no color otoñal?
  - ¿Qué cobertura tienen los márgenes «probable» y «amplio» de la previsión de Brihuega 2027 (50 %, 80 %, 90 %…)?
  - ¿Tenéis las coordenadas de las 7 zonas de Tejera Negra y datos de la fase final (caída de hoja)?
  - ¿Podemos usar la ortofoto de Esri en el producto o preferís otra fuente para el zoom cercano?

### Imprescindible para el jueves

- [ ] **Publicar la web** en una URL (GitHub Pages, Netlify o Vercel). Ahora solo funciona con un servidor local.
- [ ] **Correo de contacto real.** El botón «Hablemos» y el pie apuntan a `#`.
- [ ] **Página de privacidad** con el correo correcto. El enlace del pie va a `#`.
- [ ] **Subir los CSV y el conversor a git** (`origin/`, `scripts/`, `web/js/data/reales.js`), que aún no están en el repo.
- [ ] **Preparar la demo:** guion de 3 minutos (problema → mapa → ficha con margen honesto → aviso → negocio).

### Muy recomendable

- [ ] **Viajes organizados con fechas actuales.** No existe ninguna sección. La idea es añadir «Escapadas» con 2–3 paquetes por destino ligados a la ventana prevista.
- [ ] **Hostelería: dónde comer.** Las fichas solo tienen alojamiento y actividades (de ejemplo, con `[PRECIO]`). Faltan restaurantes.
- [ ] **Letra para público adulto.** El cuerpo es de 16 px y hay unas 90 reglas por debajo de 16 px. Subir la base a 18 px y revisar contraste y tamaño de botones.
- [ ] **Portada más directa:** «¿Adónde voy este fin de semana?» y 3 destinos recomendados para el próximo fin de semana.
- [ ] **Simplificar la página.** Ahora tiene hero, mapa, calendario, planes, avisos, verificación ciudadana, negocio y pie. Valorar quitar o plegar secciones.

### Si da tiempo (retos extra)

- [ ] **Previsión que use el tiempo.** Ahora las ventanas salen de fechas de referencia de otros años. Falta un modelo que tenga en cuenta las temperaturas (por ejemplo, días fríos por debajo de 15 °C).
- [ ] **Conectar AEMET OpenData** para que las temperaturas se actualicen solas.
- [ ] **Avisos reales:** el formulario solo simula el envío. Falta enviar correos (y WhatsApp, que no existe).
- [ ] **Fotos ciudadanas reales:** hay interfaz y moderación de ejemplo, pero no se sube nada ni se comprueba la ubicación del móvil.
- [ ] **Filtro por distancia** («cerca de mi ciudad») en el mapa.
- [ ] **Compartir o imprimir el plan** desde la ficha.
- [ ] **Datos medidos para Jerte, Alpujarra, Tejeda y Teide.** Sus fechas y textos ya salen de fuentes públicas citadas en cada ficha, pero son rangos orientativos, no observaciones por satélite. Confirmar con los organizadores de cada fiesta las fechas de 2027.

---

## Estado del TODO.MD

✅ hecho · 🟡 a medias · ❌ sin hacer

### Lista inicial

| Punto | Estado | Detalle |
| --- | --- | --- |
| Movimiento *smooth* de la web | ✅ | `scroll-behavior: smooth`, scroll suave a secciones y vuelos animados del mapa; se desactiva con «reducir movimiento» |
| Correo de la web | ❌ | No hay correo de contacto; «Hablemos» enlaza a `#` |
| Simplificación de la web | 🟡 | Estructura del código simplificada (módulos), pero la página sigue teniendo muchas secciones |
| Recomendaciones de hostelería | 🟡 | Alojamiento y actividades de ejemplo por destino (`[PRECIO]`); sin restaurantes |
| Cambiar el correo de la política de privacidad | ❌ | No existe la página de privacidad; el enlace va a `#` |
| Mejora del mapa interactivo | ✅ | Zoom hasta nivel 18 nítido, Canarias con recuadro, capa de 7 zonas, destinos con estado |
| Viajes organizados en fechas actuales | ❌ | No hay sección de viajes ni paquetes |

### Mínimo exigible del reto

| Punto | Estado | Detalle |
| --- | --- | --- |
| Mapa navegable con 3–4 destinos | ✅ | 7 destinos: Tejera Negra, Brihuega, Montejo, Tejeda, Teide, Jerte y Alpujarra |
| Datos reales de Greenia | ✅ | Los 9 CSV están integrados (Tejera Negra, Montejo, Brihuega). AEMET no está conectado |
| Propuesta de experiencia de usuario | 🟡 | La web es la propuesta; falta contarla en la presentación |
| Argumento de monetización | ✅ | Sección «Para destinos y empresas»: comisión por alojamiento y actividades, patrocinio, datos por API |
| Prototipo que funcione | 🟡 | Funciona en local; falta publicarlo |
| Dudas para la mentoría | 🟡 | Lista preparada arriba |

### Retos extra

| Punto | Estado | Detalle |
| --- | --- | --- |
| Previsión de fechas con margen de confianza | 🟡 | Rangos con confianza y probabilidad cuando se puede justificar; sin modelo meteorológico |
| Verificación ciudadana con fotos | 🟡 | Interfaz y panel de moderación con datos de ejemplo |
| Alertas «avísame cuando llegue la flor» | 🟡 | Formulario y vista previa del correo; no envía nada y no hay WhatsApp |

### Mejoras detectadas en cuandoflorece.es

| Punto | Estado | Detalle |
| --- | --- | --- |
| Mensajes contradictorios | ✅ | El estado de cada destino sale de un único cálculo |
| Ejemplo desfasado del Jerte 2025 | ✅ | No aparece |
| Más destinos con datos | 🟡 | 3 de 7 con datos reales |
| Validación contada con honestidad | ✅ | Sin cifras infladas; se marcan los hitos pendientes de revisar y los huecos por nubes |
| El color por satélite es una estimación | ✅ | Aviso en cada ficha y en «Cómo calculamos esto» |
| Estado con texto + icono + color | ✅ | Cada fase tiene icono propio, texto y leyenda |
| Contacto visible | ❌ | Ver «Correo de la web» |
| Monetización concreta | 🟡 | Ofertas de ejemplo con `[PRECIO]`; faltan socios reales |
| Lenguaje de viaje, no técnico | 🟡 | La ficha habla de viaje, pero algunos textos (zonas, método) nombran Sentinel-2 y bandas |
| Priorizar flores turísticas | ✅ | Cerezo, almendro, lavanda, hayedos y tajinaste; nada de azafrán ni arroz |

### Web nueva para público adulto

| Punto | Estado | Detalle |
| --- | --- | --- |
| Letra grande (mín. 18 px), contraste, botones amplios | ❌ | Base de 16 px y muchos textos más pequeños |
| Un mensaje principal por pantalla | 🟡 | El hero sí; el resto de la página es densa |
| Animaciones suaves con «reducir movimiento» | ✅ | `prefers-reduced-motion` respetado |
| Portada «¿Adónde voy este fin de semana?» + 3 destinos | 🟡 | Portada «Adónde ir, cuándo y con qué confianza» con «En su momento hoy» y «Lo próximo» |
| Mapa con filtros por mes, flor y distancia | 🟡 | Mes y tipo de flor sí; distancia no |
| Ficha: cuándo ir, qué ver, dormir, comer, rutas | 🟡 | Todo menos «comer» |
| Escapadas / viajes organizados | ❌ | Ver «Viajes organizados» |
| «Cómo lo sabemos» corto y honesto | ✅ | Ventana «Cómo calculamos esto» |
| Contacto visible, imprimir/compartir plan | ❌ | Ninguno de los dos |
| Monetización: afiliados, patrocinio, agencias | 🟡 | Afiliados y patrocinio sí; agencias no |
