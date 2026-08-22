import type { Wall } from '../../data/types'
import { WallTag } from './WallTag'

type TextWallData = Extract<Wall, { kind: 'text' }>

export function TextWall({ wall }: { wall: TextWallData }) {
  return (
    <div className="wall__inner">
      <WallTag wall={wall} />
      <div className="wall__lead">
        <h2 className="wall__title">{wall.title}</h2>
        <p className="wall__intro">{wall.intro}</p>
      </div>
      <div className="panel">
        <span className="panel__lamp" aria-hidden="true" />
        <div className="panel__body">
          {wall.sections.map((s) => (
            <section className="panel__col" key={s.heading}>
              <h3 className="panel__heading">{s.heading}</h3>
              <ul className="panel__list">
                {s.lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
