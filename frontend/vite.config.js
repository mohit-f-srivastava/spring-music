import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../src/main/resources/static',
    emptyOutDir: false,
  },
  server: {
    proxy: {
      '/albums': 'http://localhost:8080',
      '/appinfo': 'http://localhost:8080',
      '/service': 'http://localhost:8080',
    },
  },
})
