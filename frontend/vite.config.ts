import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development the API runs on :8000 and is reached through the same origin, like in production.
const api = { '/api': { target: process.env.FLORECE_API ?? 'http://localhost:8000', changeOrigin: false } };

export default defineConfig({
  plugins: [react()],
  server: { proxy: api },
  preview: { proxy: api },
});
