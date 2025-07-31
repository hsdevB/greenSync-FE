import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/sensor': {
        target: 'http://192.168.0.10:3000', // 실제 백엔드 서버 주소로 수정
        changeOrigin: true,
        secure: false,
        timeout: 10000, // 타임아웃 추가
        onError: (err) => {
          console.log('Proxy error:', err);
        }
      },
      '/weather': {
        target: 'http://192.168.0.33:3000', // 일사량 API 서버
        changeOrigin: true,
        secure: false,
        timeout: 10000,
        onError: (err) => {
          console.log('Weather Proxy error:', err);
        }
      },
      '/chart': {
        target: 'http://192.168.0.33:3000', // 차트 API 서버
        changeOrigin: true,
        secure: false,
        timeout: 10000,
        onError: (err) => {
          console.log('Chart Proxy error:', err);
        }
      },
      '/api/iotdata': {
        target: 'http://localhost:3001', // AI 서버로 프록시
        changeOrigin: true,
        secure: false,
        timeout: 10000,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('IoT Data Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('IoT Data Proxy request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes) => {
            console.log('IoT Data Proxy response:', proxyRes.statusCode);
          });
        }
      },
      '/api/ollama': {
        target: 'http://localhost:11434',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/ollama/, ''),
        secure: false,
        timeout: 120000, // Ollama API는 시간이 오래 걸릴 수 있으므로 타임아웃 2분으로 증가
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('Ollama Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('Ollama Proxy request:', req.method, req.url);
            // Content-Type 헤더 추가
            proxyReq.setHeader('Content-Type', 'application/json');
          });
          proxy.on('proxyRes', (proxyRes) => {
            console.log('Ollama Proxy response:', proxyRes.statusCode);
          });
        }
      },
      '/api': {
        target: 'http://106.254.212.23:3001',
        changeOrigin: true,
        secure: false,
        timeout: 10000,
        onError: (err) => {
          console.log('API Proxy error:', err);
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