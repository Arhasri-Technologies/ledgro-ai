import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  server: { port: 5199 },
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        contact: resolve(import.meta.dirname, 'contact.html'),
      },
    },
  },
})
