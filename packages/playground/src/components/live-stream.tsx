import { asyncEffect } from '@/lib/async-effect'
import type { SandboxConnectDetails } from '@lybic/schema'
import { StreamingClient } from '@lybic/ui/streaming-client'
import { useEffect, useRef } from 'react'

export function LiveStream({ connectDetails }: { connectDetails: SandboxConnectDetails }) {
  const streamingClient = useRef<StreamingClient | null>(null)
  const canvas = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!canvas.current) return

    const sc = new StreamingClient(canvas.current, {
      preferredVideoEncoding: 4 /* VP9 */,
      videoFps: 12,
      videoBitrate: 1 * 1024 * 1024,
    })
    const cleanup = asyncEffect(
      async () => {
        if (streamingClient.current) {
          await streamingClient.current.destroy()
          streamingClient.current = null
        }
        await sc.start(connectDetails)
        streamingClient.current = sc
      },
      async () => {},
      async () => {
        await sc.destroy()
        streamingClient.current = null
      },
    )

    return cleanup
  }, [connectDetails])

  return <canvas className="w-full h-full outline-none" ref={canvas} tabIndex={0} />
}
