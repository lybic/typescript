import { useLLMBudget } from '@/hooks/use-llm-budget'
import { cn } from '@/lib/utils'
import { Spinner } from '../ui/spinner'

export function LLMBudget({ className }: { className?: string }) {
  const query = useLLMBudget()
  if (query.isLoading) {
    return <Spinner className="size-3" />
  }
  if (!query.data) {
    return null
  }
  return <div className={cn(className)}>{(query.data.budget - query.data.spend).toFixed(4)}</div>
}
