import React from 'react'
import { ShortTime } from '../short-time'
import { LybicUIMessage } from '@/lib/ui-message-type'
import { MessageParts } from './message-parts'
import { UseChatHelpers } from '@ai-sdk/react'

export function MessageUser({ message, chat }: { message: LybicUIMessage; chat: UseChatHelpers<LybicUIMessage> }) {
  return (
    <div className="message-user-input mx-2 my-2">
      <div className="max-w-4/5 w-fit ml-auto rounded-lg bg-accent text-accent-foreground p-2 break-words whitespace-pre-wrap">
        <MessageParts parts={message.parts} className="w-fit" chatStatus={chat.status} />
      </div>
      <div className="message-footer text-xs text-muted-foreground text-right my-1">
        <ShortTime time={message.metadata?.createdAt ?? 0} />
      </div>
    </div>
  )
}
