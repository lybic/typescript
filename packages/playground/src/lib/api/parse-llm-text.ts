import { LybicClient } from '@lybic/core'
import { apiRetry } from './api-retry'

export function parseLlmText(
  coreClient: LybicClient,
  text: string,
  model: string,
  actionSpace: 'computer-use' | 'mobile-use',
  signal?: AbortSignal,
) {
  return apiRetry(signal, async (signal) => {
    const response = await coreClient.parseLlmOutputText(
      model as any,
      actionSpace,
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
