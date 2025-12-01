import { conversationConfigState } from '@/stores/conversation-config'
import { useSnapshot } from 'valtio'

export function ChatMenuSystemPrompt() {
  const { systemPrompt } = useSnapshot(conversationConfigState)
  return <div>{systemPrompt || '(Empty)'}</div>
}
