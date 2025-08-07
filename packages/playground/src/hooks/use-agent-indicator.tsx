import { indicatorStore } from '@/stores/indicator'
import { type IComputerUseAction, ILength } from '@lybic/schema'
import { RefObject, useEffect, useRef, useState } from 'react'
import { useSnapshot } from 'valtio'
import { useEffectEvent } from 'use-effect-event'

type MouseAction = IComputerUseAction & { type: `mouse:${string}` }

function isMouseAction(action: IComputerUseAction): action is MouseAction {
  return action.type.startsWith('mouse:')
}

export function useAgentIndicator(
  container: RefObject<HTMLDivElement | null>,
  indicatorDock: RefObject<HTMLDivElement | null>,
) {
  const { screenSize, lastAction } = useSnapshot(indicatorStore)
  const [screenPos, setScreenPos] = useState<{ x: number; y: number } | null>(null)
  const [type, setType] = useState<'point' | 'pointer'>('point')
  const dragTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (dragTimer.current) {
        clearTimeout(dragTimer.current)
      }
    }
  }, [])

  const recalculateScreenPos = useEffectEvent(() => {
    if (!container.current) return

    const containerRect = container.current.getBoundingClientRect()
    if (dragTimer.current) {
      clearTimeout(dragTimer.current)
    }

    if (lastAction && isMouseAction(lastAction) && lastAction.type !== 'mouse:drag') {
      const xRatio = toRatio(lastAction.x, screenSize.width)
      const yRatio = toRatio(lastAction.y, screenSize.height)

      const x = containerRect.left + xRatio * containerRect.width
      const y = containerRect.top + yRatio * containerRect.height

      setScreenPos({ x, y })
      setType('pointer')
    } else if (lastAction?.type === 'mouse:drag') {
      const xRatio = toRatio(lastAction.startX, screenSize.width)
      const yRatio = toRatio(lastAction.startY, screenSize.height)

      const x = containerRect.left + xRatio * containerRect.width
      const y = containerRect.top + yRatio * containerRect.height

      setScreenPos({ x, y })
      setType('pointer')
      dragTimer.current = setTimeout(() => {
        const xRatio = toRatio(lastAction.endX, screenSize.width)
        const yRatio = toRatio(lastAction.endX, screenSize.height)

        const x = containerRect.left + xRatio * containerRect.width
        const y = containerRect.top + yRatio * containerRect.height
        setScreenPos({ x, y })
      }, 350)
    } else {
      const indicatorDockRect = indicatorDock.current?.getBoundingClientRect()
      if (indicatorDockRect) {
        setScreenPos({
          x: indicatorDockRect.left,
          y: indicatorDockRect.top,
        })
        setType('point')
      }
    }
  })

  useEffect(() => {
    recalculateScreenPos()
    const resizeObserver = new ResizeObserver(recalculateScreenPos)
    if (container.current) {
      resizeObserver.observe(container.current)
    }
    return () => resizeObserver.disconnect()
  }, [screenSize, lastAction])

  useEffect(() => {
    if (lastAction) {
      const timer = setTimeout(() => {
        indicatorStore.lastAction = null
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [lastAction])

  return {
    screenPos,
    type,
  }
}

function toRatio(length: ILength, screenSize: number) {
  if (length.type === 'px') {
    return length.value / screenSize
  } else if (length.type === '/') {
    return length.numerator / length.denominator
  } else {
    throw new Error('Invalid length type')
  }
}
