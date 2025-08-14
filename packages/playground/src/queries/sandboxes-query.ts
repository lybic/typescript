import { queryOptions } from '@tanstack/react-query'
import { myAxios } from '@/lib/axios'
import { Sandbox } from '@lybic/schema'
import { sessionStore } from '@/stores/session'
import { sandboxQueryOptions } from './sandbox-query'
import { trailUserQueryOptions } from './trail-user-query'

export const sandboxesQueryOptions = (orgId: string) =>
  queryOptions({
    queryKey: ['sandboxes', orgId] as const,
    queryFn: async ({ queryKey: [, orgId], client: queryClient }) => {
      if (!orgId) {
        return []
      }

      if (sessionStore.trialSessionToken) {
        const trialUser = await queryClient.ensureQueryData(trailUserQueryOptions())
        if (!trialUser?.allowedSandboxId) {
          return []
        }
        try {
          await queryClient.resetQueries(sandboxQueryOptions(orgId, trialUser.allowedSandboxId!))
          const sandbox = await queryClient.ensureQueryData(sandboxQueryOptions(orgId, trialUser.allowedSandboxId!))
          return [sandbox.sandbox]
        } catch {
          return []
        }
      } else if (sessionStore.signedInViaDashboard) {
        return (await myAxios.get<Sandbox[]>(`/api/orgs/${orgId}/sandboxes`)).data.filter(
          (sandbox) => new Date(sandbox.expiredAt) > new Date(),
        )
      } else {
        throw new Error('No credentials')
      }
    },
  })
