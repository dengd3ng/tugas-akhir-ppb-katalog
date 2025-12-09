import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,      // Ini memaksa server menggunakan IP network
    port: 5173,      // Port tetap
    strictPort: true,
    watch: {
      usePolling: true // Membantu jika file tidak terdeteksi berubah di Windows
    }
  }
})