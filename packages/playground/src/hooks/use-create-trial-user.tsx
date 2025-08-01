import { myAxios } from '@/lib/axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { trailUserQuery } from '@/queries/trail-user-query'
import { sessionStore } from '@/stores/session'

export function useCreateTrialUser() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({ mobileNumber, verificationCode }: { mobileNumber: string; verificationCode: string }) => {
      const { data } = await myAxios.post<{
        organizationId: string
        allowedSandboxId: string | null
        remainSandboxCount: number
        sessionToken: string
      }>('/api/trial/user', {
        mobileNumber,
        verificationCode,
      })

      return data
    },
    onSuccess: (data) => {
      sessionStore.trialSessionToken = data.sessionToken
      sessionStore.signedInViaDashboard = false
      sessionStore.orgId = data.organizationId
      queryClient.setQueryData(trailUserQuery().queryKey, data)
    },
  })

  return mutation
}
