// Envío de formularios con EmailJS (API REST, sin librería).
// Dos plantillas para todos los formularios (el plan gratuito de EmailJS permite 2):
//   · equipo:  aviso interno con todos los datos del formulario
//   · usuario: confirmación para quien lo envía (solo si dejó su email)
import { config, emailConfigurado } from "./config.js";

const API = "https://api.emailjs.com/api/v1.0/email/send";

async function enviarPlantilla(template_id, template_params) {
  const r = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: config.emailjs.serviceId,
      template_id,
      user_id: config.emailjs.publicKey,
      template_params,
    }),
  });
  if (!r.ok) throw new Error(`EmailJS ${r.status}: ${(await r.text()).slice(0, 200)}`);
}

// Convierte {Etiqueta: valor} en texto legible para el correo.
const resumen = (campos) =>
  Object.entries(campos)
    .filter(([, v]) => v !== void 0 && v !== null && v !== "")
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

/**
 * Envía un formulario.
 * @param {object} o
 * @param {string} o.tipo        Identificador corto: aviso | reserva | negocio | observacion | contacto
 * @param {string} o.asunto      Asunto del correo al equipo
 * @param {object} o.campos      {Etiqueta: valor} con lo que ha rellenado la persona
 * @param {string} [o.email]     Email de quien envía (reply_to y confirmación)
 * @param {string} [o.nombre]    Nombre de quien envía
 * @param {object} [o.confirmacion] {asunto, mensaje} para el correo al usuario
 * @param {string} [o.adjunto]   Imagen como data URL (adjunto variable "adjunto" en la plantilla)
 */
async function enviarFormulario({ tipo, asunto, campos, email, nombre, confirmacion, adjunto }) {
  if (!emailConfigurado()) throw new Error("email-no-configurado");
  const comun = { tipo, sitio: config.siteUrl, fecha: new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" }) };
  await enviarPlantilla(config.emailjs.templates.equipo, {
    ...comun,
    asunto,
    resumen: resumen(campos),
    reply_to: email || "",
    nombre: nombre || "",
    adjunto: adjunto || "",
  });
  if (email && confirmacion && config.emailjs.templates.usuario)
    await enviarPlantilla(config.emailjs.templates.usuario, {
      ...comun,
      to_email: email,
      to_name: nombre || "",
      asunto: confirmacion.asunto,
      mensaje: confirmacion.mensaje,
      resumen: resumen(campos),
    });
}

// Reduce una foto a JPEG pequeño para poder adjuntarla (EmailJS limita el tamaño).
async function fotoComprimida(file, maxLado = 960, maxBytes = 45e3) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((ok, mal) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = mal;
      i.src = url;
    });
    let lado = maxLado,
      q = 0.7,
      out = "";
    for (let n = 0; n < 8; n++) {
      const s = Math.min(1, lado / Math.max(img.width, img.height)),
        c = document.createElement("canvas");
      c.width = Math.round(img.width * s);
      c.height = Math.round(img.height * s);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      out = c.toDataURL("image/jpeg", q);
      if (out.length * 0.75 <= maxBytes) return out;
      q > 0.45 ? (q -= 0.1) : (lado = Math.round(lado * 0.8));
    }
    return out;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export { enviarFormulario, fotoComprimida };
