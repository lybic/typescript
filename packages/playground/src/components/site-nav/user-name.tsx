import { getSessionQueryOptions } from '@/queries/get-session'
import { clearSession, sessionStore } from '@/stores/session'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { Spinner } from '../ui/spinner'

export function UserName() {
  const { data: session, isLoading } = useQuery(getSessionQueryOptions())
  useEffect(() => {
    if (session === false) {
      clearSession()
    }
  }, [session])

  return isLoading ? (
    <Spinner className="size-4 text-muted-foreground" />
  ) : (
    <span>{session ? session.user.name : 'Guest'}</span>
  )
}
