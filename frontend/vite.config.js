import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Proxy /api sang Laravel (php artisan serve) để không phải cấu hình CORS khi dev
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': 'http://localhost:8000' } },
});
