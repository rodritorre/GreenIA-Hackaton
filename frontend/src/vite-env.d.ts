/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 'mock' = self-contained demo with no backend */
  readonly VITE_API_MODE?: 'mock' | 'http';
  /** API origin when it isn't the same as the site's (e.g. https://api.example.com) */
  readonly VITE_API_URL?: string;
}
