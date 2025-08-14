import { ShortTime } from '@/components/short-time'
import { LybicUIMessage } from '@/lib/ui-message-type'
import { useMemo } from 'react'
import { MessageParts } from './message-parts'
import { AgentActions } from './agent-actions'
import { UseChatHelpers } from '@ai-sdk/react'

export function MessageAssistant({ message, chat }: { message: LybicUIMessage; chat: UseChatHelpers<LybicUIMessage> }) {
  const parsedActions = useMemo(() => message.parts.find((part) => part.type === 'data-parsed')?.data, [message])

  return (
    <div className="message-assistant mx-2 rounded-lg p-2">
      <div className="p-2 break-words whitespace-pre-wrap">
        <MessageParts
          parts={message.parts}
          className="w-full"
          overrideText={parsedActions?.text}
          chatStatus={chat.status}
        />
      </div>
      <div className="message-footer text-xs text-muted-foreground text-left ml-2 flex flex-wrap gap-2 items-center">
        <div>
          <ShortTime time={message.metadata?.createdAt ?? 0} />
        </div>
        {parsedActions?.actions && (
          <div className="flex gap-1 items-center">
            <AgentActions actions={parsedActions.actions} />
          </div>
        )}
      </div>
    </div>
  )
}
