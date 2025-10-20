export async function throwIfAborted<T = void>(
  abortSignal: AbortSignal | undefined,
  callback?: () => Promise<T>,
  action?: string,
) {
  if (abortSignal?.aborted) {
    throw new Error('User aborted')
  }
  if (callback) {
    try {
      const r = await callback()

      if (abortSignal?.aborted) {
        throw new Error('User aborted')
      }

      return r
    } catch (e: any) {
      if (abortSignal?.aborted) {
        throw new Error('User aborted')
      }
      throw new Error(`${action ?? 'Operation'} failed, please try again later: ${e.message}`)
    }
  }
}
