import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { UIMessage, UseChatHelpers } from '@ai-sdk/react'
import {
  IconBlocks,
  IconCommand,
  IconDownload,
  IconFile,
  IconFileTime,
  IconLanguage,
  IconPlayerStop,
  IconPlus,
  IconPrompt,
  IconSend,
  IconSettings,
  IconSlideshow,
} from '@tabler/icons-react'
import { LLMBudget } from './llm-budget'
import { useState } from 'react'
import { useEffectEvent } from 'use-effect-event'
import { LybicUIMessage } from '@/lib/ui-message-type'
import { indicatorStore } from '@/stores/indicator'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
} from '../ui/dropdown-menu'
import { useSnapshot } from 'valtio'
import { conversationConfigState } from '@/stores/conversation-config'

export function InputArea({
  chat,
  isLoading,
  onOpenSystemPromptDialog,
  onSendText,
  onNewChat,
}: {
  chat: UseChatHelpers<LybicUIMessage>
  isLoading: boolean
  onOpenSystemPromptDialog: () => void
  onSendText: (text: string) => void
  onNewChat: () => void
}) {
  const { model, screenshotsInContext, language } = useSnapshot(conversationConfigState)
  const [input, setInput] = useState('')

  const handleSubmit = useEffectEvent(() => {
    onSendText(input)
    setInput('')
  })

  const handleStop = useEffectEvent(() => {
    chat.stop()
  })

  return (
    <div className="message-input p-2">
      <Textarea
        placeholder="Use the computer to ..."
        className="resize-none"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <div className="flex gap-2 mt-2 justify-between items-center">
        <div className="text-xs text-muted-foreground flex items-center">
          <div>LLM Credits:</div>
          <div className="ml-1"></div>
          <LLMBudget />
        </div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <IconSettings />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* <DropdownMenuItem>
                <IconDownload />
                Download Current Chat
              </DropdownMenuItem> */}
              <DropdownMenuItem onClick={onNewChat}>
                <IconPlus />
                Start New Chat
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onOpenSystemPromptDialog}>
                <IconCommand />
                System Prompt
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <IconBlocks className="shrink-0 size-4 text-muted-foreground" />
                  <span className="mx-2">Model</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent collisionPadding={20}>
                    <DropdownMenuRadioGroup
                      value={model}
                      onValueChange={(value) => {
                        conversationConfigState.model = value
                      }}
                    >
                      <DropdownMenuRadioItem value="doubao-seed-1-6-flash-250715">
                        Doubao Seed 1.6 Flash
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="doubao-1-5-ui-tars-250328">
                        Doubao 1.5 UI-TARS 250328
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="doubao-1-5-ui-tars-250428">
                        Doubao 1.5 UI-TARS 250428
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="doubao-1-5-thinking-vision-pro-250428">
                        Doubao 1.5 Thinking Vision Pro 250428
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <IconFileTime className="shrink-0 size-4 text-muted-foreground" />
                  <span className="mx-2">Screenshots in Context</span>
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
                  <span className="mx-2">Prompt Language</span>
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
          {chat.status === 'streaming' ? (
            <Button size="icon" className="ml-2" onClick={handleStop}>
              <IconPlayerStop />
            </Button>
          ) : (
            <Button
              size="icon"
              className="ml-2"
              isLoading={chat.status === 'submitted' || isLoading}
              onClick={handleSubmit}
            >
              <IconSend />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
