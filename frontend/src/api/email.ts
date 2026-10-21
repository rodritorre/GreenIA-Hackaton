// Form delivery through EmailJS's REST API (no library), as in the team's web/js/email.js.
// Two templates cover every form (the free plan allows two):
//   equipo:  internal email with all the form data
//   usuario: confirmation for the sender (only when they left an email)
// The demo has no backend, so the browser sends; in production the API does it (backend correo.py).
import { config, emailConfigurado } from '../config';

const API = 'https://api.emailjs.com/api/v1.0/email/send';

async function enviarPlantilla(templateId: string, params: Record<string, string>) {
  const r = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ service_id: config.emailjs.serviceId, template_id: templateId, user_id: config.emailjs.publicKey, template_params: params }),
  });
  if (!r.ok) throw new Error(`EmailJS ${r.status}: ${(await r.text()).slice(0, 200)}`);
}

type Campos = Record<string, string | number | null | undefined>;

/** {Label: value} as readable lines for the email body. */
const resumen = (campos: Campos) =>
  Object.entries(campos)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');

export interface Formulario {
  /** Short id: aviso | reserva | negocio | observacion | contacto */
  tipo: string;
  asunto: string;
  campos: Campos;
  /** Sender's email: reply-to for the team and recipient of the confirmation. */
  email?: string;
  nombre?: string;
  confirmacion?: { asunto: string; mensaje: string };
  /** Image as a data URL (variable attachment "adjunto" in the template). */
  adjunto?: string;
}

export async function enviarFormulario({ tipo, asunto, campos, email, nombre, confirmacion, adjunto }: Formulario) {
  if (!emailConfigurado()) throw new Error('email-no-configurado');
  const comun = { tipo, sitio: config.siteUrl, fecha: new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }) };
  await enviarPlantilla(config.emailjs.templates.equipo, {
    ...comun, asunto, resumen: resumen(campos), reply_to: email ?? '', nombre: nombre ?? '', adjunto: adjunto ?? '',
  });
  if (email && confirmacion && config.emailjs.templates.usuario) {
    await enviarPlantilla(config.emailjs.templates.usuario, {
      ...comun, to_email: email, to_name: nombre ?? '', asunto: confirmacion.asunto, mensaje: confirmacion.mensaje, resumen: resumen(campos),
    });
  }
}

/** Shrinks a photo to a small JPEG so it fits as an attachment (EmailJS limits the size). */
export async function fotoComprimida(file: File, maxLado = 960, maxBytes = 45e3): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((ok, mal) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = mal;
      i.src = url;
    });
    let lado = maxLado;
    let q = 0.7;
    let out = '';
    for (let n = 0; n < 8; n++) {
      const s = Math.min(1, lado / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * s);
      c.height = Math.round(img.height * s);
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      out = c.toDataURL('image/jpeg', q);
      if (out.length * 0.75 <= maxBytes) return out;
      if (q > 0.45) q -= 0.1;
      else lado = Math.round(lado * 0.8);
    }
    return out;
  } finally {
    URL.revokeObjectURL(url);
  }
}
