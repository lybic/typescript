import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { UIMessage, UseChatHelpers } from '@ai-sdk/react'
import { IconPlayerStop, IconSend, IconSettings } from '@tabler/icons-react'
import { LLMBudget } from './llm-budget'
import { useState } from 'react'
import { useEffectEvent } from 'use-effect-event'
import { LybicUIMessage } from '@/lib/ui-message-type'

export function InputArea({ chat }: { chat: UseChatHelpers<LybicUIMessage> }) {
  const [input, setInput] = useState('描述一下我的桌面')

  const handleSubmit = useEffectEvent(() => {
    chat.sendMessage({ text: input })
    setInput('再看看呢')
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
          <div className="ml-1">$</div>
          <LLMBudget />
        </div>
        <div>
          <Button variant="outline" size="icon">
            <IconSettings />
          </Button>
          {chat.status === 'streaming' ? (
            <Button size="icon" className="ml-2" onClick={handleStop}>
              <IconPlayerStop />
            </Button>
          ) : (
            <Button size="icon" className="ml-2" isLoading={chat.status === 'submitted'} onClick={handleSubmit}>
              <IconSend />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
