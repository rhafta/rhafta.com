import type { Wall } from '../data/types'
import { curator, settings } from '../data/content'

type Props = {
  walls: Wall[]
  index: number
  night: boolean
  /** 주간/야간 토글 노출 여부 — 야간 전용 운영 중엔 숨긴다 */
  modeToggle: boolean
  touched: boolean
  compact: boolean
  onTurn: (dir: number) => void
  onGoTo: (i: number) => void
  onToggleNight: () => void
}

export function Chrome({
  walls,
  index,
  night,
  modeToggle,
  touched,
  compact,
  onTurn,
  onGoTo,
  onToggleNight,
}: Props) {
  const current = walls[index]

  return (
    <>
      <header className="topbar">
        <a className="mark" href="/" data-nodrag>
          <span className="mark__name">{curator.handle}</span>
          <span className="mark__sub">the gallery</span>
        </a>
        {modeToggle ? (
          <button
            type="button"
            className="lights"
            onClick={onToggleNight}
            data-nodrag
            aria-pressed={night}
            title={night ? '조명 켜기' : '조명 낮추기'}
          >
            <span className="lights__dot" aria-hidden="true" />
            {night ? '야간 개장' : '주간 개장'}
          </button>
        ) : (
          <span className="open-badge" title="상시 야간 개장">
            <span className="lights__dot" aria-hidden="true" />
            open
          </span>
        )}
      </header>

      <nav className="nav" aria-label="전시실 이동">
        <button type="button" className="nav__arrow" onClick={() => onTurn(-1)} data-nodrag aria-label="왼쪽 벽으로">
          <span aria-hidden="true">←</span>
        </button>

        <ol className="nav__list">
          {walls.map((w, i) => (
            <li key={w.id}>
              <button
                type="button"
                className="nav__item"
                data-current={i === index || undefined}
                data-nodrag
                onClick={() => onGoTo(i)}
                aria-current={i === index ? 'true' : undefined}
              >
                <span className="nav__no">{w.no}</span>
                <span className="nav__label">{w.name}</span>
              </button>
            </li>
          ))}
        </ol>

        <button type="button" className="nav__arrow" onClick={() => onTurn(1)} data-nodrag aria-label="오른쪽 벽으로">
          <span aria-hidden="true">→</span>
        </button>
      </nav>

      <p className="hint" data-hidden={touched || undefined} aria-hidden="true">
        {compact
          ? (settings.hintMobile ?? '옆으로 밀어 다음 벽을 보세요')
          : (settings.hintDesktop ?? '드래그하거나 ← → 키로 전시실을 둘러보세요')}
      </p>

      <p className="now" aria-live="polite">
        <span className="now__no">{current.no}</span>
        <span className="now__name">{current.name}</span>
      </p>
    </>
  )
}
