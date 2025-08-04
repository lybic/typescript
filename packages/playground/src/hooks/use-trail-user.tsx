import { useQuery } from '@tanstack/react-query'
import { trailUserQueryOptions } from '@/queries/trail-user-query'

export function useTrailUser() {
  return useQuery(trailUserQueryOptions())
}
