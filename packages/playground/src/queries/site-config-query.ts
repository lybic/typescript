import { myAxios } from '@/lib/axios'
import { queryOptions } from '@tanstack/react-query'
import type { SiteConfig } from '@lybic/schema'

export const siteConfigQuery = queryOptions({
  queryKey: ['site-config'],
  queryFn: async () => {
    const { data } = await myAxios.get<SiteConfig>('/api/site/config')
    return data
  },
})
