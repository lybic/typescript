import React from 'react'

export function MessageUser({ children, time }: { children: React.ReactNode; time: string }) {
  return (
    <div className="message-user-input mx-2 my-2">
      <div className="w-4/5 ml-auto rounded-lg bg-accent text-accent-foreground p-2 px-4 break-words whitespace-pre-wrap">
        {children}
      </div>
      <div className="message-footer text-xs text-muted-foreground text-right my-1">{time}</div>
    </div>
  )
}
