import type { Wall } from '../../data/types'

/** 벽 좌상단에 붙는 번호 + 이름표. 모든 벽 종류가 공유한다. */
export function WallTag({ wall }: { wall: Wall }) {
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
