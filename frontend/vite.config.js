// vite.config.js
// Configures Vite with the Tailwind CSS plugin
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Proxy API calls to FastAPI backend during development
  server: {
    proxy: {
      '/events': 'http://localhost:8000',
      '/health': 'http://localhost:8000',
    },
  },
  build: {
    chunkSizeWarningLimit: 2000,
  },
})

