import type { Wall } from '../../data/types'
import { WallTag } from './WallTag'

type HallWallData = Extract<Wall, { kind: 'hall' }>

/**
 * 홀 벽면. 링크는 이 벽이 아니라 벽 앞에 놓인 콘솔 테이블(Console)에
 * 얹혀 있다 — 가구는 벽면이 아니라 방 안의 물건이라 3D 계층이 다르다.
 */
export function HallWall({ wall }: { wall: HallWallData }) {
  return (
    <div className="wall__inner">
      <WallTag wall={wall} />
      <div className="hall">
        <p className="hall__eyebrow">welcome to</p>
        <h1 className="hall__name">{wall.title}</h1>
        <p className="hall__tagline">{wall.tagline}</p>
        <div className="hall__rule" aria-hidden="true" />
        <p className="hall__intro">{wall.intro}</p>
      </div>
    </div>
  )
}
