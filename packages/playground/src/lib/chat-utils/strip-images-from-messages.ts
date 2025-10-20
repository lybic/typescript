import { ModelMessage } from 'ai'

export function stripImagesFromMessages(messages: ModelMessage[], keepImages: number | 'all') {
  if (keepImages !== 'all') {
    let screenshotsInContext = keepImages ?? 1
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i]!
      if (message.role !== 'user') {
        continue
      }
      if (typeof message.content === 'string') {
        continue
      }
      for (let j = 0; j < message.content.length; j++) {
        const part = message.content[j]!
        if (part.type === 'file' && part.mediaType === 'image/webp') {
          screenshotsInContext--
          if (screenshotsInContext < 0) {
            message.content.splice(j, 1)
          }
        }
      }
    }
  }
}
