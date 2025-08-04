import { queryOptions } from '@tanstack/react-query'
import type { Sandbox, SandboxConnectDetails } from '@lybic/schema'
import { myAxios } from '@/lib/axios'

export const sandboxQueryOptions = (orgId: string, sandboxId: string) =>
  queryOptions({
    queryKey: ['sandbox', orgId, sandboxId],
    queryFn: async ({ queryKey: [, orgId, sandboxId] }) => {
      if (!orgId || !sandboxId) {
        throw new Error('Invalid orgId or sandboxId')
      }

      return (
        await myAxios.get<{ sandbox: Sandbox; connectDetails: SandboxConnectDetails }>(
          `/api/orgs/${orgId}/sandboxes/${sandboxId}`,
        )
      ).data
    },
  })
