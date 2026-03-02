import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const apiTarget = env.VITE_API_TARGET || 'http://localhost:5000';
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Separar node_modules em chunks específicos
            if (id.includes('node_modules')) {
              // React e relacionados (primeiro para evitar circular)
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                return 'react-vendor';
              }
              // Firebase
              if (id.includes('firebase') || id.includes('@firebase')) {
                return 'firebase-vendor';
              }
              // Motion/Framer
              if (id.includes('motion') || id.includes('framer')) {
                return 'motion-vendor';
              }
              // Socket.io
              if (id.includes('socket.io-client') || id.includes('socket.io')) {
                return 'socket-vendor';
              }
              // UI libs (lucide, sonner)
              if (id.includes('lucide-react') || id.includes('sonner')) {
                return 'ui-vendor';
              }
              // Resto dos vendors
              return 'vendor';
            }
          },
        },
      },
      chunkSizeWarningLimit: 1500,
    },    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
        '/socket.io': {
          target: apiTarget,
          changeOrigin: true,
          ws: true,
        },
      },
    },
  };
});
