import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { IconBlockquote, IconDots, IconPointer, IconScreenshot, IconSend, IconSettings } from '@tabler/icons-react'
import { LLMBudget } from './conversation/llm-budget'
import { MessageUser } from './conversation/message-user'
import { MessageAssistant } from './conversation/message-assistant'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useSnapshot } from 'valtio'
import { sessionStore } from '@/stores/session'
import { MessageParts } from './conversation/message-parts'
import { InputArea } from './conversation/input-area'
import { useEffect, useRef } from 'react'
import { sandboxStore } from '@/stores/sandbox'
import { ClientOnlyChatTransport } from '@/lib/client-only-chat-transport'
import { useCoreClient } from '@/hooks/use-core-client'

export function Conversation() {
  const session = useSnapshot(sessionStore)
  const sb = useSnapshot(sandboxStore)
  const messagesRef = useRef<HTMLDivElement>(null)
  const coreClient = useCoreClient()
  const chat = useChat({
    experimental_throttle: 300,
    transport: new ClientOnlyChatTransport(
      () => sessionStore.llmApiKey,
      () => coreClient.current,
      () => sandboxStore.id,
    ),
  })

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [chat.messages])

  return (
    <div className="conversation w-96 py-4 text-sm flex flex-col">
      <div className="messages flex-1 overflow-y-auto" ref={messagesRef}>
        {chat.messages.map((message) =>
          message.role === 'user' ? (
            <MessageUser time="" key={message.id}>
              <MessageParts parts={message.parts} />
            </MessageUser>
          ) : message.role === 'assistant' ? (
            <MessageAssistant time="" key={message.id}>
              <MessageParts parts={message.parts} />
            </MessageAssistant>
          ) : null,
        )}

        {chat.error && <div className="text-red-500">{chat.error.message}</div>}
      </div>
      <InputArea chat={chat} />
    </div>
  )
}
