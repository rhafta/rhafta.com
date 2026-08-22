import type { Artwork, Wall as WallData } from '../data/gallery'
import { Frame } from './Artwork'
import { BrandIcon } from './Icons'

type Props = {
  wall: WallData
  onOpen: (item: Artwork) => void
}

function Tag({ wall }: { wall: WallData }) {
  return (
    <header className="wall__tag">
      <span className="wall__no">{wall.no}</span>
      <span className="wall__names">
        <span className="wall__name">{wall.name}</span>
        <span className="wall__name-ko">{wall.nameKo}</span>
      </span>
    </header>
  )
}

export function WallContent({ wall, onOpen }: Props) {
  if (wall.kind === 'hall') {
    return (
      <div className="wall__inner wall__inner--hall">
        <div className="wall__tagline-row">
          <Tag wall={wall} />
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
                <a
                  className="mark-link"
                  href={l.href}
                  target={l.href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                  data-nodrag
                  aria-label={l.hint ? `${l.label} — ${l.hint}` : l.label}
                  title={l.label}
                >
                  <BrandIcon label={l.label} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  if (wall.kind === 'gallery') {
    return (
      <div className="wall__inner">
        <Tag wall={wall} />
        <div className="wall__lead">
          <h2 className="wall__title">{wall.title}</h2>
          <p className="wall__intro">{wall.intro}</p>
        </div>
        <div className={`hang hang--${wall.layout}`}>
          {wall.items.map((item, i) => (
            <Frame
              key={item.id}
              item={item}
              onOpen={onOpen}
              offset={wall.layout === 'salon' ? [0, -4, 3, -2][i % 4] : 0}
            />
          ))}
        </div>
      </div>
    )
  }

  if (wall.kind === 'text') {
    return (
      <div className="wall__inner">
        <Tag wall={wall} />
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

  return (
    <div className="wall__inner wall__inner--contact">
      <Tag wall={wall} />
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
              <a
                className="brass__link"
                href={l.href}
                target={l.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                data-nodrag
              >
                <span className="brass__hint">{l.hint}</span>
                <span className="brass__label">{l.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
