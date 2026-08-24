import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * 회전의 핵심 상태 엔진.
 *
 * heading(도)은 연속값이고, 벽 i 는 heading = i * step 에서 정면에 온다.
 * heading 자체는 React state 가 아니라 DOM 커스텀 프로퍼티(--heading)에
 * 직접 써서(paint) 매 프레임 리렌더 없이 CSS 트랜지션으로 돌아가게 한다.
 * `index`(정수, 몇 번째 벽인지)만 React state 로 승격해 UI가 구독한다.
 *
 * 포인터/휠/키보드 등 실제 입력 처리는 각각 별도 훅(usePointerRotation 등)이
 * 맡고, 이 훅이 반환하는 엔진을 통해 heading 을 움직인다.
 */
export function useRotationState(count: number, turnMs: number) {
  const step = 360 / count
  /* is-turning 을 뗄 때까지 기다리는 시간. CSS 쪽 회전 트랜지션(--turn)보다
     항상 넉넉히 길어야 한다 — 짧으면 트랜지션이 끝나기 전에 클래스가
     빠지면서 회전이 목표 각도 전에 얼어붙는다. */
  const settleMs = turnMs + 80
  const roomRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef(0)
  const [index, setIndex] = useState(0)
  const timer = useRef<number | undefined>(undefined)

  const paint = useCallback((deg: number) => {
    headingRef.current = deg
    roomRef.current?.style.setProperty('--heading', `${deg}deg`)
  }, [])

  /** 진행 중인 정착 애니메이션(및 그 타이머)을 즉시 멈춘다 — 새 드래그가 시작될 때 등. */
  const cancelSettle = useCallback(() => {
    window.clearTimeout(timer.current)
    roomRef.current?.classList.remove('is-turning')
  }, [])

  /** heading 을 deg 로 부드럽게 돌리고, 가장 가까운 벽에 도착하면 정지한다. */
  const settle = useCallback(
    (deg: number) => {
      roomRef.current?.classList.add('is-turning')
      paint(deg)
      const i = ((Math.round(deg / step) % count) + count) % count
      setIndex(i)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => {
        roomRef.current?.classList.remove('is-turning')
        // 각도가 무한히 커지지 않도록 정규화
        const norm = i * step
        if (Math.abs(headingRef.current - norm) > 0.01) paint(norm)
      }, settleMs)
    },
    [count, paint, settleMs, step],
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

  useEffect(() => () => window.clearTimeout(timer.current), [])

  return { roomRef, headingRef, step, index, paint, settle, cancelSettle, turn, goTo }
}

export type RotationEngine = ReturnType<typeof useRotationState>
