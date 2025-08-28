import { useEffect } from 'react'
import { useEffectEvent } from 'use-effect-event'
import { proxy, subscribe } from 'valtio'

const newChatStore = proxy({
  chat: 0,
})

export function useNewChat() {
  return useEffectEvent(() => {
    newChatStore.chat++
  })
}

export function useOnNewChat(callback: () => void) {
  useEffect(() => {
    return subscribe(newChatStore, () => {
      callback()
    })
  }, [callback])
}
