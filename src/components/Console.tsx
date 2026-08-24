import type { CSSProperties } from 'react'
import type { Wall } from '../data/types'
import { ExternalLink } from './ExternalLink'
import { BrandIcon } from './Icons'

type HallWallData = Extract<Wall, { kind: 'hall' }>

type Props = {
  wall: HallWallData
  /** 이 가구가 붙어 있는 벽의 번호 — 벽과 같은 각도로 세워진다 */
  index: number
  active: boolean
}

/**
 * 홀 벽에 달린 선반.
 *
 * 벽에 그린 그림이 아니라 방 안에 실제로 붙어 있는 물건이다. 그래서 벽 안이
 * 아니라 `.room`(preserve-3d) 바로 아래에 형제로 놓이고, 상판과 앞면을 각각
 * 제 위치에 세워 만든다. 벽과 같은 원근을 타고, 방을 돌리면 함께 돈다.
 */
export function Console({ wall, index, active }: Props) {
  return (
    <div
      className="console"
      style={{ '--i': index } as CSSProperties}
      data-active={active || undefined}
      inert={!active}
    >
      <span className="console__cast" aria-hidden="true" />
      <span className="console__apron" aria-hidden="true" />
      <span className="console__top" aria-hidden="true" />
      <ul className="console__items">
        {wall.links.map((l) => (
          <li key={l.label} className="placard">
            <ExternalLink
              className="placard__hit"
              href={l.href}
              data-nodrag
              aria-label={l.hint ? `${l.label} — ${l.hint}` : l.label}
              title={l.label}
            >
              <span className="placard__plate">
                <BrandIcon label={l.label} />
              </span>
            </ExternalLink>
          </li>
        ))}
      </ul>
    </div>
  )
}
