/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 'mock' = self-contained demo with no backend */
  readonly VITE_API_MODE?: 'mock' | 'http';
  /** API origin when it isn't the same as the site's (e.g. https://api.example.com) */
  readonly VITE_API_URL?: string;
  /** Public site URL, used in emails */
  readonly VITE_SITE_URL?: string;
  readonly VITE_EMAILJS_PUBLIC_KEY?: string;
  readonly VITE_EMAILJS_SERVICE_ID?: string;
  readonly VITE_EMAILJS_TEMPLATE_EQUIPO?: string;
  readonly VITE_EMAILJS_TEMPLATE_USUARIO?: string;
}
