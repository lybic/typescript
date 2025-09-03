import { LybicClient, operations } from '@lybic/core'
import { apiRetry } from './api-retry'

export function executeComputerUseAction(
  coreClient: LybicClient,
  sandboxId: string,
  {
    action,
    includeCursorPosition,
    includeScreenShot,
  }: {
    action: operations['executeComputerUseAction']['requestBody']['content']['application/json']['action']
    includeScreenShot: boolean
    includeCursorPosition: boolean
  },
  signal?: AbortSignal,
) {
  return apiRetry(signal, async (signal) => {
    const response = await coreClient.executeComputerUseAction(
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
