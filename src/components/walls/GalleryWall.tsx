import type { Artwork, Wall } from '../../data/types'
import { Frame } from '../Artwork'
import { WallTag } from './WallTag'

type GalleryWallData = Extract<Wall, { kind: 'gallery' }>

/** salon 배치에서 액자를 위아래로 어긋나게 거는 값 (4개 주기로 반복) */
const SALON_OFFSETS = [0, -4, 3, -2]

export function GalleryWall({
  wall,
  onOpen,
}: {
  wall: GalleryWallData
  onOpen: (item: Artwork) => void
}) {
  return (
    <div className="wall__inner">
      <WallTag wall={wall} />
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
            offset={wall.layout === 'salon' ? SALON_OFFSETS[i % SALON_OFFSETS.length] : 0}
          />
        ))}
      </div>
    </div>
  )
}
