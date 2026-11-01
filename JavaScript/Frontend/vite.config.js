import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// O frontend consome o BFF Next.js (porta 3001) através do proxy /api.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: true,
    port: 5173,
    proxy: { '/api': { target: process.env.API_URL || 'http://localhost:3001', changeOrigin: true } },
  },
  preview: {
    host: true,
    allowedHosts: true,
    port: 4173,
    proxy: { '/api': { target: process.env.API_URL || 'http://localhost:3001', changeOrigin: true } },
  },
});

