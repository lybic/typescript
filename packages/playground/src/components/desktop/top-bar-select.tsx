import { Button } from '@/components/ui/button'
import { useCreateSandbox } from '@/hooks/use-create-sandbox'
import { sandboxesQueryOptions } from '@/queries/sandboxes-query'
import { trailUserQueryOptions } from '@/queries/trail-user-query'
import { sandboxStore } from '@/stores/sandbox'
import { sessionStore } from '@/stores/session'
import { IconBoxOff, IconMoodConfuzed, IconPlus, IconReload } from '@tabler/icons-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { useSnapshot } from 'valtio'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Spinner } from '../ui/spinner'
import { sandboxQueryOptions } from '@/queries/sandbox-query'
import { useNewChat } from '@/hooks/use-new-chat'
import { Tooltip, TooltipContent } from '../ui/tooltip'
import { TooltipTrigger } from '@radix-ui/react-tooltip'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../ui/empty'

export function DesktopTopBarSelect() {
  const queryClient = useQueryClient()
  const session = useSnapshot(sessionStore)
  const sandboxesQuery = useQuery(sandboxesQueryOptions(session.orgId))
  const trialUserQuery = useQuery(trailUserQueryOptions())
  const [selectedSandboxId, setSelectedSandboxId] = useState<string>('')

  const handleReload = () => {
    sandboxesQuery.refetch()
    trialUserQuery.refetch()
  }

  const createSandbox = useCreateSandbox()

  const newChat = useNewChat()

  const handleSelectSandboxChange = (value: string) => {
    setSelectedSandboxId(value)
    newChat()
    if (value === 'create') {
      createSandbox.mutateAsync().then(
        (user) => {
          sandboxStore.id = user.allowedSandboxId
          queryClient.invalidateQueries(sandboxQueryOptions(session.orgId, user.allowedSandboxId))
        },
        () => {
          setSelectedSandboxId('')
        },
      )
    } else if (value) {
      sandboxStore.id = value
    }
  }

  const handleCreateSandbox = () => {
    createSandbox.mutateAsync().then((sandboxId) => {
      sandboxStore.id = sandboxId
      queryClient.invalidateQueries(sandboxQueryOptions(session.orgId, sandboxId))
    })
  }

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
            {sandboxesQuery.data?.length === 0 && (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <IconBoxOff />
                  </EmptyMedia>
                  <EmptyTitle>No Sandbox</EmptyTitle>
                </EmptyHeader>
                <EmptyContent>
                  <Button onClick={handleCreateSandbox} isLoading={createSandbox.isPending}>
                    New Sandbox
                  </Button>
                </EmptyContent>
              </Empty>
            )}
            {sandboxesQuery.error && (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <IconMoodConfuzed />
                  </EmptyMedia>
                  <EmptyTitle>Failed to load sandboxes</EmptyTitle>
                </EmptyHeader>
                <EmptyContent>{sandboxesQuery.error.message}</EmptyContent>
              </Empty>
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Tooltip>
        <TooltipContent>
          New Sandbox{trialUserQuery.data && ` (${trialUserQuery.data.remainSandboxCount} Remaining)`}
        </TooltipContent>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            className="size-8"
            onClick={handleCreateSandbox}
            isLoading={createSandbox.isPending}
          >
            <IconPlus />
          </Button>
        </TooltipTrigger>
      </Tooltip>
      <Button variant="outline" className="size-8" onClick={handleReload} isLoading={sandboxesQuery.isFetching}>
        <IconReload className="size-4" />
      </Button>
    </>
  )
}
