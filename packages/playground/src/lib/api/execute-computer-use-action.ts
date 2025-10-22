import { LybicClient, operations } from '@lybic/core'
import { apiRetry } from './api-retry'

export function executeSandboxAction(
  coreClient: LybicClient,
  sandboxId: string,
  {
    action,
    includeCursorPosition,
    includeScreenShot,
  }: {
    action: operations['executeSandboxAction']['requestBody']['content']['application/json']['action']
    includeScreenShot: boolean
    includeCursorPosition: boolean
  },
  signal?: AbortSignal,
) {
  return apiRetry(signal, async (signal) => {
    const response = await coreClient.executeSandboxAction(
      sandboxId,
      {
        action,
        includeScreenShot,
        includeCursorPosition,
      },
      {
        signal,
      },
    )
    return response.data
  })
}
