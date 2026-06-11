import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:50207',
        changeOrigin: true,
        secure: false, // Self-signed sertifika için
      },
      '/uploads': {
        target: 'https://localhost:50207',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
