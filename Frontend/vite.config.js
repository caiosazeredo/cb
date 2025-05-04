import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['date-fns', '@mui/x-date-pickers'],
    esbuildOptions: {
      target: 'es2020'
    }
  },
  resolve: {
    alias: {
      'date-fns/_lib/format/longFormatters': 'date-fns/esm/_lib/format/longFormatters'
    }
  }
});