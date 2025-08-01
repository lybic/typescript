import { useQuery } from '@tanstack/react-query'
import { trailUserQuery } from '@/queries/trail-user-query'

export function useTrailUser() {
  return useQuery(trailUserQuery())
}
