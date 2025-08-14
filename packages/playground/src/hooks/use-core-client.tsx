import { sessionStore } from '@/stores/session'
import { useEffect, useMemo, useRef } from 'react'
import { useSnapshot } from 'valtio'
import { LybicClient } from '@lybic/core'

const baseUrl = import.meta.env.VITE_LYBIC_BASE_URL ?? '/'

export function useCoreClient() {
  const { orgId, trialSessionToken } = useSnapshot(sessionStore)
  const createClient = () =>
    new LybicClient({
      baseUrl,
      orgId,
      ...(trialSessionToken ? { trialSessionToken } : ({} as { apiKey: string })), // trick typescript
    })
  const ref = useRef<LybicClient>(createClient())

  useEffect(() => {
    ref.current = createClient()
  }, [orgId, trialSessionToken])

  return ref
}
