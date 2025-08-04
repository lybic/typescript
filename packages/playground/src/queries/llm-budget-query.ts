import { myAxios } from '@/lib/axios'
import { queryOptions } from '@tanstack/react-query'

export const llmBudgetQuery = queryOptions({
  queryKey: ['llm-budget'],
  queryFn: async () => {
    const { data } = await myAxios.get<{ spend: number; budget: number }>('/api/trial/user/llm-budget')
    return data
  },
})
