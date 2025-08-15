import { Button } from '@/components/ui/button'
import { useEffectEvent } from 'use-effect-event'
import { useSnapshot } from 'valtio'
import { sandboxStore } from '@/stores/sandbox'

export function ExampleTasks({ onSendText }: { onSendText: (text: string) => void }) {
  return (
    <div className="flex flex-col gap-2 h-full justify-end px-2 pb-4">
      <div className="text-sm text-muted-foreground">No idea? Try one of these:</div>
      <Task
        title="Open the calculator (in standard mode)"
        description="and calculate (1263+456)×78÷5"
        prompt="Open the calculator (in standard mode) and calculate (1263+456)×78÷5"
        onSendText={onSendText}
      />
      <Task
        title="Search for news about Agent"
        description="and record the first three news headlines into a txt document"
        prompt="Search for news about Agent and record the first three news headlines into a txt document"
        onSendText={onSendText}
      />
    </div>
  )
}

function Task({
  title,
  description,
  prompt,
  onSendText,
}: {
  title: string
  description: string
  prompt: string
  onSendText: (text: string) => void
}) {
  const { id: sandboxId } = useSnapshot(sandboxStore)
  const handleClick = useEffectEvent(() => {
    onSendText(prompt)
  })

  return (
    <Button
      disabled={!sandboxId}
      variant="outline"
      className="h-auto text-left justify-start py-4"
      onClick={handleClick}
    >
      <div className="flex flex-col gap-1 w-full">
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-xs text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap">{description}</p>
      </div>
    </Button>
  )
}
