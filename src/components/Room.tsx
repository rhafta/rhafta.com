import { useEffect, type CSSProperties, type RefObject } from 'react'
import { settings, type Artwork, type Wall as WallData } from '../data/gallery'
import type { RoomMetrics } from '../hooks/useRoom'
import { WallContent } from './Wall'

type Props = {
  walls: WallData[]
  metrics: RoomMetrics
  index: number
  roomRef: RefObject<HTMLDivElement | null>
  onOpen: (item: Artwork) => void
}

export function Room({ walls, metrics, index, roomRef, onOpen }: Props) {
  const n = walls.length
  const sector = 360 / n

  /* 정 n각형 기하 — 벽 개수를 바꾸면 방 모양이 그대로 따라온다.
     af: 중심→벽면 거리 / 벽폭,  rf: 중심→꼭짓점 거리 / 벽폭 */
  const af = 1 / (2 * Math.tan(Math.PI / n))
  const rf = 1 / (2 * Math.sin(Math.PI / n))

  /* 바닥·천장용 정 n각형 클립 패스 (한 변이 정면 벽과 평행하게) */
  const polygon = Array.from({ length: n }, (_, k) => {
    const phi = ((2 * k + 1) * Math.PI) / n
    return `${(50 + 50 * Math.sin(phi)).toFixed(3)}% ${(50 - 50 * Math.cos(phi)).toFixed(3)}%`
  }).join(', ')

  const vars = {
    '--s': metrics.scale,
    '--wall-h-raw': `${metrics.wallH}px`,
    '--sector': `${sector}deg`,
    '--af': af,
    '--rf': rf,
    '--col': `${Math.min(90, metrics.visible * 88).toFixed(2)}%`,
    '--boost': 1,
  } as CSSProperties

  /* 마우스 위치에 따라 시선이 아주 살짝 따라 움직인다 */
  useEffect(() => {
    if (metrics.compact) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const stage = roomRef.current?.closest('.stage') as HTMLElement | null
    if (!stage) return
    let raf = 0
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2
        const y = (e.clientY / window.innerHeight - 0.5) * 2
        stage.style.setProperty('--px', `${50 + x * 6}%`)
        stage.style.setProperty('--py', `${50 + y * 5}%`)
      })
    }
    window.addEventListener('pointermove', onMove)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
    }
  }, [metrics.compact, roomRef])

  return (
    <div className="stage" style={vars}>
      <div className="room" ref={roomRef}>
        <div
          className="surface surface--floor"
          style={{ clipPath: `polygon(${polygon})` }}
          aria-hidden="true"
        >
          <span className="surface__sheen" />
          <span className="surface__pool" />
        </div>
        <div
          className="surface surface--ceiling"
          style={{ clipPath: `polygon(${polygon})` }}
          aria-hidden="true"
        >
          <span className="surface__vault" />
          <span className="surface__cove" />
        </div>

        {walls.map((wall, i) => {
          const active = i === index
          return (
            <section
              key={wall.id}
              id={`wall-${wall.id}`}
              className="wall"
              style={{ '--i': i } as CSSProperties}
              data-active={active || undefined}
              inert={!active}
            >
              <span className="wall__wash" aria-hidden="true" />
              <span className="wall__track" aria-hidden="true">
                {Array.from({ length: settings.lampsPerWall ?? 3 }, (_, n) => (
                  <span className="wall__lamp" key={n} />
                ))}
              </span>
              <WallContent wall={wall} onOpen={onOpen} />
              <span className="wall__base" aria-hidden="true" />
            </section>
          )
        })}
      </div>
    </div>
  )
}
