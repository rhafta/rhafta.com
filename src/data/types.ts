/**
 * ─────────────────────────────────────────────────────────────
 *  전시관 스키마 (Gallery schema)
 * ─────────────────────────────────────────────────────────────
 *  실제 콘텐츠는 이 파일이 아니라 `content.ts` 에 있습니다.
 *  이 파일은 "무엇을 적을 수 있는가"의 사전(타입 정의)만 담습니다.
 * ─────────────────────────────────────────────────────────────
 */

/** ─── 사이트 전역 설정 ──────────────────────────────────────
 *  전부 선택 사항입니다. 지우면 기본값이 쓰입니다.
 */
export type SiteSettings = {
  /** 벽 색감 프리셋 — 'warm'(따뜻한 갈색) | 'neutral'(회색) | 'cool'(푸른 회색) */
  mood?: 'warm' | 'neutral' | 'cool'
  /** 강조색(명패·포인트). CSS 색상 아무거나 */
  accent?: string
  /** 강조색의 밝은 버전 (hover 등) */
  accentBright?: string
  /** 조명 밝기 0.4 ~ 1.2 (1 = 기본) */
  lightIntensity?: number
  /** 벽마다 달리는 레일 조명 개수 (2~4 권장) */
  lampsPerWall?: number
  /** 벽 한 면을 도는 데 걸리는 시간 ms */
  turnMs?: number
  /** 하단 안내 문구 */
  hintDesktop?: string
  hintMobile?: string
}

export type LinkItem = {
  label: string
  href: string
  /** 명패 아래 작게 새겨지는 설명 */
  hint?: string
}

export type Artwork = {
  id: string
  title: string
  /** 명패 두 번째 줄 — 재료(기술 스택)나 장소 */
  medium?: string
  year?: string
  /** 상세 화면 본문 */
  body?: string
  links?: LinkItem[]
  /** '/art/foo.jpg' — 없으면 추상 회화가 자동 생성됩니다 */
  image?: string
  /** 자동 생성 회화의 색상 (0-360) */
  tone?: number
  /** 자동 생성 회화의 무늬 (0-5) */
  pattern?: number
  ratio?: 'portrait' | 'landscape' | 'square'
  /** 살롱 배치에서의 크기 가중치 */
  scale?: number
  tags?: string[]
  /** 액자 스타일 — 'dark'(기본, 짙은 원목) | 'gilded'(금박) | 'light'(밝은 목재) | 'thin'(얇은 검정) */
  frame?: 'dark' | 'gilded' | 'light' | 'thin'
  /** 매트(그림 둘레 흰 여백)를 뺄지 — false 면 그림이 액자에 꽉 찬다 */
  mat?: boolean
  /** 작품 명패를 숨길지 */
  plate?: boolean
}

/** 모든 벽 종류가 공통으로 갖는 필드 */
type WallBase = {
  id: string
  /** 벽 번호 — '00', '01' ... */
  no: string
  name: string
  nameKo: string
  title: string
  intro: string
}

export type Wall =
  | (WallBase & {
      kind: 'hall'
      tagline: string
      links: LinkItem[]
    })
  | (WallBase & {
      kind: 'gallery'
      /** 'row' 한 줄 | 'salon' 들쭉날쭉 살롱 | 'grid' 격자 | 'single' 대형 한 점 */
      layout: 'row' | 'salon' | 'grid' | 'single'
      items: Artwork[]
    })
  | (WallBase & {
      kind: 'text'
      sections: { heading: string; lines: string[] }[]
    })
  | (WallBase & {
      kind: 'contact'
      note: string
      links: LinkItem[]
    })

export type WallKind = Wall['kind']
