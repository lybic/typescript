import { myAxios } from '@/lib/axios'
import { queryOptions } from '@tanstack/react-query'

export const getSessionQueryOptions = () =>
  queryOptions({
    queryKey: ['session'],
    queryFn: async () => {
      const response = await myAxios.get('/api/auth/get-session')
      const data = response.data as { user: { name: string } }
      if (data === null) {
        return false
      }
      return data
    },
  })
