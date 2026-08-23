import { useEffect, useRef } from 'react'
import type { Artwork } from '../data/types'
import { paint } from '../lib/art'
import { formatMeta } from '../lib/format'
import { ExternalLink } from './ExternalLink'

type Props = {
  item: Artwork | null
  onClose: () => void
}

export function Detail({ item, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const returnTo = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!item) return
    returnTo.current = document.activeElement as HTMLElement
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      returnTo.current?.focus?.()
    }
  }, [item, onClose])

  if (!item) return null

  return (
    <div className="detail" role="dialog" aria-modal="true" aria-label={item.title}>
      <button type="button" className="detail__scrim" onClick={onClose} aria-label="닫기" data-nodrag />
      <article className="detail__card" data-scroll data-nodrag>
        <div className="detail__art" data-ratio={item.ratio ?? 'landscape'}>
          {item.image ? (
            <img src={item.image} alt={item.title} decoding="async" />
          ) : (
            <span className="detail__canvas" style={paint(item.tone, item.pattern)} />
          )}
        </div>
        <div className="detail__body">
          <button ref={closeRef} type="button" className="detail__close" onClick={onClose}>
            Close <span aria-hidden="true">✕</span>
          </button>
          <h2 className="detail__title">{item.title}</h2>
          <p className="detail__meta">{formatMeta(item.medium, item.year)}</p>
          {item.tags && (
            <ul className="detail__tags">
              {item.tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          )}
          {item.body && <p className="detail__text">{item.body}</p>}
          {item.links && (
            <ul className="detail__links">
              {item.links.map((l) => (
                <li key={l.label}>
                  <ExternalLink href={l.href}>
                    {l.label}
                    <span aria-hidden="true">↗</span>
                  </ExternalLink>
                </li>
              ))}
            </ul>
          )}
        </div>
      </article>
    </div>
  )
}
