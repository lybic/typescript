import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { IconHistory } from '@tabler/icons-react'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { useEffect, useState } from 'react'
import { useEffectEvent } from 'use-effect-event'

export function SystemPromptDialog({
  open,
  onOpenChange,
  onApply,
  initialSystemPrompt,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApply: (input: string) => void
  initialSystemPrompt?: string
}) {
  const [input, setInput] = useState(initialSystemPrompt ?? '')
  const [history, setHistory] = useState<string[]>([])

  useEffect(() => {
    setInput(initialSystemPrompt ?? '')
  }, [initialSystemPrompt])

  useEffect(() => {
    setHistory(JSON.parse(localStorage.getItem('lybic-playground-system-prompt-history') ?? '[]'))
  }, [])

  const handleApply = useEffectEvent(() => {
    const newItem = input.trim()
    if (newItem) {
      const history = JSON.parse(localStorage.getItem('lybic-playground-system-prompt-history') ?? '[]')
      if (history.includes(newItem)) {
        history.splice(history.indexOf(newItem), 1)
      }
      history.push(newItem)
      localStorage.setItem('lybic-playground-system-prompt-history', JSON.stringify(history))
      setHistory(history)
    }
    onApply?.(newItem)
    onOpenChange?.(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>System Prompt</DialogTitle>
          <DialogDescription className="pt-2">
            System prompt set here will be appended to the default system prompt which contains the actions space and
            other necessary instructions. You can add detailed instructions to instruct the agent to do something
            specific.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          className="h-48"
          placeholder="While browsing the web, you should ..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <DialogFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <IconHistory />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="left" align="end">
              {history.length === 0 && <DropdownMenuItem disabled>No history</DropdownMenuItem>}
              {history.map((item: string) => (
                <DropdownMenuItem key={item} onClick={() => setInput(item)}>
                  <div className="text-ellipsis overflow-hidden whitespace-nowrap flex-1 max-w-72">
                    {item.slice(0, 200)}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleApply}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
