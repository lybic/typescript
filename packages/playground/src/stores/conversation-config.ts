import { proxy, subscribe } from 'valtio'

export const conversationConfigState = proxy({
  systemPrompt: '',
  model: 'doubao-1-5-thinking-vision-pro-250428',
  screenshotsInContext: 3 as number | 'all',
  language: 'zh',
  thinking: 'enabled' as 'disabled' | 'enabled' | 'auto',
})

if (localStorage['lybic-playground-conversation-config']) {
  const readFromLocalStorage = JSON.parse(localStorage['lybic-playground-conversation-config'] ?? '{}')
  Object.assign(conversationConfigState, readFromLocalStorage)
}

subscribe(conversationConfigState, () => {
  localStorage['lybic-playground-conversation-config'] = JSON.stringify(conversationConfigState)
})
