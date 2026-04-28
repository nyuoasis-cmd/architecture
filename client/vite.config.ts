import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
    host: '0.0.0.0',
    hmr: false,
    port: 5176,
    proxy: {
      '/api': 'http://localhost:3003',
    },
  },
});
