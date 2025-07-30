import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/sensor': {
        target: 'http://192.168.0.33:3000', // 실제 백엔드 서버 주소로 수정
        changeOrigin: true,
        secure: false,
        timeout: 10000, // 타임아웃 추가
        onError: (err, req, res) => {
          console.log('Proxy error:', err);
        }
      },
    },
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  },
  assetsInclude: ['**/*.unityweb', '**/*.wasm'],
  build: {
    rollupOptions: {
      external: ['Build.framework.js.unityweb', 'Build.data.unityweb']
    }
  }
});