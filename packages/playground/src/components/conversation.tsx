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
import { useEffect, useMemo, useRef, useState } from 'react'
import { sandboxStore } from '@/stores/sandbox'
import { LybicChatTransport } from '@/lib/lybic-chat-transport'
import { useCoreClient } from '@/hooks/use-core-client'
import { LybicUIMessage } from '@/lib/ui-message-type'
import createDebug from 'debug'
import { produce } from 'immer'
import { AgentActions } from './conversation/agent-actions'
import { useEffectEvent } from 'use-effect-event'
import { indicatorStore } from '@/stores/indicator'
import { SystemPromptDialog } from './conversation/system-prompt-dialog'

const debug = createDebug('lybic:playground:conversation')

export function Conversation() {
  const session = useSnapshot(sessionStore)
  const sb = useSnapshot(sandboxStore)
  const messagesRef = useRef<HTMLDivElement>(null)
  const coreClient = useCoreClient()
  const initialMessages = useMemo(
    () => (localStorage['lybic-playground-messages'] ? JSON.parse(localStorage['lybic-playground-messages']) : []),
    [],
  )

  const [openSystemPromptDialog, setOpenSystemPromptDialog] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState(localStorage['lybic-playground-system-prompt'] ?? '')

  useEffect(() => {
    localStorage['lybic-playground-system-prompt'] = systemPrompt
  }, [systemPrompt])

  const chat = useChat<LybicUIMessage>({
    messages: initialMessages,
    experimental_throttle: 50,
    transport: new LybicChatTransport({
      apiKey: () => sessionStore.llmApiKey,
    }),
    onFinish: useEffectEvent((message) => {
      debug('onFinish', { message }, chat.messages)
      indicatorStore.status = 'idle'
      localStorage['lybic-playground-messages'] = JSON.stringify(chat.messages)
    }),
    onData: (data) => {
      debug('onData', data)
      if (data.type === 'data-screenShot') {
        chat.setMessages(
          produce((messages) => {
            const messageIndex = messages.findIndex((m) => m.id === data.data.messageId)
            if (messageIndex === -1) {
              return messages
            }
            const message = messages[messageIndex]
            message?.parts.push({
              type: 'file',
              mediaType: 'image/webp',
              url: data.data.url,
            })
            return messages
          }),
        )
      }
    },
  })

  const handleSendText = useEffectEvent((text: string) => {
    chat.sendMessage(
      { text, metadata: { createdAt: Date.now() } },
      {
        body: {
          systemPrompt,
          sandboxId: sandboxStore.id,
          orgId: sessionStore.orgId,
          trialSessionToken: sessionStore.trialSessionToken,
        },
      },
    )
  })

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [chat.messages])

  return (
    <div className="conversation w-96 py-4 text-sm flex flex-col">
      <div className="messages flex-1 overflow-y-auto" ref={messagesRef}>
        {chat.messages.map((message) => {
          return message.role === 'user' ? (
            <MessageUser message={message} key={message.id} />
          ) : message.role === 'assistant' ? (
            <MessageAssistant message={message} key={message.id} />
          ) : null
        })}

        {chat.error && <div className="text-red-500">{chat.error.message}</div>}
      </div>
      <InputArea
        chat={chat}
        onOpenSystemPromptDialog={() => setOpenSystemPromptDialog(true)}
        onSendText={handleSendText}
      />
      <SystemPromptDialog
        open={openSystemPromptDialog}
        onOpenChange={setOpenSystemPromptDialog}
        onApply={setSystemPrompt}
        initialSystemPrompt={systemPrompt}
      />
    </div>
  )
}
