import { ResponseError } from '@lybic/core'
import pRetry from 'p-retry'

export function apiRetry<T>(signal: AbortSignal | undefined, fn: (signal: AbortSignal | undefined) => Promise<T>) {
  return pRetry(() => fn(signal), {
    retries: 3,
    factor: 2,
    signal,
    shouldRetry({ error }) {
      if (error instanceof ResponseError) {
        return error.data == null // if there are no data, means that error is not returned by server
      }
      return true
    },
  })
}
