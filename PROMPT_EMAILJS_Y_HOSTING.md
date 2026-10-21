Eres mi asistente para terminar la puesta en producción de «Cuándo Florece», una web estática que ya está en este repositorio. Tu trabajo es solo configurar EmailJS, publicar la web y comprobar que todo funciona. No rediseñes, no cambies textos ni colores y no añadas funciones.

## Contexto del repositorio (léelo antes de tocar nada)
- La web es la carpeta `web/`: HTML + módulos ES, sin build. Se publica tal cual.
- `web/README.md` explica la estructura, los formularios y las limitaciones.
- `web/js/config.js` es el ÚNICO archivo de configuración: dominio (`siteUrl`), modo demo (`demo`, debe quedar en `false`) y claves de EmailJS.
- `web/js/email.js` envía todos los formularios con la API REST de EmailJS usando dos plantillas: `equipo` y `usuario`.
- `emailjs/equipo.html` y `emailjs/usuario.html` son las plantillas. El comentario de cabecera de cada una dice exactamente qué poner en Subject, To Email, Reply To, adjunto y qué variables llegan.
- `web/_headers` lleva la CSP y la caché (formato Netlify / Cloudflare Pages).
- `web/privacidad.html` es una plantilla con huecos `[COMPLETAR]`.

## Reglas
1. No inventes ningún dato: ni precios, ni nombres, ni datos legales, ni cifras. Si falta algo, pregúntamelo y deja el hueco como está.
2. No cambies `demo` a `true` en producción ni metas cuentas de prueba.
3. No subas a git claves privadas. La Public Key de EmailJS es pública por diseño y sí va en `config.js`. La Private Key nunca.
4. Antes de dar algo por hecho, compruébalo (envío real, cabeceras reales). Si algo falla, dime el error literal.

## Pasos

### 1. EmailJS
1. Pídeme el correo del equipo, que es el que recibirá los formularios.
2. Guíame para crear la cuenta en emailjs.com y conectar ese correo en Email Services. Apunta el Service ID.
3. Crea la plantilla `equipo` con el contenido de `emailjs/equipo.html` y los ajustes de su cabecera. Incluye el adjunto variable: parámetro `adjunto`, nombre `foto.jpg`, tipo `image/jpeg`. Apunta el Template ID.
4. Crea la plantilla `usuario` con `emailjs/usuario.html` y sus ajustes. El Reply To va fijo al correo del equipo. Apunta el Template ID.
5. Copia la Public Key (Account → General).
6. Rellena `web/js/config.js`: `publicKey`, `serviceId`, `templates.equipo` y `templates.usuario`. Comprueba que `demo` es `false`.
7. Comprueba en la documentación actual de EmailJS los límites del plan: envíos al mes, número de plantillas y tamaño máximo de adjunto. Cada formulario gasta 2 envíos. `fotoComprimida()` en `web/js/email.js` reduce la foto a 45 KB como máximo (`maxBytes = 45e3`). Si el límite real de adjunto es distinto, ajusta solo ese número y dímelo.
8. Busca en el panel de EmailJS la opción de seguridad para restringir los dominios que pueden enviar y limítala al dominio final. Si quiero más protección contra spam, propónme activar reCAPTCHA, pero no lo actives sin preguntar, porque requiere tocar código.

### 2. Dominio y textos legales
1. Pídeme el dominio final y sustituye `TU-DOMINIO.es` en `web/js/config.js` (`siteUrl`, sin barra final), `web/index.html` (canonical y og:url), `web/robots.txt` y `web/sitemap.xml`.
2. Pídeme los datos del titular (nombre o razón social, NIF, domicilio, email de contacto), el plazo de conservación de los datos y los proveedores (correo y hosting) para completar todos los `[COMPLETAR]` de `web/privacidad.html`. No los inventes. Recomiéndame que alguien con conocimientos de RGPD/LSSI revise el texto final.

### 3. Hosting
1. Recomiéndame Netlify o Cloudflare Pages, porque los dos aplican `web/_headers` sin configuración extra. Si elijo otro (Vercel, Apache, Nginx, GitHub Pages), traslada las mismas cabeceras a su formato. Avísame si el hosting elegido no permite cabeceras, como GitHub Pages.
2. Configuración: directorio de publicación `web`, sin comando de build y sin redirecciones (la web usa rutas con `#`).
3. Conecta el dominio y activa HTTPS, que es obligatorio.

### 4. Comprobaciones después de publicar (hazlas todas y dame el resultado)
- Carga la portada en una ventana privada: la consola del navegador no debe mostrar errores ni bloqueos de la CSP. El mapa debe verse, con zoom a partir del nivel 10 (ortofoto de Esri) y en Canarias.
- Comprueba con `curl -I https://DOMINIO/` que llegan las cabeceras `Content-Security-Policy`, `X-Content-Type-Options` y `Referrer-Policy`.
- Envía un formulario de cada tipo con un correo de prueba y confirma que llegan los dos correos (equipo y confirmación) con todos los campos:
  1. Avisos de floración (sección «Avísame cuando llegue la flor»).
  2. Verificación ciudadana con una foto de móvil real: el adjunto `foto.jpg` debe llegar y abrirse.
  3. Alta de negocio.
  4. Contacto de la licencia de destino (botón «Solicitar información» en «Quién paga y por qué»).
  5. Solicitud de reserva: abre un pack, pulsa «Solicitar reserva» y envía `reserva.html`.
- Comprueba que responder al correo del equipo contesta a quien envió el formulario (Reply To).
- Comprueba que `https://DOMINIO/privacidad.html` no tiene ningún `[COMPLETAR]`.
- Comprueba que `#admin` dice «Tu cuenta no tiene acceso a esta página».

### 5. Cierre
Haz un commit con los cambios de configuración (sin claves privadas) y dame un resumen con:
- la URL publicada,
- los IDs configurados,
- los límites del plan de EmailJS,
- el resultado de cada comprobación,
- lo que haya quedado pendiente.

## Lo que NO debes «arreglar» (son limitaciones conocidas y decididas)
- El inicio de sesión y el panel del pueblo (`#destino`) guardan los datos solo en el navegador (`localStorage`). Para que lo que publica un pueblo lo vean todos los visitantes hace falta una base de datos. No la añadas: si te lo pido, propónmelo como siguiente paso aparte.
- El envío automático de los avisos cuando llega la fecha no existe: los avisos llegan al correo del equipo y se envían a mano.
- `#admin` usa datos de ejemplo y solo funciona con `demo: true`, en local.
- Las tarifas de Hospedería Princesa Elima y Hotel La Fragua II (fuente: casasrurales.net) están pendientes de verificar a mano, igual que el horario de la visita guiada municipal de Brihuega del pack de julio. Avísame si las compruebas y no coinciden, pero no las cambies sin decírmelo.
