import { useEffect, useState } from 'react'

export function useConnectResponder() {
  const [response, setResponse] = useState<{
    orgId: string
    sessionToken: string
  } | null>(null)

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data.type === 'ready') {
        event.source?.postMessage(
          {
            type: 'ready',
            nonce: event.data.nonce,
          },
          { targetOrigin: '*' },
        )
      } else if (event.data.type === 'org-selected') {
        const win = event.source as Window
        setResponse({
          orgId: event.data.orgId,
          sessionToken: event.data.sessionToken,
        })
        if (win) {
          win.close()
        }
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  return response
}
