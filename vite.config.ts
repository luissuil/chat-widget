import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/main.ts', import.meta.url)),
      name: 'ChatWidget',
      formats: ['iife'], // Solo IIFE empaquetado sin dependencias
      fileName: () => 'chat-widget.js' // Salida única
    }
    // Eliminar rollupOptions.external para incluir todas las dependencias en el bundle
  }
});