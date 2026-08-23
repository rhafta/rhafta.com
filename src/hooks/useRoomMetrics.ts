import { useEffect, useState } from 'react'

/** 화면 크기에 따른 전시관 치수 */
export type RoomMetrics = {
  compact: boolean
  /** 벽 높이(px, 설계 기준) */
  wallH: number
  /** 전체 축척 */
  scale: number
  /** 화면에 실제로 보이는 벽의 비율 (0-1) */
  visible: number
}

const WALL_W = 1120

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
    wallH,
    scale,
    visible: Math.min(1, vw / (WALL_W * scale)),
  }
}

const FALLBACK_METRICS: RoomMetrics = { compact: false, wallH: 780, scale: 1, visible: 0.8 }

export function useMetrics(): RoomMetrics {
  const [m, setM] = useState<RoomMetrics>(() =>
    typeof window === 'undefined' ? FALLBACK_METRICS : measure(),
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
