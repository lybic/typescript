import { LybicChatTransport } from '@/lib/lybic-chat-transport'
import { BodyExtras, LybicUIMessage } from '@/lib/ui-message-type'
import { conversationConfigState } from '@/stores/conversation-config'
import { indicatorStore } from '@/stores/indicator'
import { sandboxStore } from '@/stores/sandbox'
import { sessionStore } from '@/stores/session'
import { useChat } from '@ai-sdk/react'
import createDebug from 'debug'
import { produce } from 'immer'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useSnapshot } from 'valtio'
import { InputArea } from './conversation/input-area'
import { MessageAssistant } from './conversation/message-assistant'
import { MessageUser } from './conversation/message-user'
import { SystemPromptDialog } from './conversation/system-prompt-dialog'
import { MapDialog } from './conversation/map-dialog'
import { nanoid } from 'nanoid'
import { useQueryClient } from '@tanstack/react-query'
import { llmBudgetQuery } from '@/queries/llm-budget-query'
import { UI_MODELS } from './conversation/models'
import { ExampleTasks } from './conversation/example-tasks'
import { useOnNewChat } from '@/hooks/use-new-chat'
import { DELAY_TIME_MS } from './conversation/delay'

const debug = createDebug('lybic:playground:conversation')

function shouldAutoSend(lastMessage?: LybicUIMessage): {
  autoSend: boolean
  error?: string
  success?: string
  userTakeover?: boolean
} {
  if (!lastMessage) {
    return { autoSend: false }
  }
  if (lastMessage.role === 'user') {
    return { autoSend: false }
  }
  debug('shouldContinue', lastMessage.parts)
  const parsed = lastMessage.parts.find((part) => part.type === 'data-parsed')
  if (!parsed) {
    return { autoSend: false }
  }
  const stopActions = parsed.data.actions.filter(
    (action) => action.type === 'failed' || action.type === 'finished' || action.type === 'client:user-takeover',
  )
  if (stopActions.length > 0) {
    const failedAction = stopActions.find((action) => action.type === 'failed')
    if (failedAction) {
      return { autoSend: false, error: failedAction.message ?? 'Unable to process' }
    }
    const successAction = stopActions.find((action) => action.type === 'finished')
    if (successAction) {
      return { autoSend: false, success: successAction.message ?? 'Task has been completed' }
    }
    const userTakeoverAction = stopActions.find((action) => action.type === 'client:user-takeover')
    if (userTakeoverAction) {
      return { autoSend: false, userTakeover: true }
    }
    return { autoSend: false }
  }
  return { autoSend: true }
}

export function Conversation() {
  const queryClient = useQueryClient()
  const { systemPrompt, model, ground, screenshotsInContext, language, thinking, reflection } =
    useSnapshot(conversationConfigState)
  const messagesRef = useRef<HTMLDivElement>(null)
  const [chatId, setChatId] = useState('unassigned')
  const initialMessages = useMemo(
    () => (localStorage['lybic-playground-messages'] ? JSON.parse(localStorage['lybic-playground-messages']) : []),
    [],
  )

  const [openSystemPromptDialog, setOpenSystemPromptDialog] = useState(false)
  const [openMapDialog, setOpenMapDialog] = useState(false)

  const autoSendTimer = useRef<NodeJS.Timeout | null>(null)
  const clearAutoSendTimer = () => {
    if (autoSendTimer.current) {
      clearTimeout(autoSendTimer.current)
      autoSendTimer.current = null
    }
    setWaitingForAutoSend(false)
    indicatorStore.status = 'idle'
  }
  useEffect(() => {
    return () => {
      clearAutoSendTimer()
    }
  }, [])
  const [waitingForAutoSend, setWaitingForAutoSend] = useState(false)

  const handleSendText = (text: string) => {
    indicatorStore.status = 'running'
    const actionSpace = sandboxStore.shape?.os === 'Android' ? 'mobile-use' : 'computer-use'
    chat.sendMessage(
      { text, metadata: { createdAt: Date.now() } },
      {
        body: {
          baseUrl: import.meta.env.VITE_LYBIC_BASE_URL ?? '/',
          systemPrompt,
          sandboxId: sandboxStore.id,
          orgId: sessionStore.orgId,
          trialSessionToken: sessionStore.trialSessionToken,
          bearerToken: sessionStore.dashboardSessionToken,
          thinking: UI_MODELS[model]?.thinking ? thinking : undefined,
          model,
          groundingModel: ground,
          screenshotsInContext,
          language,
          actionSpace,
        } as BodyExtras,
      },
    )
  }

  const chat = useChat<LybicUIMessage>({
    id: chatId,
    messages: chatId === 'unassigned' ? initialMessages : [],
    experimental_throttle: 50,
    transport: new LybicChatTransport({
      apiKey: () => (sessionStore.signedInViaDashboard ? sessionStore.dashboardSessionToken : sessionStore.llmApiKey),
    }),
    onFinish: useCallback(
      ({ message }: { message: LybicUIMessage }) => {
        debug('onFinish', message, chat.messages)
        queryClient.invalidateQueries(llmBudgetQuery)
        indicatorStore.status = 'idle'
        try {
          localStorage['lybic-playground-messages'] = JSON.stringify(chat.messages)
        } catch (e) {
          console.warn('Failed to save messages to localStorage', e)
        }

        const { autoSend, error, success, userTakeover } = shouldAutoSend(message)
        if (autoSend) {
          setWaitingForAutoSend(true)
          autoSendTimer.current = setTimeout(
            () => {
              handleSendText('')
              setWaitingForAutoSend(false)
            },
            sandboxStore.shape?.os === 'Android' ? 2900 : 1600,
          )
        }
        if (error) {
          toast.error('Action failed', { description: error })
        }
        if (success) {
          toast.success('Action finished', { description: success })
        }
        if (userTakeover) {
          toast.info('Agent is requesting your help', {
            description: 'Please take over the control and finish the request.',
          })
        }
      },
      [clearAutoSendTimer, handleSendText],
    ),
    onError: (error) => {
      debug('onError', error)
      clearAutoSendTimer()
    },
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
      } else if (data.type === 'data-parsed') {
        if (data.data.actions.length > 0) {
          indicatorStore.lastAction = structuredClone(data.data.actions[0]!)
        }
      }
    },
  })

  const handleStop = () => {
    chat.stop()
    clearAutoSendTimer()
  }

  const handleNewChat = () => {
    handleStop()
    setChatId(nanoid())
    localStorage['lybic-playground-messages'] = '[]'
  }

  useOnNewChat(handleNewChat)

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [chat.messages])

  return (
    <div className="conversation w-96 py-4 text-sm flex flex-col">
      <div className="messages flex-1 overflow-y-auto" ref={messagesRef}>
        {chat.messages.length === 0 && <ExampleTasks onSendText={handleSendText} />}
        {chat.messages.map((message) => {
          return message.role === 'user' ? (
            <MessageUser message={message} key={message.id} chat={chat} />
          ) : message.role === 'assistant' ? (
            <MessageAssistant message={message} key={message.id} chat={chat} />
          ) : null
        })}

        {chat.error && <div className="text-red-500">{formatError(chat.error)}</div>}
      </div>
      <InputArea
        chat={chat}
        onOpenSystemPromptDialog={() => setOpenSystemPromptDialog(true)}
        onSendText={handleSendText}
        onNewChat={handleNewChat}
        waitingForAutoSend={chat.status === 'submitted' || waitingForAutoSend}
        onStop={handleStop}
        onOpenMapDialog={() => setOpenMapDialog(true)}
      />
      <SystemPromptDialog
        open={openSystemPromptDialog}
        onOpenChange={setOpenSystemPromptDialog}
        onApply={(systemPrompt) => {
          conversationConfigState.systemPrompt = systemPrompt
        }}
        initialSystemPrompt={systemPrompt}
      />
      <MapDialog
        open={openMapDialog}
        onLocationChange={(location) => {
          setOpenMapDialog(false)
        }}
      />
    </div>
  )
}

function formatError(error: Error) {
  if (error.name === 'AbortError' || error.message.includes('signal is aborted without reason')) {
    return 'You have aborted the conversation. Create a new one before continuing.'
  }
  return error.message
}
