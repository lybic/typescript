import { queryOptions } from '@tanstack/react-query'
import type { Sandbox, SandboxConnectDetails } from '@lybic/schema'
import { myAxios } from '@/lib/axios'

export const sandboxQueryOptions = (orgId: string, sandboxId: string) =>
  queryOptions({
    queryKey: ['sandbox', orgId, sandboxId],
    queryFn: ({ queryKey: [, orgId, sandboxId] }) => {
      return myAxios.get<{ sandbox: Sandbox; connectDetails: SandboxConnectDetails }>(
        `/api/orgs/${orgId}/sandboxes/${sandboxId}`,
      )
    },
  })
