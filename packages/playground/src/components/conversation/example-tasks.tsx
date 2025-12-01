import { Button } from '@/components/ui/button'
import { useSnapshot } from 'valtio'
import { sandboxStore } from '@/stores/sandbox'

export function ExampleTasks({ onSendText }: { onSendText: (text: string) => void }) {
  return (
    <div className="flex flex-col gap-2 h-full justify-end px-2 pb-4">
      <div className="text-sm text-muted-foreground">No idea? Try one of these:</div>
      <Task
        title="Book a flight"
        description="Please help me book the cheapest flight from Beijing to Shanghai for tomorrow on Ctrip."
        prompt="Please help me book the cheapest flight from Beijing to Shanghai for tomorrow on Ctrip."
        onSendText={onSendText}
      />
      <Task
        title="Scrape comments"
        description='Go to Bilibili, search for videos related to "lybic", then record the first comment in a WPS Table.'
        prompt={`Go to Bilibili, search for videos related to "lybic", then record the first comment in a WPS Table. The WPS Table application is on the desktop.
Requirements:
1. The content to be recorded in the table must include the commenter's name, comment content, and comment time.
2. Do not copy by selecting text; instead, directly record and input the content you see into the table. It is essential to ensure the content is accurate and free of errors.`}
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
  const handleClick = () => {
    onSendText(prompt)
  }

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
