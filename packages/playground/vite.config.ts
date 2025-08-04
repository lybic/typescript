import { defineConfig, loadEnv } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    server: {
      port: 3100,
      proxy: {
        '/api': {
          target: env.DEV_PLAYGROUND_PROXY_URL ?? 'http://localhost:5305',
          changeOrigin: true,
        },
      },
    },
    plugins: [tsConfigPaths(), tanstackStart({ customViteReactPlugin: true, spa: { enabled: true } }), viteReact()],
  }
})
