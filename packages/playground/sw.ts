import { registerRoute } from 'workbox-routing'
import { CacheFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

registerRoute(
  ({ url }) => url.host.includes('cyborg.tos-s3-cn-guangzhou.volces.com'),
  new CacheFirst({
    cacheName: 'lybic-preview-screenshots',
    plugins: [new ExpirationPlugin({ maxEntries: 300, maxAgeSeconds: 24 * 60 * 60 * 7 })],
  }),
)
