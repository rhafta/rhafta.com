import { useEffect } from 'react'

type Options = {
  locked: boolean
  count: number
  turn: (dir: number) => void
  goTo: (i: number) => void
  onTouch: () => void
}

/** ← → 로 옆 벽을, 숫자 1~9 로 해당 벽을 바로 본다. */
export function useKeyboardRotation({ locked, count, turn, goTo, onTouch }: Options) {
  useEffect(() => {
    if (locked) return
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'ArrowRight') {
        onTouch()
        turn(1)
      } else if (e.key === 'ArrowLeft') {
        onTouch()
        turn(-1)
      } else if (/^[1-9]$/.test(e.key)) {
        const i = Number(e.key) - 1
        if (i < count) {
          onTouch()
          goTo(i)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [locked, count, turn, goTo, onTouch])
}
