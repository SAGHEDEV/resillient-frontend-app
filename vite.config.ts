import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Tailwind v4 uses a Vite plugin instead of a PostCSS plugin
  ],
  resolve: {
    alias: {
      // "@" maps to the src folder — used by shadcn component imports
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
