import { UseChatHelpers } from '@ai-sdk/react'
import { LybicUIMessage } from './ui-message-type'
import JSZip from 'jszip'

export async function exportChatHistory(chat: UseChatHelpers<LybicUIMessage>) {
  const zip = new JSZip()
  zip.file('chat.json', JSON.stringify(chat.messages))
  for (const message of chat.messages) {
    for (const part of message.parts) {
      if (typeof part !== 'string' && part.type === 'file' && part.mediaType === 'image/webp') {
        const response = await fetch(part.url)
        const arrayBuffer = await response.arrayBuffer()
        const newUrl = new URL(response.url)
        const filename = newUrl.pathname.split('/').pop()!
        zip.file(filename, new Blob([arrayBuffer]))
      }
    }
  }
  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
}
