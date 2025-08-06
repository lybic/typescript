import { IComputerUseAction } from '@lybic/schema'
import { IconSparkles } from '@tabler/icons-react'

export function AgentActions({ actions }: { actions: IComputerUseAction[] }) {
  if (actions.length === 0) {
    return null
  }

  return (
    <>
      <IconSparkles className="size-3" />
      {actions.map((action) => action.type).join(', ')}
    </>
  )
}
