import { IconCast, IconPlus, IconReload } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useSnapshot } from 'valtio'
import { sandboxStore } from '@/stores/sandbox'
import { sandboxesQueryOptions } from '@/queries/sandboxes-query'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { sessionStore } from '@/stores/session'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../ui/select'
import { Spinner } from '../ui/spinner'
import { useEffectEvent } from 'use-effect-event'
import { useCreateSandbox } from '@/hooks/use-create-sandbox'
import { useEffect, useRef, useState } from 'react'
import { trailUserQueryOptions } from '@/queries/trail-user-query'
import { DesktopTopBarSelect } from './top-bar-select'
import { sandboxQueryOptions } from '@/queries/sandbox-query'
import { Countdown } from '../countdown'
import { toast, useSonner } from 'sonner'

export function DesktopTopBar() {
  const queryClient = useQueryClient()
  const session = useSnapshot(sessionStore)
  const sbState = useSnapshot(sandboxStore)
  const sandboxQuery = useQuery(sandboxQueryOptions(session.orgId, sbState.id))
  const sandboxExpiredToast = useRef<string | number | null>(null)

  useEffect(() => {
    const { data, isPending } = sandboxQuery
    if (data) {
      sandboxStore.connectDetails = data.connectDetails
      sandboxStore.expiresAt = new Date(data.sandbox.expiredAt).getTime()
      if (sandboxExpiredToast.current != null) {
        toast.dismiss(sandboxExpiredToast.current)
        sandboxExpiredToast.current = null
      }
    } else if (!isPending) {
      sandboxStore.connectDetails = null
      sandboxStore.expiresAt = 0
    }
  }, [sandboxQuery.data, sandboxQuery.isPending])

  const handleCountdownExpired = useEffectEvent(() => {
    sandboxExpiredToast.current = toast.warning('Your sandbox has expired', {
      description: 'Please create or select a new sandbox to continue.',
      closeButton: true,
      duration: 0,
    })
    sandboxStore.connectDetails = null
    sandboxStore.expiresAt = 0
    sandboxStore.id = ''
    queryClient.invalidateQueries()
  })

  return (
    <div className="desktop-top-bar flex w-full justify-between px-2 mb-2">
      {sbState.id && (
        <div className="flex gap-2 items-center">
          <IconCast className="size-4" />
          <div className="text-sm">Live Stream</div>
        </div>
      )}
      <div className="flex gap-2 text-sm text-muted-foreground items-center">
        {sbState.id ? (
          <>
            <div className="flex gap-1 items-center">
              <div className="text-xs">Expires in</div>
              <div className="font-mono flow items-center">
                {sbState.expiresAt > 0 ? (
                  <Countdown expiresAt={sbState.expiresAt} onCountdownExpired={handleCountdownExpired} />
                ) : (
                  <Spinner className="size-3" />
                )}
              </div>
            </div>
            <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
              Terminate
            </Button>
          </>
        ) : (
          <DesktopTopBarSelect />
        )}
      </div>
    </div>
  )
}
