import { UIMessagePart } from 'ai'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { Button } from '../ui/button'

export function MessageParts({ parts }: { parts: UIMessagePart<any, any>[] }) {
  return (
    <div className="flex flex-col gap-2">
      {parts.map((part, index) =>
        part.type === 'text' ? (
          <div key={index}>{part.text}</div>
        ) : part.type === 'reasoning' ? (
          <Collapsible key={index} className="flex flex-col gap-2">
            <CollapsibleTrigger asChild>
              <Button size="sm" className="w-full justify-start" variant="outline">
                Reasoning...
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="text-xs text-muted-foreground whitespace-normal">
              <div>{part.text}</div>
            </CollapsibleContent>
          </Collapsible>
        ) : null,
      )}
    </div>
  )
}
