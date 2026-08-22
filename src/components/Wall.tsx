import type { Artwork, Wall as WallData } from '../data/types'
import { ContactWall } from './walls/ContactWall'
import { GalleryWall } from './walls/GalleryWall'
import { HallWall } from './walls/HallWall'
import { TextWall } from './walls/TextWall'

type Props = {
  wall: WallData
  onOpen: (item: Artwork) => void
}

/** 벽의 kind 에 따라 알맞은 벽 컴포넌트로 위임한다. */
export function WallContent({ wall, onOpen }: Props) {
  switch (wall.kind) {
    case 'hall':
      return <HallWall wall={wall} />
    case 'gallery':
      return <GalleryWall wall={wall} onOpen={onOpen} />
    case 'text':
      return <TextWall wall={wall} />
    case 'contact':
      return <ContactWall wall={wall} />
    default: {
      // 새 kind 를 추가하고 여기를 처리하지 않으면 컴파일 에러가 난다.
      const exhaustive: never = wall
      throw new Error(`처리되지 않은 벽 종류: ${JSON.stringify(exhaustive)}`)
    }
  }
}
