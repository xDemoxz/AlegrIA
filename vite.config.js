import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  // Permite publicar en un subdirectorio (GitHub Pages: VITE_BASE=/AlegrIA/).
  // Los assets se resuelven con src/lib/asset.js contra esta base.
  base: process.env.VITE_BASE || '/',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // three y gsap solo los usa el timeline diferido; separarlos deja el
        // chunk de la app pequeño y permite cachear cada vendor por su lado.
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three';
          if (id.includes('node_modules/gsap')) return 'gsap';
          return undefined;
        },
      },
    },
  },
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
