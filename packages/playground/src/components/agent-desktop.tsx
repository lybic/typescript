import { Button } from '@/components/ui/button'
import { IconBoxOff, IconCast, IconSandbox } from '@tabler/icons-react'
import BlurryBlob from './animata/background/blurry-blob'
import { Badge } from './ui/badge'
import { DesktopTopBar } from './desktop/top-bar'
import { LiveStreamFrameHost } from './desktop/live-stream-frame-host'
import { useSnapshot } from 'valtio'
import { sandboxStore } from '@/stores/sandbox'
import { Spinner } from './ui/spinner'
import { LiveStream } from './live-stream'

export function AgentDesktop() {
  const sb = useSnapshot(sandboxStore)

  return (
    <div className="agent-desktop flex-1">
      <div
        className="live-stream relative h-full w-full flex flex-col items-center justify-center p-4"
        style={{ containerType: 'size' }}
      >
        <DesktopTopBar />
        <div className="aspect-[16/9] w-[min(100%,177cqh)] border-1 shadow-sm relative rounded-lg overflow-hidden">
          {sb.connectDetails ? (
            <LiveStream connectDetails={sb.connectDetails} />
          ) : (
            <>
              <div className="w-full h-full absolute clip-rounded-lg">
                <BlurryBlob firstBlobColor="bg-blue-400" secondBlobColor="bg-purple-400" />
              </div>
              <div className="w-full h-full absolute flex flex-col items-center justify-center gap-4">
                {sb.id ? (
                  <Spinner className="text-muted-foreground size-6" />
                ) : (
                  <>
                    <IconSandbox className="size-10 text-muted-foreground" />
                    <div className="text-md text-muted-foreground">Select or create a sandbox to start</div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
        <div className="agent-dock top-4 w-full px-2 py-4 flex justify-between">
          <div className="flex gap-2 flex-1">
            <div className="bg-blue-400 size-3 mt-1 rounded-full">
              <div className="bg-blue-400 animate-[ping_2s_ease-in-out_infinite] size-3 rounded-full"></div>
            </div>
            <div className="text-sm text-muted-foreground">Thinking...</div>
          </div>

          <div className="flex gap-2 items-center text-sm text-muted-foreground ml-4 overflow-hidden">
            <div className="whitespace-nowrap overflow-hidden flex gap-2 items-center">
              <Badge variant="secondary">Planning</Badge>
              <div className="whitespace-nowrap text-ellipsis flex-1 overflow-hidden" title="doubao-seed-1.6-flash">
                doubao-seed-1.6-flash
              </div>
            </div>
            <div className="whitespace-nowrap overflow-hidden flex gap-2 items-center">
              <Badge variant="secondary" className="ml-2">
                Grounding
              </Badge>
              <div className="whitespace-nowrap text-ellipsis flex-1 overflow-hidden" title="doubao-1.5-ui-tars-250328">
                doubao-1.5-ui-tars-250328
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
