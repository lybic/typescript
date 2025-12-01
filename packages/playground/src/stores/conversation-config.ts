import { proxy, subscribe } from 'valtio'

export const conversationConfigState = proxy({
  systemPrompt: '',
  // planner model
  model: 'doubao-1-5-thinking-vision-pro-250428',
  // grounding model
  ground: 'Qwen2.5-VL' as string | null,
  screenshotsInContext: 3 as number | 'all',
  language: 'zh',
  thinking: 'enabled' as 'disabled' | 'enabled' | 'auto',
  reflection: 'disabled' as 'disabled' | 'enabled' ,
})

if (localStorage['lybic-playground-conversation-config']) {
  const readFromLocalStorage = JSON.parse(localStorage['lybic-playground-conversation-config'] ?? '{}')
  Object.assign(conversationConfigState, readFromLocalStorage)
}

subscribe(conversationConfigState, () => {
  localStorage['lybic-playground-conversation-config'] = JSON.stringify(conversationConfigState)
})
