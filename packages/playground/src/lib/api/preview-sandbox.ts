import { LybicClient } from '@lybic/core'
import { apiRetry } from './api-retry'

export function previewSandbox(coreClient: LybicClient, sandboxId: string, signal?: AbortSignal) {
  return apiRetry(signal, async (signal) => {
    const response = await coreClient.previewSandbox(sandboxId, {
      signal,
    })
    return response.data
  })
}
