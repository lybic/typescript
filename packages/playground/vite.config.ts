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
        '/_AMapService/': {
          target: env.VITE_LYBIC_AMAP_URL ?? 'https://amap.lybic.cn',
          changeOrigin: true,
          headers: {
            Referer: 'https://playground.lybic.cn',
          },
        },
      },
    },
    plugins: [
      tsConfigPaths(),
      tanstackStart({ customViteReactPlugin: true, spa: { enabled: true }, target: 'static' }),
      viteReact({
        babel: {
          plugins: ['babel-plugin-react-compiler'],
        },
      }),
    ],
  }
})
