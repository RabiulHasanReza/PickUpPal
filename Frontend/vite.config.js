import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  optimizeDeps: {
    include: ['leaflet', 'react-leaflet'],
  },
  resolve: {
    alias: {
      'leaflet/dist/images/marker-icon.png': 'leaflet/dist/images/marker-icon.png',
      'leaflet/dist/images/marker-icon-2x.png': 'leaflet/dist/images/marker-icon-2x.png',
      'leaflet/dist/images/marker-shadow.png': 'leaflet/dist/images/marker-shadow.png',
    },
  },
});
