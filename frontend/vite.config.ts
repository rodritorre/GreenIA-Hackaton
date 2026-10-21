import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// In development the API runs on :8000 and is reached through the same origin, like in production.
const api = { '/api': { target: process.env.FLORECE_API ?? 'http://localhost:8000', changeOrigin: false } };

export default defineConfig({
  plugins: [react()],
  // Two pages: the app, and the booking request opened from a pack (reserva.html).
  build: { rollupOptions: { input: { main: resolve(__dirname, 'index.html'), reserva: resolve(__dirname, 'reserva.html') } } },
  server: { proxy: api },
  preview: { proxy: api },
});
