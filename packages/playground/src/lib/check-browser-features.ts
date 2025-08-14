const REQUIRED_FEATURES = [
  {
    name: 'WebTransport',
    description:
      'WebTransport is a modern transport protocol that allows for secure, low-latency communication between browsers and servers. We use it to stream sandbox desktop directly to your browser and protects your privacy.',
    async supports() {
      if (typeof window === 'undefined') return false
      return 'WebTransport' in window
    },
  },
  {
    name: 'WebAssembly (WASM)',
    description:
      'WebAssembly (WASM) is designed as a portable compilation target for programming languages, enabling deployment on the web for client and server applications. We use it to run sandbox desktop streaming in your browser.',
    async supports() {
      if (typeof window === 'undefined') return false
      return 'WebAssembly' in window
    },
  },
  {
    name: 'Container queries',
    description:
      'Container queries enable us to apply styles to an element based on certain attributes of its container. We use it to show desktop streaming in a container.',
    async supports() {
      if (typeof CSS === 'undefined') return false
      return CSS.supports('container-type', 'inline-size')
    },
  },
  {
    name: 'Service Workers',
    description:
      'Service Workers essentially act as proxy servers that sit between web applications, the browser, and the network (when available). This allows us to cache desktop screenshots in your browser.',
    async supports() {
      if (typeof navigator === 'undefined') return false
      return 'serviceWorker' in navigator
    },
  },
  {
    name: 'WebCodec',
    description:
      'The WebCodecs API gives web developers low-level access to the individual frames of a video stream and chunks of audio. We use it to stream sandbox desktop directly to your browser.',
    async supports() {
      if (typeof window === 'undefined') return false
      return 'VideoDecoder' in window
    },
  },
  {
    name: 'VP9 Decoding',
    description:
      'VP9 is a video codec that is supported by most modern browsers. We use it to stream sandbox desktop directly to your browser.',
    async supports() {
      if (typeof window === 'undefined') return false
      if (!('VideoDecoder' in window)) return false
      const supported = await VideoDecoder.isConfigSupported({
        codec: 'vp09.00.10.08',
        hardwareAcceleration: 'no-preference',
        codedWidth: 1280,
        codedHeight: 720,
      })
      return supported.supported
    },
  },
]

export const REQUIRED_FEATURES_LEVEL = 'v1'

export async function checkBrowserFeatures() {
  const supported = await Promise.all(REQUIRED_FEATURES.map((feature) => feature.supports()))
  return {
    features: REQUIRED_FEATURES.map((feature, index) => ({
      ...feature,
      supported: supported[index],
    })),
    allSupported: supported.every((supported) => supported),
  }
}
