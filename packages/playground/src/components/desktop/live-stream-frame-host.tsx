import { sandboxState } from '@/stores/sandbox'
import { useMemo } from 'react'
import { useSnapshot } from 'valtio'
import { encodeBase64Url } from '@std/encoding/base64url'

export function LiveStreamFrameHost() {
  const sb = useSnapshot(sandboxState)
  const encodedDetails = useMemo(
    () => (sb.connectDetails ? encodeBase64Url(JSON.stringify(sb.connectDetails)) : undefined),
    [sb.connectDetails],
  )

  return (
    encodedDetails && <iframe className="w-full h-full absolute clip-rounded-lg" src={`/stream?d=${encodedDetails}`} />
  )
}
