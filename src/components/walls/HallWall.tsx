import type { Wall } from '../../data/types'
import { BrandIcon } from '../Icons'
import { ExternalLink } from '../ExternalLink'
import { WallTag } from './WallTag'

type HallWallData = Extract<Wall, { kind: 'hall' }>

export function HallWall({ wall }: { wall: HallWallData }) {
  return (
    <div className="wall__inner">
      <WallTag wall={wall} />
      <div className="hall">
        <p className="hall__eyebrow">welcome to</p>
        <h1 className="hall__name">{wall.title}</h1>
        <p className="hall__tagline">{wall.tagline}</p>
        <div className="hall__rule" aria-hidden="true" />
        <p className="hall__intro">{wall.intro}</p>
      </div>
      {/* 링크를 탁상 위에 놓인 명패처럼 — 방 자체의 원근/입체 문법을 그대로 쓴다 */}
      <div className="desk">
        <div className="desk__scene">
          <div className="desk__top" aria-hidden="true" />
          <ul className="desk__items">
            {wall.links.map((l) => (
              <li key={l.label} className="desk__card">
                <ExternalLink
                  className="desk__hit"
                  href={l.href}
                  data-nodrag
                  aria-label={l.hint ? `${l.label} — ${l.hint}` : l.label}
                  title={l.label}
                >
                  <span className="desk__icon">
                    <BrandIcon label={l.label} />
                  </span>
                  <span className="desk__label">{l.label}</span>
                </ExternalLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
