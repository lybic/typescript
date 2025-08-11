import { Button } from '@/components/ui/button'
import { IconBoxOff, IconCast, IconDots, IconPoint, IconPointer, IconSandbox } from '@tabler/icons-react'
import BlurryBlob from './animata/background/blurry-blob'
import { Badge } from './ui/badge'
import { DesktopTopBar } from './desktop/top-bar'
import { LiveStreamFrameHost } from './desktop/live-stream-frame-host'
import { useSnapshot } from 'valtio'
import { sandboxStore } from '@/stores/sandbox'
import { Spinner } from './ui/spinner'
import { LiveStream } from './live-stream'
import { useEffect, useRef, useState } from 'react'
import { useAgentIndicator } from '@/hooks/use-agent-indicator'
import { cn } from '@/lib/utils'
import { indicatorStore } from '@/stores/indicator'

export function AgentDesktop() {
  const sb = useSnapshot(sandboxStore)
  const { status } = useSnapshot(indicatorStore)
  const containerRef = useRef<HTMLDivElement>(null)
  const indicatorDockRef = useRef<HTMLDivElement>(null)
  const { screenPos, type } = useAgentIndicator(containerRef, indicatorDockRef)

  // prevent indicator animation on load
  const [indicatorAnimation, setIndicatorAnimation] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIndicatorAnimation(true)
    }, 1000)
    return () => {
      clearTimeout(timer)
    }
  }, [])

  return (
    <div className="agent-desktop flex-1">
      <div
        className="live-stream relative h-full w-full flex flex-col items-center justify-center p-4"
        style={{ containerType: 'size' }}
      >
        <DesktopTopBar />
        <div
          className="aspect-[16/9] w-[min(100%,calc(177cqh-12rem))] flex-[none] border-1 shadow-sm relative rounded-lg overflow-hidden"
          ref={containerRef}
        >
          {sb.connectDetails ? (
            <LiveStream connectDetails={sb.connectDetails} sandboxId={sb.id} />
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
          <div className="flex gap-2 flex-1 items-center">
            <div
              className={cn(
                'fixed top-0 left-0 size-6 overflow-hidden origin-center text-blue-400',
                indicatorAnimation ? 'transition-transform duration-300' : 'transition-none',
              )}
              style={{
                transform: screenPos ? `translate(${screenPos.x}px, ${screenPos.y}px)` : undefined,
              }}
              data-type={type}
            >
              <IconPoint
                className="absolute opacity-0 in-[[data-type=point]]:opacity-100 transition-opacity duration-300"
                fill="currentColor"
              />
              <IconPointer
                className="absolute text-black opacity-0 in-[[data-type=pointer]]:opacity-100 transition-opacity duration-300"
                fill="#fff"
                size={16}
              />
            </div>
            <div className="agent-indicator-dock size-6 -ml-1 flex items-center justify-center" ref={indicatorDockRef}>
              {status === 'running' && (
                <div className="bg-blue-400 size-3 rounded-full animate-[ping_2s_ease-in-out_infinite]"></div>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {status === 'running' ? 'Thinking...' : status === 'done' ? 'Done' : 'Waiting...'}
            </div>
          </div>

          {/* <div className="flex gap-2 items-center text-sm text-muted-foreground ml-4 overflow-hidden">
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
          </div> */}
        </div>
      </div>
    </div>
  )
}
