import { Button } from '@/components/ui/button'
import { IconCast } from '@tabler/icons-react'

export function AgentDesktop() {
  return (
    <div className="agent-desktop flex-1">
      <div
        className="live-stream relative h-full w-full flex flex-col items-center justify-center p-4"
        style={{ containerType: 'size' }}
      >
        <div className="live-stream-title flex w-full justify-between px-2 mb-2">
          <div className="flex gap-2 items-center">
            <IconCast className="size-4" />
            <div className="text-sm">Live Stream</div>
          </div>
          <div className="flex gap-2 text-sm text-muted-foreground items-center">
            <div className="font-mono">00:10:00</div>
            <Button size="sm" variant="outline" className="text-xs h-7 text-destructive hover:text-destructive">
              Terminate
            </Button>
          </div>
        </div>
        <canvas
          className="aspect-[16/9] w-[min(100%,177cqh)] border-1 rounded-lg shadow-sm overflow-hidden"
          tabIndex={0}
        ></canvas>
        <div className="agent-dock top-4 w-full px-2 py-4">
          <div className="flex gap-2">
            <div className="bg-blue-400 size-3 mt-1 rounded-full">
              <div className="bg-blue-400 animate-[ping_2s_ease-in-out_infinite] size-3 rounded-full"></div>
            </div>
            <div className="text-sm text-muted-foreground">Thinking...</div>
          </div>
        </div>
      </div>
    </div>
  )
}
