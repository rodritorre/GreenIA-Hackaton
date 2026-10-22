// HTML bodies for the confirmation emails. The EmailJS template "usuario" is a single {{{html}}} slot
// (emailjs/usuario.html), so the site builds the whole email here: a plain layout for every form and
// the booking layout (based on aporte-marco/confirmacion-reserva.html) for pack bookings.
// Tables and inline styles only, so it renders in Gmail, Outlook and Apple Mail.

const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const INK = '#3a1f2b';
const SOFT = '#5e4450';
const MUTED = '#7a6168';
const ACCENT = '#b8456e';
const LINE = '#ead9cc';
const SERIF = "Georgia,'Times New Roman',serif";

function marco(contenido: string, preheader: string, banner = '') {
  return `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8efe4;">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#fffdf9;border-radius:18px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;color:${INK};">
${banner ? `<tr><td style="background:#fff1d6;color:#7a4b00;font-size:12px;font-weight:bold;text-align:center;padding:8px 16px;">${esc(banner)}</td></tr>` : ''}
<tr><td style="padding:22px 32px 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="font-size:22px;line-height:1;padding-right:8px;">🌸</td>
<td style="font-family:${SERIF};font-size:20px;font-weight:bold;color:${INK};">Cuándo Florece</td>
</tr></table></td></tr>
${contenido}
</table>
</td></tr>
</table>`;
}

function pie(sitio: string, en: boolean, extra: string) {
  return `<tr><td style="padding:30px 32px 28px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${LINE};">
<tr><td style="padding-top:18px;font-size:13px;line-height:1.6;color:${MUTED};">
${en ? 'Questions? Reply to this email and we will help.' : '¿Dudas? Responde a este correo y te ayudamos.'}<br>
<strong style="color:${INK};">Cuándo Florece</strong> · ${en ? 'The living bloom map of Spain' : 'El mapa vivo de la floración en España'}<br>
${esc(extra)}<br>
<a href="${esc(sitio)}" style="color:${ACCENT};">${esc(sitio.replace(/^https?:\/\//, ''))}</a> · <a href="${esc(sitio)}/privacidad.html" style="color:${ACCENT};">${en ? 'Privacy' : 'Privacidad'}</a>
</td></tr></table></td></tr>`;
}

/** Plain confirmation for alerts, photos, sign-ups and contact (same content as before). */
export function htmlGenerico(o: { nombre?: string; mensaje: string; resumen: string; sitio: string; idioma?: string }) {
  const en = o.idioma === 'en';
  const hola = o.nombre ? `${en ? 'Hello' : 'Hola'} ${esc(o.nombre)},` : `${en ? 'Hello' : 'Hola'},`;
  const cuerpo = `<tr><td style="padding:22px 32px 0;font-size:15px;line-height:1.55;color:${SOFT};">
<p style="margin:0 0 12px;color:${INK};">${hola}</p>
<p style="margin:0 0 18px;">${esc(o.mensaje)}</p>
<p style="margin:0 0 6px;font-size:13px;color:${MUTED};">${en ? 'This is what you sent us:' : 'Esto es lo que nos has enviado:'}</p>
<div style="white-space:pre-line;background:#f8efe4;border:1px solid ${LINE};border-radius:12px;padding:14px 16px;font-size:14px;line-height:1.5;color:${INK};">${esc(o.resumen)}</div>
</td></tr>`;
  return marco(cuerpo + pie(o.sitio, en, en ? 'If this was not you or you want your data deleted, reply to this email.' : 'Si no has sido tú o quieres que borremos tus datos, responde a este correo.'), o.mensaje);
}

export interface Parada { momento: string; tipo: string; nombre: string; lugar?: string; nota?: string; tel?: string }

export interface DatosReserva {
  idioma: 'es' | 'en';
  sitio: string;
  referencia: string;
  nombre: string;
  destino: string;
  provincia: string;
  titulo: string;
  entrada: string; // YYYY-MM-DD
  noches: number;
  alojamiento: string;
  lugar: string;
  habitacion: string;
  grupo: string;
  fase?: string;
  plato?: string;
  dias?: Parada[][];
  lineas: { c: string; v: number }[];
  total: number;
  noIncluye?: string;
}

export const referenciaReserva = () => {
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const r = crypto.getRandomValues(new Uint8Array(6));
  return 'CF-' + Array.from(r, (b) => abc[b % abc.length]).join('');
};

const fecha = (iso: string, mas: number, en: boolean, opts: Intl.DateTimeFormatOptions) => {
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + mas);
  return d.toLocaleDateString(en ? 'en-GB' : 'es-ES', opts);
};

/** Booking confirmation (email and the page after sending), after Marco's design. */
export function htmlReserva(r: DatosReserva) {
  const en = r.idioma === 'en';
  const eur = (n: number) => n.toLocaleString(en ? 'en-GB' : 'es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const corta = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' } as const;
  const larga = { weekday: 'long', day: 'numeric' } as const;
  const celda = (lbl: string, val: string, extra = '', borde = '') =>
    `<p style="margin:0 0 4px;font-size:12px;color:${MUTED};">${lbl}</p><p style="margin:0${extra ? ' 0 2px' : ''};font-size:16px;font-weight:bold;">${val}</p>${extra}${borde}`;
  const mapa = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(`${r.alojamiento}, ${r.lugar}`);
  const restaurantes = (r.dias ?? []).flat().filter((s) => s.tipo === 'restaurante');
  const pila = r.nombre.split(' ')[0];

  const cabecera = `<tr><td style="padding:20px 32px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fbe0e9;border-radius:16px;"><tr><td style="padding:28px 28px 26px;">
<p style="margin:0 0 10px;font-size:12px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;color:${ACCENT};">✓ ${en ? 'Booking confirmed' : 'Reserva confirmada'}</p>
<h1 style="margin:0 0 10px;font-family:${SERIF};font-size:30px;line-height:1.15;color:${INK};">${en ? `All set, ${esc(pila)}! You're off to ${esc(r.lugar)}` : `¡Todo listo, ${esc(pila)}! Te vas a ${esc(r.lugar)}`}</h1>
<p style="margin:0;font-size:16px;line-height:1.55;color:${SOFT};">${esc(r.destino)}: ${esc(r.titulo.charAt(0).toLowerCase() + r.titulo.slice(1))}. ${en ? 'Here is your booking and the plan for your getaway.' : 'Aquí tienes tu reserva y el plan para tu escapada.'}</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:18px;"><tr>
<td style="background:${INK};color:#ffffff;border-radius:10px;padding:10px 14px;font-size:13px;">${en ? 'Reference' : 'Referencia'}&nbsp; <strong style="font-size:15px;letter-spacing:1px;">${esc(r.referencia)}</strong></td>
</tr></table>
</td></tr></table></td></tr>`;

  const td = (w: string, s: string) => `<td${w} valign="top" style="padding:16px 18px;${s}">`;
  const reserva = `<tr><td style="padding:26px 32px 0;">
<h2 style="margin:0 0 14px;font-family:${SERIF};font-size:20px;color:${INK};">${en ? 'Your booking' : 'Tu reserva'}</h2>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${LINE};border-radius:14px;">
<tr>${td(' width="50%"', 'border-bottom:1px solid #f2e7dc;border-right:1px solid #f2e7dc;')}${celda(en ? 'Check-in' : 'Entrada', esc(fecha(r.entrada, 0, en, corta)))}</td>
${td(' width="50%"', 'border-bottom:1px solid #f2e7dc;')}${celda(en ? 'Check-out' : 'Salida', esc(fecha(r.entrada, r.noches, en, corta)))}</td></tr>
<tr><td colspan="2" style="padding:16px 18px;border-bottom:1px solid #f2e7dc;">${celda(en ? 'Stay' : 'Alojamiento', esc(r.alojamiento), `<p style="margin:0;font-size:14px;line-height:1.5;color:${SOFT};">${esc(r.habitacion)} · ${r.noches} ${en ? (r.noches === 1 ? 'night' : 'nights') : r.noches === 1 ? 'noche' : 'noches'}<br>${esc(r.lugar)} (${esc(r.provincia)})</p>`)}</td></tr>
<tr>${td('', 'border-right:1px solid #f2e7dc;')}${celda(en ? 'Guests' : 'Huéspedes', esc(r.grupo))}</td>
${td('', '')}${celda(en ? 'Lead guest' : 'Titular', esc(r.nombre))}</td></tr>
</table>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;"><tr>
<td style="background:${ACCENT};border-radius:999px;"><a href="${esc(mapa)}" style="display:inline-block;padding:13px 24px;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;">${en ? 'Directions' : 'Cómo llegar'}</a></td>
<td style="width:10px;"></td>
<td style="border:1px solid #dcc6b8;border-radius:999px;"><a href="${esc(r.sitio)}" style="display:inline-block;padding:12px 22px;font-size:15px;font-weight:bold;color:${INK};text-decoration:none;">${en ? 'See the bloom map' : 'Ver el mapa de floración'}</a></td>
</tr></table>
</td></tr>`;

  const flor = r.fase
    ? `<tr><td style="padding:24px 32px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fffaf4;border:1px solid ${LINE};border-left:4px solid #ec6a92;border-radius:12px;">
<tr><td style="padding:14px 16px;font-size:14px;line-height:1.55;color:${SOFT};"><strong style="color:${INK};">🌸 ${en ? 'Forecast for your dates' : 'Previsión para tus fechas'}: ${esc(r.fase.toLowerCase())}.</strong><br>
${en ? 'Bloom dates move with rain and temperature. We will email you if the forecast changes before your trip.' : 'Las fechas cambian con la lluvia y la temperatura. Te escribiremos si la previsión cambia antes de tu viaje.'}</td></tr></table></td></tr>`
    : '';

  const icono = (t: string) => (t === 'restaurante' ? '🍽 ' : t === 'alojamiento' ? '🛏 ' : '');
  const plan = (r.dias ?? []).length
    ? `<tr><td style="padding:26px 32px 0;">
<h2 style="margin:0 0 4px;font-family:${SERIF};font-size:20px;color:${INK};">${en ? 'Your getaway' : 'Tu escapada'}</h2>
${r.plato ? `<p style="margin:0 0 16px;font-size:14px;color:${MUTED};">${en ? 'Dish of the season' : 'Plato de temporada'}: <strong style="color:${INK};">${esc(r.plato)}</strong></p>` : ''}
${r
  .dias!.map(
    (dia, i) => `<p style="margin:0 0 10px;font-size:13px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:${ACCENT};">${en ? 'Day' : 'Día'} ${i + 1} · ${esc(fecha(r.entrada, i, en, larga))}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:18px;">
${dia
  .map(
    (s) => `<tr><td width="76" valign="top" style="padding:0 0 14px;font-size:13px;font-weight:bold;color:${MUTED};">${esc(s.momento)}</td>
<td valign="top" style="padding:0 0 14px;font-size:14px;line-height:1.5;color:${SOFT};"><strong style="color:${INK};">${icono(s.tipo)}${esc(s.nombre)}</strong>${s.lugar ? `<br>${esc(s.lugar)}${s.tel ? ` · ${esc(s.tel)}` : ''}` : ''}${s.nota ? `<br>${esc(s.nota)}` : ''}</td></tr>`,
  )
  .join('')}
</table>`,
  )
  .join('')}
</td></tr>`
    : '';

  const precio = `<tr><td style="padding:26px 32px 0;">
<h2 style="margin:0 0 14px;font-family:${SERIF};font-size:20px;color:${INK};">${en ? 'Price' : 'Precio'}</h2>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8efe4;border-radius:14px;font-size:14px;color:${SOFT};">
${r.lineas.map((l) => `<tr><td style="padding:12px 18px 6px;">${esc(l.c)}</td><td align="right" style="padding:12px 18px 6px;font-weight:bold;color:${INK};white-space:nowrap;">${eur(l.v)}</td></tr>`).join('')}
<tr><td style="padding:12px 18px 16px;border-top:1px solid ${LINE};font-size:16px;font-weight:bold;color:${INK};">Total</td>
<td align="right" style="padding:12px 18px 16px;border-top:1px solid ${LINE};font-family:${SERIF};font-size:24px;font-weight:bold;color:${INK};white-space:nowrap;">${eur(r.total)}</td></tr>
</table>
<p style="margin:10px 0 0;font-size:13px;line-height:1.5;color:${MUTED};">${en ? 'Demo booking: nothing has been charged. Rates published by each place, checked in October 2026.' : 'Reserva de demostración: no se ha cobrado nada. Tarifas publicadas por cada sitio, consultadas en octubre de 2026.'}${r.noIncluye ? `<br>${en ? 'Not included' : 'No incluye'}: ${esc(r.noIncluye)}` : ''}</p>
</td></tr>`;

  const consejos = [
    en ? `Confirm your check-in time with ${r.alojamiento}.` : `Confirma la hora de entrada con ${r.alojamiento}.`,
    ...(restaurantes.length
      ? [en ? `Call ${restaurantes.map((s) => s.nombre).join(' and ')} to book your table.` : `Llama a ${restaurantes.map((s) => s.nombre).join(' y ')} para reservar mesa.`]
      : []),
    en ? 'Check the bloom map the day before you leave.' : 'Mira el mapa de floración el día antes de salir.',
    en ? 'To change or cancel, reply to this email. Conditions depend on the place to stay.' : 'Para cambiar o cancelar, responde a este correo. Las condiciones dependen del alojamiento.',
  ];
  const antes = `<tr><td style="padding:26px 32px 0;">
<h2 style="margin:0 0 12px;font-family:${SERIF};font-size:20px;color:${INK};">${en ? 'Before you go' : 'Antes de ir'}</h2>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:14px;line-height:1.55;color:${SOFT};">
${consejos.map((c) => `<tr><td width="22" valign="top" style="padding:0 0 8px;color:${ACCENT};">•</td><td style="padding:0 0 8px;">${esc(c)}</td></tr>`).join('')}
</table></td></tr>`;

  return marco(
    cabecera + reserva + flor + plan + precio + antes + pie(r.sitio, en, en ? 'You get this email because you booked on Cuándo Florece.' : 'Recibes este correo porque has hecho una reserva en Cuándo Florece.'),
    `${fecha(r.entrada, 0, en, corta)} · ${r.alojamiento}. ${en ? 'Your day-by-day plan and everything you need to know.' : 'Tu plan día a día y todo lo que necesitas saber.'}`,
    en ? 'DEMO BOOKING · hackathon prototype, nothing charged' : 'RESERVA DE DEMOSTRACIÓN · prototipo del hackathon, sin cobro real',
  );
}
