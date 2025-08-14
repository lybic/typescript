import { asyncEffect } from '@/lib/async-effect'
import { indicatorStore } from '@/stores/indicator'
import type { SandboxConnectDetails } from '@lybic/schema'
import { StreamingClient } from '@lybic/ui/streaming-client'
import { useEffect, useRef } from 'react'

export function LiveStream({
  connectDetails,
  sandboxId,
}: {
  connectDetails: SandboxConnectDetails
  sandboxId: string
}) {
  const streamingClient = useRef<StreamingClient | null>(null)
  const canvas = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!canvas.current) return

    const sc = new StreamingClient(canvas.current, {
      preferredVideoEncoding: 4 /* VP9 */,
      videoFps: 12,
      videoBitrate: 1 * 1024 * 1024,
    })
    const sub = sc.screenSize$.subscribe((size) => {
      indicatorStore.screenSize = size
    })
    const timer = setTimeout(() => {
      void sc.start(connectDetails)
    }, 100)

    return () => {
      clearTimeout(timer)
      sub.unsubscribe()
      void sc.destroy()
      streamingClient.current = null
    }
  }, [sandboxId])

  return <canvas className="w-full h-full outline-none" ref={canvas} tabIndex={0} />
}
