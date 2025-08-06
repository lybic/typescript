import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import { ShortTime } from '@/components/short-time'
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import {
  IconBlockquote,
  IconDots,
  IconPointer,
  IconScreenshot,
  IconSend,
  IconSettings,
  IconSparkles,
} from '@tabler/icons-react'
import React from 'react'

export function MessageAssistant({
  children,
  time,
  action,
}: {
  children: React.ReactNode
  time: number
  action?: React.ReactNode
}) {
  return (
    <div className="message-assistant mx-2 rounded-lg p-2">
      <div className="p-2 break-words whitespace-pre-wrap">{children}</div>
      <div className="message-footer text-xs text-muted-foreground text-left ml-2 flex flex-wrap gap-2 items-center">
        <div>
          <ShortTime time={time} />
        </div>
        {action && <div className="flex gap-1 items-center">{action}</div>}
      </div>
    </div>
  )
}
