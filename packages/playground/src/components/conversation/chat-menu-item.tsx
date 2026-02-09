import { ComponentType } from 'react'
import { Item } from './chat-menu'
import { cn } from '@/lib/utils'

export function ChatMenuItem({
  menuItem,
  disabled,
}: {
  menuItem: Pick<Item, 'label' | 'icon'> & { description?: string | ComponentType }
  disabled?: boolean
}) {
  return (
    <div className={cn('flex gap-2 items-center max-w-64', disabled && 'pointer-events-none opacity-75')}>
      <menuItem.icon className="shrink-0 size-4 text-muted-foreground" />
      <div className="flex flex-col mr-2">
        <div>{menuItem.label}</div>
        <div className="text-muted-foreground line-clamp-1">
          {disabled ? (
            'N/A'
          ) : typeof menuItem.description === 'string' ? (
            menuItem.description
          ) : menuItem.description ? (
            <menuItem.description />
          ) : undefined}
        </div>
      </div>
    </div>
  )
}
