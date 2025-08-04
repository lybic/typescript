import { Button } from '@/components/ui/button'
import { useCreateSandbox } from '@/hooks/use-create-sandbox'
import { sandboxesQueryOptions } from '@/queries/sandboxes-query'
import { trailUserQueryOptions } from '@/queries/trail-user-query'
import { sandboxState } from '@/stores/sandbox'
import { sessionStore } from '@/stores/session'
import { IconPlus, IconReload } from '@tabler/icons-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useEffectEvent } from 'use-effect-event'
import { useSnapshot } from 'valtio'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Spinner } from '../ui/spinner'
import { sandboxQueryOptions } from '@/queries/sandbox-query'

export function DesktopTopBarSelect() {
  const queryClient = useQueryClient()
  const session = useSnapshot(sessionStore)
  const sandboxesQuery = useQuery(sandboxesQueryOptions(session.orgId))
  const trialUserQuery = useQuery(trailUserQueryOptions())
  const [selectedSandboxId, setSelectedSandboxId] = useState<string>('')

  const handleReload = useEffectEvent(() => {
    sandboxesQuery.refetch()
    trialUserQuery.refetch()
  })

  const createSandbox = useCreateSandbox()

  const handleSelectSandboxChange = useEffectEvent((value: string) => {
    setSelectedSandboxId(value)
    if (value === 'create') {
      createSandbox.mutateAsync().then(
        (user) => {
          sandboxState.id = user.allowedSandboxId
          queryClient.invalidateQueries(sandboxQueryOptions(session.orgId, user.allowedSandboxId))
        },
        () => {
          setSelectedSandboxId('')
        },
      )
    } else if (value) {
      sandboxState.id = value
      setSelectedSandboxId(value)
    }
  })

  return (
    <>
      <Select value={selectedSandboxId} onValueChange={handleSelectSandboxChange} disabled={createSandbox.isPending}>
        <SelectTrigger size="sm" className="w-60">
          <div className="flex items-center gap-2 flex-1 w-0 overflow-hidden">
            {createSandbox.isPending && <Spinner />}
            <SelectValue placeholder="Select Sandbox" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {sandboxesQuery.isLoading && (
              <div className="flex items-center justify-center w-full py-2 text-muted-foreground">
                <Spinner />
              </div>
            )}
            {sandboxesQuery.data?.map((sandbox) => (
              <SelectItem key={sandbox.id} value={sandbox.id}>
                <div className="flex flex-col">
                  <div className="in-[[data-slot=select-value]]:font-normal overflow-hidden text-ellipsis w-2xs  text-left text-sm font-medium">
                    {sandbox.name}
                  </div>
                  <div className="in-[[data-slot=select-value]]:hidden text-xs font-mono text-muted-foreground">
                    {sandbox.id}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectItem value="create" disabled={trialUserQuery.data?.remainSandboxCount === 0}>
            <IconPlus className="size-4 in-[[data-slot=select-value]]:hidden" />
            New Sandbox
            {trialUserQuery.data && ` (${trialUserQuery.data.remainSandboxCount} Remaining)`}
          </SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" className="size-8" onClick={handleReload} isLoading={sandboxesQuery.isFetching}>
        <IconReload className="size-4" />
      </Button>
    </>
  )
}
