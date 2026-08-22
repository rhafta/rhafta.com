import { useCallback, useEffect, useRef, useState } from 'react'

/** 화면 크기에 따른 전시관 치수 */
export type RoomMetrics = {
  compact: boolean
  /** 벽 하나의 설계 폭(px) — 항상 고정 */
  wallW: number
  /** 벽 높이(px) */
  wallH: number
  /** 방 중심에서 벽까지의 거리 */
  apothem: number
  /** 방 중심에서 눈까지의 거리(뒤로 물러선 정도) */
  eye: number
  /** 전체 축척 */
  scale: number
  /** 화면에 실제로 보이는 벽의 비율 (0-1) */
  visible: number
}

const WALL_W = 1120
const RATIO = 0.8660254 // √3 / 2 — 정육각형의 변 길이 대비 apothem

function measure(): RoomMetrics {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const compact = vw < 880

  // 좁은 화면에서는 방을 세로로 길게 세워 화면 비율에 맞춘다
  const wallH = compact
    ? Math.min(1900, Math.max(700, WALL_W * (vh / vw) * 1.05))
    : 780

  // 어떤 화면에서도 벽 한 면이 화면 안에 다 들어오게 — 그래야 방이 보인다
  // 세로 비율을 조금 줄여 벽 위(천장)와 아래(바닥)가 함께 보이게 한다
  const scale = compact
    ? Math.min((vw * 0.94) / WALL_W, (vh * 0.84) / wallH)
    : Math.min((vw * 0.76) / WALL_W, (vh * 0.86) / wallH, 1.2)

  return {
    compact,
    wallW: WALL_W,
    wallH,
    apothem: WALL_W * RATIO,
    eye: WALL_W * RATIO * 0.5,
    scale,
    visible: Math.min(1, vw / (WALL_W * scale)),
  }
}

export function useMetrics(): RoomMetrics {
  const [m, setM] = useState<RoomMetrics>(() =>
    typeof window === 'undefined'
      ? {
          compact: false,
          wallW: WALL_W,
          wallH: 780,
          apothem: WALL_W * RATIO,
          eye: WALL_W * RATIO * 0.5,
          scale: 1,
          visible: 0.8,
        }
      : measure(),
  )

  useEffect(() => {
    let raf = 0
    const onResize = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setM(measure()))
    }
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
    }
  }, [])

  return m
}

type Options = {
  count: number
  /** 상세 화면 등이 열려 있으면 조작을 막는다 */
  locked?: boolean
}

/**
 * 전시관을 좌우로 돌리는 조작계.
 * heading(도)은 연속값이고, 벽 i 는 heading = i * step 에서 정면에 온다.
 */
export function useRoom({ count, locked = false }: Options) {
  const step = 360 / count
  const roomRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef(0)
  const [index, setIndex] = useState(0)
  const [turning, setTurning] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [touched, setTouched] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  const paint = useCallback((deg: number) => {
    headingRef.current = deg
    roomRef.current?.style.setProperty('--heading', `${deg}deg`)
  }, [])

  const settle = useCallback(
    (deg: number) => {
      const el = roomRef.current
      if (el) el.classList.add('is-turning')
      setTurning(true)
      paint(deg)
      const i = ((Math.round(deg / step) % count) + count) % count
      setIndex(i)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => {
        roomRef.current?.classList.remove('is-turning')
        setTurning(false)
        // 각도가 무한히 커지지 않도록 정규화
        const norm = i * step
        if (Math.abs(headingRef.current - norm) > 0.01) paint(norm)
      }, 900)
    },
    [count, paint, step],
  )

  const turn = useCallback(
    (dir: number) => settle(Math.round(headingRef.current / step) * step + dir * step),
    [settle, step],
  )

  const goTo = useCallback(
    (i: number) => {
      const current = headingRef.current
      const delta = (((i * step - current) % 360) + 540) % 360 - 180
      settle(current + delta)
    },
    [settle, step],
  )

  /* 드래그 / 스와이프 */
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
      window.clearTimeout(timer.current)
      roomRef.current?.classList.remove('is-turning')
      setTurning(false)
    }

    const move = (e: PointerEvent) => {
      if (id !== e.pointerId) return
      const dx = e.clientX - startX
      if (!moved && Math.abs(dx) > 4) {
        moved = true
        setDragging(true)
        setTouched(true)
        el.setPointerCapture(e.pointerId)
      }
      if (!moved) return
      const dt = Math.max(1, e.timeStamp - lastT)
      velocity = (e.clientX - lastX) / dt
      lastX = e.clientX
      lastT = e.timeStamp
      paint(startHeading - dx * perPx())
    }

    const up = (e: PointerEvent) => {
      if (id !== e.pointerId) return
      id = null
      if (!moved) return
      setDragging(false)
      const delta = headingRef.current - startHeading
      const base = Math.round(startHeading / step) * step
      let target = Math.round(headingRef.current / step) * step
      const flick = Math.abs(velocity) > 0.45
      if (flick || (target === base && Math.abs(delta) > step * 0.18)) {
        const dir = flick ? -Math.sign(velocity) : Math.sign(delta)
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
  }, [locked, paint, settle, step])

  /* 휠 / 트랙패드 */
  useEffect(() => {
    if (locked) return
    let cooling = false
    const onWheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement).closest('[data-scroll]')) return
      const amount = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      if (Math.abs(amount) < 8 || cooling) return
      cooling = true
      setTouched(true)
      turn(Math.sign(amount))
      window.setTimeout(() => (cooling = false), 620)
    }
    window.addEventListener('wheel', onWheel, { passive: true })
    return () => window.removeEventListener('wheel', onWheel)
  }, [locked, turn])

  /* 키보드 */
  useEffect(() => {
    if (locked) return
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'ArrowRight') {
        setTouched(true)
        turn(1)
      } else if (e.key === 'ArrowLeft') {
        setTouched(true)
        turn(-1)
      } else if (/^[1-9]$/.test(e.key)) {
        const i = Number(e.key) - 1
        if (i < count) {
          setTouched(true)
          goTo(i)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [count, goTo, locked, turn])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  return { roomRef, index, turn, goTo, turning, dragging, touched }
}
