import { indicatorStore } from '@/stores/indicator'
import { IComputerUseAction } from '@lybic/schema'
import { IconSparkles } from '@tabler/icons-react'
import { useEffectEvent } from 'use-effect-event'

export function AgentActions({ actions }: { actions: IComputerUseAction[] }) {
  if (actions.length === 0) {
    return null
  }

  const handleSetIndicator = useEffectEvent(() => {
    indicatorStore.lastAction = actions[0] ?? null
  })

  return (
    <>
      <IconSparkles className="size-3" onClick={handleSetIndicator} />
      {actions.map((action) => action.type).join(', ')}
    </>
  )
}
