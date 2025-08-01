import { myAxios } from '@/lib/axios'
import { queryOptions } from '@tanstack/react-query'

export const trailUserQuery = () =>
  queryOptions({
    queryKey: ['trial-user'],
    queryFn: async () => {
      try {
        const { data } = await myAxios.get<{
          organizationId: string
          allowedSandboxId: string | null
          remainSandboxCount: number
          sessionToken: string
        }>('/api/trial/user')
        return data
      } catch {
        return null
      }
    },
  })
