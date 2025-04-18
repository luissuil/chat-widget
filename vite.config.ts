import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  if (mode === 'production') {
    // Configuración para producción (library build + CDN build)
    return {
      build: {
        outDir: 'dist',
        lib: {
          entry: fileURLToPath(new URL('./src/main.ts', import.meta.url)),
          name: 'ChatWidget',
          // Añadir 'iife' para el bundle CDN
          formats: ['es', 'umd', 'iife'],
          fileName: (format) => {
            if (format === 'iife') {
              return 'chat-widget.min.js'; // Nombre para el bundle CDN
            }
            // Nombres para los formatos de librería
            return `chat-widget.${format}.js`;
          }
        },
        rollupOptions: {
          // Externalizar dependencias solo para formatos de librería (es, umd)
          external: ['lit', /^lit\/.*/],
          output: {
            // Variables globales para el build UMD
            globals: {
              lit: 'Lit'
            },
            // Asegurarse de que 'lit' NO se externalice para el formato IIFE
            // Vite/Rollup maneja esto automáticamente al no definir globals para iife
          }
        }
      }
    };
  } else {
    // Configuración por defecto (para example, build IIFE)
    return {
      build: {
        outDir: 'example', // Salida a la carpeta 'example'
        lib: {
          entry: fileURLToPath(new URL('./src/main.ts', import.meta.url)),
          name: 'ChatWidget',
          formats: ['iife'], // Formato IIFE autocontenido
          fileName: () => 'chat-widget.js'
        }
        // No externalizar dependencias para el IIFE
      }
    };
  }
});