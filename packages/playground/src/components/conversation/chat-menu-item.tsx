import { ComponentType } from 'react'
import { CHAT_MENU } from './chat-menu'

export function ChatMenuItem({
  menuItem,
}: {
  menuItem: Pick<(typeof CHAT_MENU)[0], 'label' | 'icon'> & { description?: string | ComponentType }
}) {
  return (
    <div className="flex gap-2 items-center">
      <menuItem.icon className="shrink-0 size-4 text-muted-foreground" />
      <div className="flex flex-col mr-2">
        <div>{menuItem.label}</div>
        <div className="text-muted-foreground">
          {typeof menuItem.description === 'string' ? (
            menuItem.description
          ) : menuItem.description ? (
            <menuItem.description />
          ) : undefined}
        </div>
      </div>
    </div>
  )
}
