import { ChatStatus, UIMessagePart } from 'ai'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { Button } from '../ui/button'
import { Spinner } from '../ui/spinner'
import { IconCaretRight } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import Markdown from 'react-markdown'
import { IComputerUseAction } from '@lybic/schema'
import { useMemo } from 'react'
import { LybicUIMessage } from '@/lib/ui-message-type'

export function MessageParts({
  parts,
  className,
  overrideText,
  chatStatus,
}: {
  parts: UIMessagePart<any, any>[]
  className?: string
  overrideText?: string
  chatStatus?: ChatStatus
}) {
  const onlyEmptyPart = parts.every((part) => part.type === 'text' && !part.text.trim())

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {onlyEmptyPart && (chatStatus === 'streaming' || chatStatus === 'submitted') ? (
        <Spinner className="size-4 text-muted-foreground m-1" />
      ) : (
        parts.map((part, index) =>
          part.type === 'text' ? (
            part.text && (
              <div className="prose prose-sm" key={index}>
                <Markdown>{overrideText ?? part.text}</Markdown>
              </div>
            )
          ) : part.type === 'reasoning' ? (
            <Collapsible key={index} className="flex flex-col w-full gap-2 border-1 px-2 py-1 bg-accent rounded-lg">
              <CollapsibleTrigger asChild>
                <Button
                  size="sm"
                  className="w-full justify-start hover:no-underline no-padding-inline h-7"
                  variant="link"
                >
                  <IconCaretRight
                    fill="currentColor"
                    className="in-[[data-state=open]]:rotate-90 transition-transform"
                  />
                  {part.state === 'streaming' && chatStatus === 'streaming' ? (
                    <span className="after:animate-dots">Thinking</span>
                  ) : (
                    <span>Thoughts</span>
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent
                className={cn(
                  'text-xs text-muted-foreground whitespace-normal',
                  part.state !== 'streaming' && 'ui-slide-down',
                )}
              >
                <div className="px-2 pb-2 prose prose-sm text-xs">
                  <Markdown>{part.text}</Markdown>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ) : part.type === 'file' ? (
            <div key={index}>
              <img src={part.url} alt="screenshot" className="w-42 max-w-full h-auto" />
            </div>
          ) : null,
        )
      )}
    </div>
  )
}
