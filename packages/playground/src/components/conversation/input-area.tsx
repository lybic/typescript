import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { UIMessage, UseChatHelpers } from '@ai-sdk/react'
import {
  IconBulb,
  IconDownload,
  IconLanguage,
  IconMessage2Star,
  IconMessageChatbot,
  IconPhotoSpark,
  IconPlayerStop,
  IconPlus,
  IconRuler,
  IconSend,
  IconSettings,
} from '@tabler/icons-react'
import { LLMBudget } from './llm-budget'
import { Fragment, useEffect, useState } from 'react'
import { useEffectEvent } from 'use-effect-event'
import { LybicUIMessage } from '@/lib/ui-message-type'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { useSnapshot } from 'valtio'
import { conversationConfigState } from '@/stores/conversation-config'
import { sandboxStore } from '@/stores/sandbox'
import { UI_MODELS } from './models'
import { exportChatHistory } from '@/lib/save-chat-history'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { sessionStore } from '@/stores/session'
import { CHAT_MENU } from './chat-menu'
import { ChatMenuItem } from './chat-menu-item'
import { cn } from '@/lib/utils'

export function InputArea({
  chat,
  waitingForAutoSend,
  onOpenSystemPromptDialog,
  onSendText,
  onNewChat,
  onStop,
}: {
  chat: UseChatHelpers<LybicUIMessage>
  waitingForAutoSend: boolean
  onOpenSystemPromptDialog: () => void
  onSendText: (text: string) => void
  onNewChat: () => void
  onStop: () => void
}) {
  const { id: sandboxId } = useSnapshot(sandboxStore)
  const { signedInViaDashboard } = useSnapshot(sessionStore)
  const { model } = useSnapshot(conversationConfigState)
  const [input, setInput] = useState('')

  const modelConfig = UI_MODELS[model]
  const disabledMenuItems = {
    thinking: modelConfig?.thinking ? false : true,
  } as Record<string, boolean>
  const canSend = !!sandboxId

  const handleSubmit = useEffectEvent(() => {
    if (input === 'showHiddenModels') {
      localStorage.setItem('lybicPlaygroundShowHiddenModels', 'true')
      location.reload()
      return
    }

    if (chat.status === 'streaming' || chat.status === 'submitted') {
      onStop()
    } else {
      onSendText(input)
      setInput('')
    }
  })

  const handleStop = useEffectEvent(() => {
    onStop()
  })

  const handleExportChat = useEffectEvent(async () => {
    await exportChatHistory(chat)
  })

  const handleMenuItemClick = (key: string) => {
    if (key === 'system-prompt') {
      onOpenSystemPromptDialog()
    }
    if (key === 'export-chat') {
      handleExportChat()
    }
  }

  return (
    <div className="message-input p-2">
      <Textarea
        placeholder={sandboxId ? 'Use the computer to ...' : 'Select or create a sandbox to start'}
        className="resize-none"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={!sandboxId}
      />
      <div className="flex gap-2 mt-2 justify-between items-center">
        <div className="text-xs text-muted-foreground flex items-center">
          {!signedInViaDashboard && (
            <>
              <div>LLM Credits:</div>
              <div className="ml-1"></div>
              <LLMBudget />
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={onNewChat} aria-label="New Chat">
                <IconPlus />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Start a new chat</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" aria-label="Chat Settings">
                      <IconSettings />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Chat Settings</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {CHAT_MENU.map((menuItem) =>
                'options' in menuItem ? (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger disabled={disabledMenuItems[menuItem.key] ?? false}>
                      <ChatMenuItem
                        disabled={disabledMenuItems[menuItem.key] ?? false}
                        menuItem={{
                          ...menuItem,
                          description: menuItem.options.find(
                            (option) => option.key === `${conversationConfigState[menuItem.key]}`,
                          )?.label,
                        }}
                      />
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent collisionPadding={20} className="w-64">
                        <DropdownMenuRadioGroup
                          value={`${conversationConfigState[menuItem.key]}`}
                          onValueChange={(key: string) => {
                            ;(conversationConfigState as Record<string, any>)[menuItem.key] = menuItem.options.find(
                              (option) => option.key === key,
                            )?.value
                          }}
                        >
                          {menuItem.options.map((option) => (
                            <DropdownMenuRadioItem key={option.key} value={option.key}>
                              {option.label}
                            </DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                ) : (
                  <DropdownMenuItem key={menuItem.key} onClick={() => handleMenuItemClick(menuItem.key)}>
                    <ChatMenuItem menuItem={menuItem} />
                  </DropdownMenuItem>
                ),
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          {chat.status === 'streaming' || chat.status === 'submitted' || waitingForAutoSend ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="outline" onClick={handleStop} aria-label="Abort">
                  <IconPlayerStop />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Abort</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  disabled={!canSend}
                  onClick={handleSubmit}
                  className="disabled:pointer-events-auto disabled:hover:bg-primary"
                  aria-label="Send"
                >
                  <IconSend />
                </Button>
              </TooltipTrigger>
              <TooltipContent collisionPadding={12}>
                <p>
                  {!sandboxId
                    ? 'Select or create a sandbox first'
                    : !canSend
                      ? 'Please select a grounding model'
                      : 'Send'}
                </p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  )
}
