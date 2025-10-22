import { indicatorStore } from '@/stores/indicator'
import { IComputerUseAction } from '@lybic/schema'
import { IconSparkles } from '@tabler/icons-react'

export function AgentActions({ actions }: { actions: IComputerUseAction[] }) {
  if (actions.length === 0) {
    return null
  }

  const handleSetIndicator = () => {
    indicatorStore.lastAction = actions[0] ?? null
  }

  return (
    <>
      <IconSparkles className="size-3" onClick={handleSetIndicator} />
      {actions.map((action) => action.type).join(', ')}
    </>
  )
}
