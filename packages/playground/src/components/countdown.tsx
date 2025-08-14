import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

export function Countdown({ expiresAt, onCountdownExpired }: { expiresAt: number; onCountdownExpired?: () => void }) {
  const [countdown, setCountdown] = useState(formatTime(expiresAt - Date.now()))
  const [isWarning, setIsWarning] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = expiresAt - Date.now()
      if (diff <= 0) {
        setCountdown('00:00:00')
        setIsWarning(true)
        onCountdownExpired?.()
        clearInterval(interval)
      } else {
        setCountdown(formatTime(diff))
        if (diff < 3 * 60 * 1000) {
          setIsWarning(true)
        } else {
          setIsWarning(false)
        }
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  return <span className={cn(isWarning && 'text-yellow-600')}>{countdown}</span>
}

function formatTime(diff: number) {
  if (diff < 0) {
    return '00:00'
  }

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  } else {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
}
