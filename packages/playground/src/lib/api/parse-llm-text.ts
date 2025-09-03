import { LybicClient } from '@lybic/core'
import { apiRetry } from './api-retry'

export function parseLlmText(coreClient: LybicClient, text: string, model: string, signal?: AbortSignal) {
  return apiRetry(signal, async (signal) => {
    const response = await coreClient.parseLlmOutputText(
      model as any,
      {
        textContent: text,
      },
      {
        signal,
      },
    )
    return response.data
  })
}
