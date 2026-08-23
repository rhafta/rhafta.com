import type { Wall } from '../../data/types'
import { BrandIcon } from '../Icons'
import { ExternalLink } from '../ExternalLink'
import { WallTag } from './WallTag'

type HallWallData = Extract<Wall, { kind: 'hall' }>

export function HallWall({ wall }: { wall: HallWallData }) {
  return (
    <div className="wall__inner wall__inner--hall">
      <div className="wall__tagline-row">
        <WallTag wall={wall} />
      </div>
      <div className="hall">
        <p className="hall__eyebrow">welcome to</p>
        <h1 className="hall__name">{wall.title}</h1>
        <p className="hall__tagline">{wall.tagline}</p>
        <div className="hall__rule" aria-hidden="true" />
        <p className="hall__intro">{wall.intro}</p>
        <ul className="marks">
          {wall.links.map((l) => (
            <li key={l.label}>
              <ExternalLink
                className="mark-link"
                href={l.href}
                data-nodrag
                aria-label={l.hint ? `${l.label} — ${l.hint}` : l.label}
                title={l.label}
              >
                <BrandIcon label={l.label} />
              </ExternalLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
