import { myAxios } from '@/lib/axios'
import { sandboxStore } from '@/stores/sandbox'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function useDeleteSandbox(orgId: string, sandboxId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { data } = await myAxios.delete(`/api/orgs/${orgId}/sandboxes/${sandboxId}`)
      await queryClient.invalidateQueries()
      return data
    },
    onSuccess: () => {
      sandboxStore.connectDetails = null
      sandboxStore.expiresAt = 0
      sandboxStore.id = ''
      toast.success('Sandbox terminated')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
