import { LiveStream } from '@/components/live-stream'
import { decodeBase64Url } from '@std/encoding'
import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import z from 'zod'

export const Route = createFileRoute('/stream')({
  component: RouteComponent,
  validateSearch: z.object({
    d: z.string(),
  }),
})

function RouteComponent() {
  const { d } = Route.useSearch()
  const connectionDetails = useMemo(() => {
    const textDecoder = new TextDecoder()
    const decoded = textDecoder.decode(decodeBase64Url(d))
    return JSON.parse(decoded)
  }, [d])

  return (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <LiveStream connectDetails={connectionDetails} />
    </div>
  )
}
