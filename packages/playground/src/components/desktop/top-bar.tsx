import { IconCast, IconDevicesX, IconExchange, IconPlus, IconReload, IconReplace } from '@tabler/icons-react'
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
import { useCallback, useEffect, useRef, useState } from 'react'
import { trailUserQueryOptions } from '@/queries/trail-user-query'
import { DesktopTopBarSelect } from './top-bar-select'
import { sandboxQueryOptions } from '@/queries/sandbox-query'
import { Countdown } from '../countdown'
import { toast, useSonner } from 'sonner'
import { useDeleteSandbox } from '@/hooks/use-delete-sandbox'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'

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
      sandboxStore.expiresAt = new Date(data.sandbox.expiresAt).getTime()
      sandboxStore.name = data.sandbox.name
      sandboxStore.shape = data.sandbox.shape
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
    sandboxExpiredToast.current = toast.warning('Your sandbox was expired.', {
      description: 'Please create or select a new sandbox to continue.',
      closeButton: true,
      duration: Infinity,
    })
    sandboxStore.connectDetails = null
    sandboxStore.expiresAt = 0
    sandboxStore.id = ''
    queryClient.invalidateQueries()
  })

  const deleteSandbox = useDeleteSandbox(session.orgId, sbState.id)

  const handleReplaceSandbox = () => {
    sandboxStore.connectDetails = null
    sandboxStore.expiresAt = 0
    sandboxStore.id = ''
  }

  return (
    <div className="desktop-top-bar items-center text-sm flex gap-2 px-2 mb-2">
      {sbState.id && (
        <>
          <IconCast className="size-4 flex-shrink-0" />
          <div className="whitespace-nowrap w-0 flex-grow-1 max-w-[fit-content] overflow-hidden text-ellipsis">
            Live Stream
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" onClick={handleReplaceSandbox}>
                <IconReplace />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Select another sandbox</TooltipContent>
          </Tooltip>
          <div className="w-0 max-w-50 flex-grow-1 flex-shrink-2 overflow-hidden">
            <div className="text-xs whitespace-nowrap text-ellipsis overflow-hidden">{sbState.name}</div>
            <div className="text-[0.625rem] text-muted-foreground font-mono whitespace-nowrap text-ellipsis overflow-hidden select-all">
              {sbState.id}
            </div>
          </div>
        </>
      )}

      {sbState.id ? (
        <div className="flex gap-2 text-sm text-muted-foreground items-center ml-auto">
          <div className="flex gap-1 items-center">
            <div className="text-xs whitespace-nowrap">Expires in</div>
            <div className="font-mono flow items-center">
              {sbState.expiresAt > 0 ? (
                <Countdown expiresAt={sbState.expiresAt} onCountdownExpired={handleCountdownExpired} />
              ) : (
                <Spinner className="size-3" />
              )}
            </div>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                isLoading={deleteSandbox.isPending}
                onClick={() => deleteSandbox.mutate()}
              >
                <IconDevicesX />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Terminate Sandbox</TooltipContent>
          </Tooltip>
        </div>
      ) : (
        <div className="flex gap-2 text-sm text-muted-foreground items-center">
          <DesktopTopBarSelect />
        </div>
      )}
    </div>
  )
}
