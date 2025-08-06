import { UIMessagePart } from 'ai'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { Button } from '../ui/button'
import { Spinner } from '../ui/spinner'
import { IconCaretRight } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

export function MessageParts({ parts, className }: { parts: UIMessagePart<any, any>[]; className?: string }) {
  const onlyEmptyPart = parts.every((part) => part.type === 'text' && !part.text.trim())

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {onlyEmptyPart ? (
        <Spinner className="size-4 text-muted-foreground m-1" />
      ) : (
        parts.map((part, index) =>
          part.type === 'text' ? (
            part.text && <div key={index}>{part.text}</div>
          ) : part.type === 'reasoning' ? (
            <Collapsible key={index} className="flex flex-col w-full gap-2 border-1 p-2 bg-accent rounded-lg">
              <CollapsibleTrigger asChild>
                <Button size="sm" className="w-full justify-start hover:no-underline no-padding-inline" variant="link">
                  <IconCaretRight
                    fill="currentColor"
                    className="in-[[data-state=open]]:rotate-90 transition-transform"
                  />
                  {part.state === 'streaming' ? (
                    <span className="after:animate-dots">Thinking</span>
                  ) : (
                    <span>Thoughts</span>
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="text-xs text-muted-foreground whitespace-normal ui-slide-down">
                <div className="px-2 pb-2">{part.text}</div>
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
