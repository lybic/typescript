import { proxy, subscribe } from 'valtio'

export const conversationConfigState = proxy({
  systemPrompt: '',
  model: 'doubao-1-5-ui-tars-250328',
  screenshotsInContext: 2 as number | 'all',
  language: 'zh',
  thinking: 'disabled' as 'disabled' | 'enabled' | 'auto',
})

if (localStorage['lybic-playground-conversation-config']) {
  const readFromLocalStorage = JSON.parse(localStorage['lybic-playground-conversation-config'] ?? '{}')
  Object.assign(conversationConfigState, readFromLocalStorage)
}

subscribe(conversationConfigState, () => {
  localStorage['lybic-playground-conversation-config'] = JSON.stringify(conversationConfigState)
})
