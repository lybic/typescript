import { myAxios } from '@/lib/axios'
import { queryOptions } from '@tanstack/react-query'
import { sessionStore } from '@/stores/session'
import { AxiosError } from 'axios'

export const trailUserQueryOptions = () =>
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
      } catch (e) {
        if (e instanceof AxiosError && e.response?.status === 401) {
          console.warn('Trial session expired')
          sessionStore.trialSessionToken = ''
          sessionStore.signedInViaDashboard = false
          sessionStore.orgId = ''
        }
        return null
      }
    },
  })
