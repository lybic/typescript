import { proxy, subscribe } from 'valtio'

export const conversationConfigState = proxy({
  systemPrompt: '',
  model: 'doubao-seed-1-6-flash-250715',
  screenshotsInContext: 2 as number | 'all',
  language: 'zh',
})

if (localStorage['lybic-playground-conversation-config']) {
  const readFromLocalStorage = JSON.parse(localStorage['lybic-playground-conversation-config'] ?? '{}')
  Object.assign(conversationConfigState, readFromLocalStorage)
}

subscribe(conversationConfigState, () => {
  localStorage['lybic-playground-conversation-config'] = JSON.stringify(conversationConfigState)
})
