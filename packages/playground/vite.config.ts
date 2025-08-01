import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    port: 3100,
    proxy: {
      '/api': {
        target: 'http://localhost:5305',
        changeOrigin: true,
      },
    },
  },
  plugins: [tsConfigPaths(), tanstackStart({ customViteReactPlugin: true, spa: { enabled: true } }), viteReact()],
})
