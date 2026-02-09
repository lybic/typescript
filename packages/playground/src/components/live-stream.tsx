import { asyncEffect } from '@/lib/async-effect'
import { indicatorStore } from '@/stores/indicator'
import type { SandboxConnectDetails } from '@lybic/schema'
import { StreamingClient } from '@lybic/ui/streaming-client'
import { useEffect, useRef } from 'react'

export function LiveStream({
  connectDetails,
  sandboxId,
  shape,
}: {
  connectDetails: SandboxConnectDetails
  shape: {
    os: 'Android' | 'Windows' | 'Linux'
    hardwareAcceleratedEncoding: boolean
  }
  sandboxId: string
}) {
  const streamingClient = useRef<StreamingClient | null>(null)
  const canvas = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!canvas.current) return

    const sc = new StreamingClient(canvas.current, {
      preferredVideoEncoding: shape.hardwareAcceleratedEncoding ? 2 /* H265 */ : 4 /* VP9 */,
      videoFps: shape.hardwareAcceleratedEncoding ? 30 : 12,
      videoBitrate: 1200 * 1024,
      pointerTouchInput: shape.os === 'Android',
      reportKeyboardWithAndroidVkOnly: shape.os === 'Android',
      relativeMouseWheelOnly: shape.os === 'Linux',
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

  return <canvas className="lybic-stream outline-none" ref={canvas} tabIndex={0} />
}
