import { useMutation, useQueryClient } from '@tanstack/react-query'
import { trailUserQueryOptions } from '@/queries/trail-user-query'
import { myAxios } from '@/lib/axios'
import { toast } from 'sonner'

export function useCreateSandbox() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { data } = await myAxios.post('/api/trial/sandbox')
      await queryClient.refetchQueries(trailUserQueryOptions())
      return data
    },
    onSuccess: () => {
      toast.success('Sandbox created')
    },
    onError: (error) => {
      if ('code' in error && error.code === 'nomos.partner.NO_ROOMS_AVAILABLE') {
        toast.error('No sandbox capacity available now', {
          description:
            'We’re experiencing high traffic right now. Sorry for the inconvenience, please try again later.',
        })
      } else {
        toast.error(error.message)
      }
    },
  })
}
