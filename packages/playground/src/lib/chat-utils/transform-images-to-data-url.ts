import { ModelMessage } from 'ai'
import { apiRetry } from '../api/api-retry'
import { encodeBase64 } from '@std/encoding/base64'

export async function transformImagesToDataUrl(modelMessages: ModelMessage[], abortSignal?: AbortSignal) {
  const promises = [] as Promise<void>[]
  for (const message of modelMessages) {
    for (const part of message.content) {
      if (typeof part !== 'string' && part.type === 'file' && part.mediaType === 'image/webp') {
        promises.push(
          (async () => {
            const response = await apiRetry(abortSignal, (signal) => fetch(part.data.toString(), { signal })).catch(
              (err) => {
                console.error(err)
                if (abortSignal?.aborted) {
                  throw new Error('User aborted')
                }
                throw new Error('Failed to fetch screenshot, please try start a new chat: ' + err.message)
              },
            )
            if (!response.ok) {
              throw new Error('Your history is too old to process, please create a new chat instead of continuing.')
            }
            const arrayBuffer = await response.arrayBuffer()
            const base64 = encodeBase64(arrayBuffer)
            part.data = new URL(`data:image/webp;base64,${base64}`)
          })(),
        )
      }
    }
  }

  await Promise.all(promises)
}
