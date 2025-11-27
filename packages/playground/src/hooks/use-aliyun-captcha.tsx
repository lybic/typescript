import { useEffect, useState, useEffectEvent } from 'react'

export function useAliyunCaptcha({ onSuccess }: { onSuccess: (captchaToken: string) => void }) {
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [captchaInstance, setCaptchaInstance] = useState<{
    show: () => void
  } | null>(null)

  const show = useEffectEvent(() => {
    captchaInstance?.show()
  })

  const reloadCaptcha = useEffectEvent(() => {
    setCaptchaInstance(null)
    let instance: any = null
    ;(window as any).initAliyunCaptcha({
      SceneId: '15eluelh',
      mode: 'popup',
      success: (captchaToken: string) => {
        if (!instance || captchaToken.length < 7) {
          console.log('error while loading captcha', captchaToken)
          return
        }
        setCaptchaToken(captchaToken)
        onSuccess(captchaToken)
        reloadCaptcha()
      },
      getInstance: (_instance: any) => {
        instance = _instance
        setCaptchaInstance(_instance)
      },
      slideStyle: {
        width: 320,
        height: 40,
      },
    })
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      reloadCaptcha()
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  return { show, loaded: !!captchaInstance }
}
