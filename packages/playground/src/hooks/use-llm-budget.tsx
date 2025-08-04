import { llmBudgetQuery } from '@/queries/llm-budget-query'
import { sessionStore } from '@/stores/session'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useSnapshot } from 'valtio'

export function useLLMBudget() {
  const query = useQuery(llmBudgetQuery)
  const session = useSnapshot(sessionStore)
  useEffect(() => {
    if (session.trialSessionToken) {
      query.refetch()
    }
  }, [session.trialSessionToken])

  return query
}
