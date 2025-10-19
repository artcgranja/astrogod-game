import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  server: {
    port: 3000,
    strictPort: true  // Required for Tauri
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    sourcemap: false  // Reduce build size for production
  },
  // Prevent vite from obscuring rust errors
  clearScreen: false
})
