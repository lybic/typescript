import { useMutation, useQueryClient } from '@tanstack/react-query'
import { trailUserQuery } from '@/queries/trail-user-query'
import { myAxios } from '@/lib/axios'

export function useCreateSandbox() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { data } = await myAxios.post('/api/lybic/trial-user/sandbox', {})
      await queryClient.refetchQueries(trailUserQuery())
      return data
    },
  })
}
