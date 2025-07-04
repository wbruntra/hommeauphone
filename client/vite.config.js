import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 11000,
    proxy: {
      '/api': {
        target: 'http://localhost:11001',
        changeOrigin: true,
      },
    },
  },
})
