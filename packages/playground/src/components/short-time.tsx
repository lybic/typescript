import { useMemo } from 'react'
import { format } from 'date-fns'

export function ShortTime({ time }: { time: number }) {
  if (!time) {
    return ''
  }

  const shortTime = useMemo(() => format(new Date(time), 'HH:mm'), [time])
  const fullTime = useMemo(() => format(new Date(time), 'yyyy-MM-dd HH:mm:ss'), [time])
  return <span title={fullTime}>{shortTime}</span>
}
