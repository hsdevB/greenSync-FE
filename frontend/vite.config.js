import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/sensor': {
        target: 'http://192.168.0.10:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});