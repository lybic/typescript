import { myAxios } from '@/lib/axios'
import { queryOptions } from '@tanstack/react-query'
import { sessionStore } from '@/stores/session'
import { AxiosError } from 'axios'

export const trailUserQueryOptions = () =>
  queryOptions({
    queryKey: ['trial-user'],
    queryFn: async () => {
      if (sessionStore.signedInViaDashboard) {
        return null
      }

      try {
        const { data } = await myAxios.get<{
          organizationId: string
          allowedSandboxId: string | null
          remainSandboxCount: number
          sessionToken: string
          llmKey: string
        }>('/api/trial/user')
        if (data) {
          sessionStore.trialSessionToken = data.sessionToken
          sessionStore.llmApiKey = data.llmKey
          sessionStore.signedInViaDashboard = false
          sessionStore.orgId = data.organizationId
        }
        return data
      } catch (e) {
        if (e instanceof AxiosError && e.response?.status === 401) {
          console.warn('Trial session expired')
          if (e.response?.data.error === 'TRIAL_USER_ONLY') {
            sessionStore.trialSessionToken = ''
            sessionStore.llmApiKey = ''
            return null
          }

          sessionStore.trialSessionToken = ''
          sessionStore.llmApiKey = ''
          sessionStore.signedInViaDashboard = false
          sessionStore.orgId = ''
        }
        return null
      }
    },
  })
