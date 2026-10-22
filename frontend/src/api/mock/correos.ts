// Confirmation texts for the emails the demo sends through EmailJS (the team's wording, web/js/i18n-extra.js).
type Idioma = 'es' | 'en';
const T = {
  es: {
    alertSubject: 'Tu aviso para {destino}',
    alertBody: 'Hemos registrado tu aviso: te escribiremos {n} días antes de que se prevea {fase} en {destino}. Para darte de baja, responde a este correo.',
    // Phase names that read well for any species (flowers or autumn colour).
    fase_inicio: 'el inicio',
    fase_avance: 'el avance',
    fase_pleno: 'el momento álgido',
    fase_final: 'el final de temporada',
    bizSubject: 'Hemos recibido tu alta de negocio',
    bizBody: 'Hemos recibido la solicitud de {nombre}. La revisaremos con el pueblo y te escribiremos con la respuesta.',
    photoSubject: 'Hemos recibido tu observación',
    photoBody: 'Gracias por tu foto de {destino}. La revisaremos antes de usarla.',
    contactSubject: 'Hemos recibido tu mensaje',
    contactBody: 'Gracias por escribirnos sobre la licencia de destino. Te responderemos lo antes posible.',
    error: 'No hemos podido enviarlo. Revisa tu conexión e inténtalo de nuevo.',
  },
  en: {
    alertSubject: 'Your alert for {destino}',
    alertBody: "We've registered your alert: we'll email you {n} days before {fase} is forecast in {destino}. To unsubscribe, reply to this email.",
    fase_inicio: 'the start',
    fase_avance: 'the build-up',
    fase_pleno: 'the peak',
    fase_final: 'the end of the season',
    bizSubject: "We've received your business sign-up",
    bizBody: "We've received the request for {nombre}. We'll review it with the town and email you the answer.",
    photoSubject: "We've received your observation",
    photoBody: "Thanks for your photo of {destino}. We'll review it before using it.",
    contactSubject: "We've received your message",
    contactBody: "Thanks for writing to us about the destination licence. We'll reply as soon as we can.",
    error: "We couldn't send it. Check your connection and try again.",
  },
};

export type Clave = keyof (typeof T)['es'];

export function correo(clave: Clave, idioma: string | undefined, vars: Record<string, string | number> = {}) {
  const lang: Idioma = idioma === 'en' ? 'en' : 'es';
  return T[lang][clave].replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}
