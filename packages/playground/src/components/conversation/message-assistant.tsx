import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { IconBlockquote, IconDots, IconPointer, IconScreenshot, IconSend, IconSettings } from '@tabler/icons-react'

export function MessageAssistant({ children, time }: { children: React.ReactNode; time: string }) {
  return (
    <div className="message-assistant mx-2 rounded-lg p-2">
      <div className="p-2 break-words whitespace-pre-wrap">{children}</div>
      <div className="message-footer text-xs text-muted-foreground text-left ml-2 flex flex-wrap gap-2 items-center">
        <div>{time}</div>
        <div className="flex gap-1 items-center">
          <IconPointer className="size-3" />
          click
        </div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="size-4">
                <IconDots className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <IconBlockquote className="size-4" />
                Original
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconScreenshot className="size-4" />
                Screenshot
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
