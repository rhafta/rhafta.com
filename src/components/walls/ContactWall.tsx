import type { Wall } from '../../data/types'
import { ExternalLink } from '../ExternalLink'
import { WallTag } from './WallTag'

type ContactWallData = Extract<Wall, { kind: 'contact' }>

export function ContactWall({ wall }: { wall: ContactWallData }) {
  return (
    <div className="wall__inner wall__inner--contact">
      <WallTag wall={wall} />
      <div className="wall__lead">
        <h2 className="wall__title">{wall.title}</h2>
        <p className="wall__intro">{wall.intro}</p>
      </div>
      <div className="brass">
        <span className="brass__lamp" aria-hidden="true" />
        <p className="brass__note">{wall.note}</p>
        <ul className="brass__links">
          {wall.links.map((l) => (
            <li key={l.label}>
              <ExternalLink className="brass__link" href={l.href} data-nodrag>
                <span className="brass__hint">{l.hint}</span>
                <span className="brass__label">{l.label}</span>
              </ExternalLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
