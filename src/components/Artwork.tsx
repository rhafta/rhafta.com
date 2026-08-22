import type { CSSProperties } from 'react'
import type { Artwork } from '../data/gallery'
import { paint } from '../lib/art'

type Props = {
  item: Artwork
  onOpen: (item: Artwork) => void
  /** 살롱 배치에서 위아래로 어긋나게 거는 정도 */
  offset?: number
}

export function Frame({ item, onOpen, offset = 0 }: Props) {
  const style = {
    '--scale': item.scale ?? 1,
    '--offset': offset,
    '--tone': item.tone ?? 30,
  } as CSSProperties

  return (
    <figure
      className="art"
      style={style}
      data-ratio={item.ratio ?? 'landscape'}
      data-frame={item.frame ?? 'dark'}
      data-nomat={item.mat === false || undefined}
    >
      <button
        type="button"
        className="art__hit"
        data-nodrag
        onClick={() => onOpen(item)}
        aria-label={`${item.title} 자세히 보기`}
      >
        <span className="art__lamp" aria-hidden="true" />
        <span className="art__frame">
          <span className="art__mat">
            {item.image ? (
              <img className="art__canvas" src={item.image} alt={item.title} loading="lazy" />
            ) : (
              <span className="art__canvas" style={paint(item.tone, item.pattern)} aria-hidden="true" />
            )}
            <span className="art__glass" aria-hidden="true" />
          </span>
        </span>
      </button>
      {item.plate !== false && (
        <figcaption className="plate">
          <span className="plate__title">{item.title}</span>
          <span className="plate__meta">
            {[item.medium, item.year].filter(Boolean).join('  ·  ')}
          </span>
        </figcaption>
      )}
    </figure>
  )
}
