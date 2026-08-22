import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import { Chrome } from './components/Chrome'
import { Detail } from './components/Detail'
import { Room } from './components/Room'
import { settings, walls, type Artwork } from './data/gallery'
import { useMetrics, useRoom } from './hooks/useRoom'

/**
 * 라이트(주간) 모드 스위치.
 * 지금은 야간 모드만 공개한다. 되돌리고 싶으면 false 로 바꾸면
 * 헤더의 조명 토글과 주간 팔레트가 다시 살아난다. (CSS 는 그대로 남아 있음)
 */
const NIGHT_ONLY = true

export default function App() {
  const metrics = useMetrics()
  const [detail, setDetail] = useState<Artwork | null>(null)
  const [entered, setEntered] = useState(false)
  const [night, setNight] = useState(NIGHT_ONLY)

  const { roomRef, index, turn, goTo, dragging, touched } = useRoom({
    count: walls.length,
    locked: detail !== null,
  })

  /* 조명 상태 기억 (야간 전용일 때는 항상 야간) */
  useEffect(() => {
    if (NIGHT_ONLY) return
    const saved = localStorage.getItem('rhafta:lights')
    if (saved) setNight(saved === 'night')
  }, [])

  const toggleNight = useCallback(() => {
    setNight((v) => {
      localStorage.setItem('rhafta:lights', v ? 'day' : 'night')
      return !v
    })
  }, [])

  /* 입장 — 문이 열리듯 방 안으로 들어간다 */
  useEffect(() => {
    const t = window.setTimeout(() => setEntered(true), 80)
    return () => window.clearTimeout(t)
  }, [])

  /* 주소창에 현재 전시실을 남긴다 */
  useEffect(() => {
    const id = walls[index]?.id
    if (id && window.location.hash.slice(1) !== id) {
      window.history.replaceState(null, '', `#${id}`)
    }
  }, [index])

  /* 링크로 들어온 경우 해당 벽에서 시작 */
  useEffect(() => {
    const id = window.location.hash.slice(1)
    const i = walls.findIndex((w) => w.id === id)
    if (i > 0) goTo(i)
    // 최초 1회만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* gallery.ts 의 settings 를 화면 전체에 적용 */
  const themeVars = {
    '--brass': settings.accent ?? '#c99a4e',
    '--brass-hi': settings.accentBright ?? '#eec987',
    '--glow': settings.lightIntensity ?? 1,
    '--turn': `${settings.turnMs ?? 820}ms`,
  } as CSSProperties

  return (
    <div
      className="app"
      style={themeVars}
      data-mood={settings.mood ?? 'warm'}
      data-mode={NIGHT_ONLY || night ? 'night' : 'day'}
      data-entered={entered || undefined}
      data-dragging={dragging || undefined}
      data-compact={metrics.compact || undefined}
    >
      <div className="app__grain" aria-hidden="true" />
      <Room walls={walls} metrics={metrics} index={index} roomRef={roomRef} onOpen={setDetail} />
      <Chrome
        walls={walls}
        index={index}
        night={NIGHT_ONLY || night}
        modeToggle={!NIGHT_ONLY}
        touched={touched}
        compact={metrics.compact}
        onTurn={turn}
        onGoTo={goTo}
        onToggleNight={toggleNight}
      />
      <Detail item={detail} onClose={() => setDetail(null)} />
    </div>
  )
}
