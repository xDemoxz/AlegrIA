import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  // Permite publicar en un subdirectorio (GitHub Pages: VITE_BASE=/AlegrIA/).
  // Los assets se resuelven con src/lib/asset.js contra esta base.
  base: process.env.VITE_BASE || '/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    open: !process.env.PLAYWRIGHT, // los e2e levantan su propio server sin abrir navegador
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.test.{js,jsx}'],
    css: false,
  },
});
