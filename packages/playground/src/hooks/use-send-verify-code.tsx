import { myAxios } from '@/lib/axios'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

export function useSendVerifyCode() {
  const [counter, setCounter] = useState(0)
  const mutation = useMutation({
    mutationFn: async ({ mobileNumber, captcha }: { mobileNumber: string; captcha: string }) => {
      await myAxios.post('/api/trial/sms-verification', {
        mobileNumber,
        captcha,
      })
    },
    onSuccess() {
      setCounter(60)
    },
  })

  useEffect(() => {
    if (counter > 0) {
      const timer = setTimeout(() => {
        setCounter(counter - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [counter])

  return { counter, ...mutation }
}
