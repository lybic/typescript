import { useCallback, useEffect } from 'react'
import { proxy, subscribe } from 'valtio'

const newChatStore = proxy({
  chat: 0,
})

export function useNewChat() {
  return useCallback(() => {
    newChatStore.chat++
  }, [])
}

export function useOnNewChat(callback: () => void) {
  useEffect(() => {
    return subscribe(newChatStore, () => {
      callback()
    })
  }, [callback])
}
