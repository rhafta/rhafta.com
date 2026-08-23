import { useEffect } from 'react'

type Options = {
  locked: boolean
  onTouch: () => void
}

/** 마우스 휠 / 트랙패드로 벽을 돌린다. */
export function useWheelRotation(turn: (dir: number) => void, { locked, onTouch }: Options) {
  useEffect(() => {
    if (locked) return
    let cooling = false
    const onWheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement).closest('[data-scroll]')) return
      const amount = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      if (Math.abs(amount) < 8 || cooling) return
      cooling = true
      onTouch()
      turn(Math.sign(amount))
      window.setTimeout(() => (cooling = false), 620)
    }
    window.addEventListener('wheel', onWheel, { passive: true })
    return () => window.removeEventListener('wheel', onWheel)
  }, [locked, turn, onTouch])
}
