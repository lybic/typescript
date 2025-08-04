export function asyncEffect(effect: () => Promise<void>, cancel?: () => Promise<void>, cleanup?: () => Promise<void>) {
  let isStartRunning = false
  let isFinished = false
  const timer = setTimeout(() => {
    isStartRunning = true
    effect().then(
      () => {
        isFinished = true
      },
      (err) => {
        isFinished = true
        console.error(err)
      },
    )
  })

  return () => {
    if (!isStartRunning) {
      clearTimeout(timer)
    } else if (!isFinished) {
      void cancel?.().then(
        () => cleanup?.(),
        () => cleanup?.(),
      )
    } else {
      void cleanup?.()
    }
  }
}
