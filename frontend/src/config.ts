// Deployment settings, read at build time from VITE_* variables (the server passes them from
// deploy/.env). The EmailJS keys are public by design: they end up in the browser. The account is
// protected by limiting the allowed domains in the EmailJS dashboard (Account → Security).
const env = import.meta.env;

export const config = {
  /** Public URL without a trailing slash, used in emails. */
  siteUrl: env.VITE_SITE_URL ?? '',
  emailjs: {
    publicKey: env.VITE_EMAILJS_PUBLIC_KEY ?? '',
    serviceId: env.VITE_EMAILJS_SERVICE_ID ?? '',
    templates: {
      /** Internal email the team gets for every form (emailjs/equipo.html). */
      equipo: env.VITE_EMAILJS_TEMPLATE_EQUIPO ?? '',
      /** Confirmation for whoever filled in the form (emailjs/usuario.html). */
      usuario: env.VITE_EMAILJS_TEMPLATE_USUARIO ?? '',
    },
  },
};

/** Without keys the forms behave as before (simulated), so the demo never breaks. */
export const emailConfigurado = () => !!(config.emailjs.publicKey && config.emailjs.serviceId && config.emailjs.templates.equipo);
