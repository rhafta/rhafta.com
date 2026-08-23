import type { Wall } from '../../data/types'

/** 벽 좌상단에 붙는 전시실 표지 — 번호 / 이름. 모든 벽 종류가 공유한다. */
export function WallTag({ wall }: { wall: Wall }) {
  return (
    <header className="wall__tag">
      <span className="wall__no">{wall.no}</span>
      <span className="wall__tag-rule" aria-hidden="true" />
      <span className="wall__name">{wall.name}</span>
    </header>
  )
}
