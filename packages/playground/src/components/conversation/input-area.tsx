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
import { useEffect, useState } from 'react'
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
  const { model, ground, screenshotsInContext, language, systemPrompt, thinking, reflection } =
    useSnapshot(conversationConfigState)
  const [input, setInput] = useState('')

  useEffect(() => {
    const showHidden = localStorage.getItem('lybicPlaygroundShowHiddenModels') === 'true'
    const groundingModel = ground ? UI_MODELS[ground] : undefined

    if (!groundingModel || !groundingModel.type.includes('grounding') || (groundingModel.hidden && !showHidden)) {
      const newGroundingModel = Object.keys(UI_MODELS).find((key) => {
        const model = UI_MODELS[key]!
        return model.type.includes('grounding') && (showHidden || !model.hidden)
      })
      conversationConfigState.ground = newGroundingModel ?? null
    }
  }, [ground])

  const selectedPlanner = UI_MODELS[model]
  const canSend = !!sandboxId && !!ground

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

  const showHidden = localStorage.getItem('lybicPlaygroundShowHiddenModels') === 'true'

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
              <DropdownMenuItem onClick={handleExportChat}>
                <IconDownload />
                <div className="flex flex-col mr-2">
                  <div>Export Chat</div>
                  <div className="text-muted-foreground">Download current chat</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onOpenSystemPromptDialog}>
                <IconMessage2Star />
                <div className="flex flex-col mr-2">
                  <div>System Prompt</div>
                  <div className="text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis max-w-48">
                    {systemPrompt || '(Empty)'}
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <IconMessageChatbot className="shrink-0 size-4 text-muted-foreground" />
                  <div className="mx-2 flex flex-col">
                    <div>Planner Model</div>
                    <div className="text-muted-foreground">{UI_MODELS[model]?.displayName ?? model}</div>
                  </div>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent collisionPadding={20} className="w-64">
                    <DropdownMenuRadioGroup
                      value={model}
                      onValueChange={(value) => {
                        conversationConfigState.model = value
                        const newPlanner = UI_MODELS[value]
                        if (newPlanner && newPlanner.type.includes('grounding')) {
                          conversationConfigState.ground = value
                        } else {
                          const currentGroundingModel = UI_MODELS[conversationConfigState.ground ?? '']
                          if (!currentGroundingModel || !currentGroundingModel.type.includes('grounding')) {
                            const firstGroundingModel = Object.keys(UI_MODELS).find((key) =>
                              UI_MODELS[key]!.type.includes('grounding'),
                            )
                            if (firstGroundingModel) {
                              conversationConfigState.ground = firstGroundingModel
                            }
                          }
                        }
                      }}
                    >
                      {Object.entries(UI_MODELS)
                        .filter(([_, value]) => value.type.includes('planner') && (showHidden || !value.hidden))
                        .map(([key, value]) => (
                          <DropdownMenuRadioItem key={key} value={key}>
                            {value.displayName}
                          </DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <IconRuler className="shrink-0 size-4 text-muted-foreground" />
                  <div className="mx-2 flex flex-col">
                    <div>Grounding Model</div>
                    <div className="text-muted-foreground">
                      {ground ? (UI_MODELS[ground]?.displayName ?? ground) : 'Select...'}
                    </div>
                    {model === ground && ground && (
                      <div className="text-xs text-muted-foreground mt-1">
                        The model you choose will support self-grounding
                      </div>
                    )}
                  </div>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent collisionPadding={20} className="w-64">
                    <DropdownMenuRadioGroup
                      value={ground ?? undefined}
                      onValueChange={(value) => {
                        conversationConfigState.ground = value
                      }}
                    >
                      {Object.entries(UI_MODELS)
                        .filter(([_, value]) => value.type.includes('grounding') && (showHidden || !value.hidden))
                        .map(([key, value]) => (
                          <DropdownMenuRadioItem key={key} value={key}>
                            {value.displayName}
                          </DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger disabled={!UI_MODELS[model]?.thinking} className="data-[disabled]:opacity-75">
                  <IconBulb className="shrink-0 size-4 text-muted-foreground" />
                  <div className="mx-2 flex flex-col">
                    <div>Thinking</div>
                    <div className="text-muted-foreground">
                      {UI_MODELS[model]?.thinking ? (
                        thinking === 'enabled' ? (
                          'Enabled'
                        ) : (
                          'Disabled'
                        )
                      ) : (
                        <div className="text-muted-foreground">Not supported</div>
                      )}
                    </div>
                  </div>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent collisionPadding={20}>
                    <DropdownMenuRadioGroup
                      value={`${thinking}`}
                      onValueChange={(value) => {
                        conversationConfigState.thinking = value as 'disabled' | 'enabled'
                      }}
                    >
                      <DropdownMenuRadioItem value="disabled">Disabled</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="enabled">Enabled</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <IconBulb className="shrink-0 size-4 text-muted-foreground" />
                  <div className="mx-2 flex flex-col">
                    <div>Reflection</div>
                    <div className="text-muted-foreground">
                      {(reflection ?? 'disabled') === 'enabled' ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent collisionPadding={20}>
                    <DropdownMenuRadioGroup
                      value={reflection ?? 'disabled'}
                      onValueChange={(value) => {
                        // @ts-ignore
                        conversationConfigState.reflection = value as 'disabled' | 'enabled'
                      }}
                    >
                      <DropdownMenuRadioItem value="disabled">Disabled</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="enabled">Enabled</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <IconPhotoSpark className="shrink-0 size-4 text-muted-foreground" />
                  <div className="mx-2 flex flex-col">
                    <div>Screenshots in Context</div>
                    <div className="text-muted-foreground">
                      {screenshotsInContext === 'all' ? 'All' : screenshotsInContext}
                    </div>
                  </div>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent collisionPadding={20}>
                    <DropdownMenuRadioGroup
                      value={`${screenshotsInContext}`}
                      onValueChange={(value) => {
                        conversationConfigState.screenshotsInContext = value === 'all' ? 'all' : Number(value)
                      }}
                    >
                      <DropdownMenuRadioItem value="1">Only Latest</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="2">2</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="3">3</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="4">4</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="5">5</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="6">6</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <IconLanguage className="shrink-0 size-4 text-muted-foreground" />
                  <div className="mx-2 flex flex-col">
                    <div>Prompt Language</div>
                    <div className="text-muted-foreground">{language === 'zh' ? '中文' : 'English'}</div>
                  </div>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent collisionPadding={20}>
                    <DropdownMenuRadioGroup
                      value={language}
                      onValueChange={(value) => {
                        conversationConfigState.language = value
                      }}
                    >
                      <DropdownMenuRadioItem value="zh">中文</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
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
