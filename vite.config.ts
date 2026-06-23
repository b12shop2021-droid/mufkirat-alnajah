import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// إعداد Vite الأساسي لتطبيق React + TypeScript
export default defineConfig({
  plugins: [react()],
});
