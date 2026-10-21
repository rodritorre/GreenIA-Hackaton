# EmailJS · plantillas de Cuándo Florece

La web usa **dos plantillas** para todos sus formularios (el plan gratuito de EmailJS
permite pocas plantillas, así que se reutilizan):

| Archivo | Plantilla | Para quién |
| --- | --- | --- |
| `equipo.html` | `equipo` | El correo del equipo, con todos los datos del formulario |
| `usuario.html` | `usuario` | Confirmación para quien envía (solo si dejó su email) |

Cada archivo explica en su comentario inicial el asunto, destinatario, Reply-To,
y variables que hay que configurar en EmailJS (sin adjuntos: el plan gratuito no los permite).

Cada formulario enviado gasta **2 envíos** (equipo + confirmación). Revisa la cuota del plan.

Las claves van en `web/js/config.js`:

```js
emailjs: {
  publicKey: "…",          // Account → General → Public Key
  serviceId: "…",          // Email Services
  templates: { equipo: "…", usuario: "…" },
},
```
