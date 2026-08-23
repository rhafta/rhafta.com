import { useEffect } from 'react'
import type { RotationEngine } from './useRotationState'

type Options = {
  locked: boolean
  onDragChange: (dragging: boolean) => void
  onTouch: () => void
}

/** 드래그 / 스와이프로 벽을 돌린다. */
export function usePointerRotation(engine: RotationEngine, { locked, onDragChange, onTouch }: Options) {
  const { roomRef, headingRef, step, paint, settle, cancelSettle } = engine

  useEffect(() => {
    const el = roomRef.current?.closest('.stage') as HTMLElement | null
    if (!el || locked) return

    let id: number | null = null
    let startX = 0
    let startHeading = 0
    let lastX = 0
    let lastT = 0
    let velocity = 0
    let moved = false

    const perPx = () => step / Math.max(240, window.innerWidth * 0.42)

    const down = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return
      if ((e.target as HTMLElement).closest('[data-nodrag]')) return
      id = e.pointerId
      startX = lastX = e.clientX
      startHeading = headingRef.current
      lastT = e.timeStamp
      velocity = 0
      moved = false
      cancelSettle()
    }

    const move = (e: PointerEvent) => {
      if (id !== e.pointerId) return
      const dx = e.clientX - startX
      if (!moved && Math.abs(dx) > 4) {
        moved = true
        onDragChange(true)
        onTouch()
        el.setPointerCapture(e.pointerId)
      }
      if (!moved) return
      const dt = Math.max(1, e.timeStamp - lastT)
      velocity = (e.clientX - lastX) / dt
      lastX = e.clientX
      lastT = e.timeStamp
      // 손으로 벽을 잡아 미는 방향과 같은 방향으로 돈다: 오른쪽으로 끌면
      // 다음 벽(오른쪽 화살표/키와 같은 방향)이 들어온다.
      paint(startHeading + dx * perPx())
    }

    const up = (e: PointerEvent) => {
      if (id !== e.pointerId) return
      id = null
      if (!moved) return
      onDragChange(false)
      const delta = headingRef.current - startHeading
      const base = Math.round(startHeading / step) * step
      let target = Math.round(headingRef.current / step) * step
      const flick = Math.abs(velocity) > 0.45
      if (flick || (target === base && Math.abs(delta) > step * 0.18)) {
        // move() 와 같은 부호여야 한다 — 빠르게 훑을 때도 느리게 끌 때와
        // 같은 방향으로 넘어가야 하므로.
        const dir = flick ? Math.sign(velocity) : Math.sign(delta)
        target = base + dir * step
      }
      settle(target)
    }

    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
    }
  }, [locked, roomRef, headingRef, step, paint, settle, cancelSettle, onDragChange, onTouch])
}
