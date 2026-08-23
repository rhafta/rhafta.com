/**
 * ─────────────────────────────────────────────────────────────
 *  전시 콘텐츠 (Exhibition content)
 * ─────────────────────────────────────────────────────────────
 *  이 파일만 고치면 사이트 전체가 바뀝니다. 코드는 건드릴 필요 없습니다.
 *  아래 내용은 구조를 보여주기 위한 "예시"이니 자유롭게 교체하세요.
 *  각 필드가 무엇을 뜻하는지는 `types.ts` 의 주석을 참고하세요.
 *
 *  - walls: 전시관의 벽. **배열에서 벽을 추가/삭제하면 방 모양 자체가
 *    바뀝니다** — 4면이면 정사각형 방, 5면이면 오각형, 8면이면 팔각형.
 *    (3면 이상이면 동작하고, 4~8면이 보기 좋습니다. 순서 = 도는 순서)
 *  - 각 벽의 kind 에 따라 렌더링 방식이 달라집니다.
 *      'hall'    : 닉네임 + 링크가 걸린 정면 홀
 *      'gallery' : 액자가 걸린 전시 벽
 *      'text'    : 벽에 새겨진 소개 글 패널
 *      'contact' : 방명록 / 연락처 명패
 *
 *  이미지는 public/art/ 에 넣고 image: '/art/파일명.jpg' 로 지정하면 됩니다.
 *  image 를 비워두면 tone(색상 각도) + pattern 으로 추상 회화가 자동 생성됩니다.
 * ─────────────────────────────────────────────────────────────
 */

import type { SiteSettings, Wall } from './types'

/** ─── 전역 설정 — 입맛대로 바꿔보세요 ───────────────────── */
export const settings: SiteSettings = {
  mood: 'warm',
  accent: '#d9a441',
  accentBright: '#f2c66d',
  lightIntensity: 1,
  lampsPerWall: 3,
  turnMs: 820,
  hintDesktop: '드래그하거나 ← → 키로 전시실을 둘러보세요',
  hintMobile: '옆으로 밀어 다음 벽을 보세요',
}

/** 관장(=나) 정보 */
export const curator = {
  handle: 'rhafta',
  domain: 'rhafta.com',
  role: 'Developer & Collector of small things',
  email: 'hello@rhafta.com',
}

export const walls: Wall[] = [
  /* ─── 00 · 홀 ─────────────────────────────────────────────── */
  {
    kind: 'hall',
    id: 'hall',
    no: '00',
    name: 'HALL',
    nameKo: '홀',
    title: 'rhafta',
    tagline: '만드는 사람의 개인 전시관',
    intro:
      '이곳은 제가 만든 것들과 지나온 장면들을 걸어두는 방입니다. 좌우로 돌려 다음 벽으로 이동하세요.',
    links: [
      { label: 'GitHub', href: 'https://github.com/rhafta', hint: '코드' },
      { label: 'X', href: 'https://x.com/rhafta', hint: '짧은 생각' },
      { label: 'Instagram', href: 'https://instagram.com/rhafta', hint: '사진' },
      { label: 'Email', href: 'mailto:hello@rhafta.com', hint: '연락' },
    ],
  },

  /* ─── 01 · 작업 ───────────────────────────────────────────── */
  {
    kind: 'gallery',
    id: 'works',
    no: '01',
    name: 'WORKS',
    nameKo: '작업',
    title: '만든 것들',
    intro: '직접 설계하고 끝까지 만들어 본 것들. 액자를 누르면 자세히 볼 수 있습니다.',
    layout: 'row',
    items: [
      {
        id: 'w1',
        title: 'rhafta.com',
        medium: 'React · TypeScript · CSS 3D',
        year: '2026',
        tone: 34,
        pattern: 0,
        ratio: 'landscape',
        tags: ['Web', 'Interaction'],
        body: '지금 보고 계신 이 공간. 스크롤 대신 몸을 돌려 벽을 바라보는 방식으로 포트폴리오를 재구성했습니다. 라이브러리 없이 CSS 3D 변환만으로 육각형 전시홀을 세웠습니다.',
        links: [{ label: '소스 보기', href: 'https://github.com/rhafta/rhafta.com' }],
      },
      {
        id: 'w2',
        title: 'Project Two',
        medium: 'Next.js · Postgres',
        year: '2025',
        tone: 198,
        pattern: 1,
        ratio: 'portrait',
        tags: ['Product'],
        body: '여기에 두 번째 프로젝트 설명을 적으세요. 무엇을 왜 만들었고, 어떤 문제를 풀었는지 한 문단이면 충분합니다.',
        links: [{ label: '바로가기', href: '#' }],
      },
      {
        id: 'w3',
        title: 'Project Three',
        medium: 'Swift · CoreML',
        year: '2025',
        tone: 12,
        pattern: 2,
        ratio: 'square',
        tags: ['App'],
        body: '세 번째 작업. 화면 캡처나 대표 이미지를 public/art/ 에 넣고 image 필드에 경로를 적으면 액자에 그림이 걸립니다.',
      },
      {
        id: 'w4',
        title: 'Project Four',
        medium: 'Go · CLI',
        year: '2024',
        tone: 268,
        pattern: 3,
        ratio: 'landscape',
        tags: ['Tool'],
        body: '작은 도구도 훌륭한 전시물입니다. 만들면서 배운 것을 한 줄 남겨두면 나중에 스스로에게 도움이 됩니다.',
      },
    ],
  },

  /* ─── 02 · 여행 ───────────────────────────────────────────── */
  {
    kind: 'gallery',
    id: 'journeys',
    no: '02',
    name: 'JOURNEYS',
    nameKo: '여행',
    title: '다녀온 곳',
    intro: '걸어 다니며 주워 담은 장면들. 날짜와 장소를 명패에 새겨 두었습니다.',
    layout: 'salon',
    items: [
      {
        id: 'j1',
        title: '교토, 늦여름',
        medium: 'Kyoto, Japan',
        year: '2025.08',
        tone: 22,
        pattern: 4,
        ratio: 'portrait',
        scale: 1.1,
        frame: 'gilded',
        body: '해가 지고도 오래 식지 않던 골목. 여행 기록은 사진 한 장과 문장 하나면 충분히 남습니다.',
      },
      {
        id: 'j2',
        title: '제주, 바람의 방향',
        medium: 'Jeju, Korea',
        year: '2025.04',
        tone: 176,
        pattern: 0,
        ratio: 'landscape',
        scale: 1.25,
        body: '동쪽 해안을 따라 하루 종일 걸었던 날.',
      },
      {
        id: 'j3',
        title: '홍콩, 밤의 층',
        medium: 'Hong Kong',
        year: '2024.11',
        tone: 300,
        pattern: 2,
        ratio: 'square',
        scale: 0.9,
        body: '창문마다 다른 시간이 켜져 있던 건물.',
      },
      {
        id: 'j4',
        title: '강릉, 새벽 다섯 시',
        medium: 'Gangneung, Korea',
        year: '2024.07',
        tone: 210,
        pattern: 5,
        ratio: 'landscape',
        scale: 1,
        body: '해 뜨는 걸 보겠다고 나섰다가 결국 파도 소리만 듣고 온 아침.',
      },
    ],
  },

  /* ─── 03 · 사진 ───────────────────────────────────────────── */
  {
    kind: 'gallery',
    id: 'photographs',
    no: '03',
    name: 'PHOTOGRAPHS',
    nameKo: '사진',
    title: '사진첩',
    intro: '주제도 순서도 없이, 그냥 좋아서 남겨둔 것들.',
    layout: 'grid',
    items: [
      { id: 'p1', title: 'Untitled #01', medium: '35mm', year: '2026', tone: 40, pattern: 1, ratio: 'square', frame: 'thin', mat: false },
      { id: 'p2', title: 'Untitled #02', medium: 'Digital', year: '2025', tone: 190, pattern: 3, ratio: 'square' },
      { id: 'p3', title: 'Untitled #03', medium: '35mm', year: '2025', tone: 348, pattern: 5, ratio: 'square' },
      { id: 'p4', title: 'Untitled #04', medium: 'Digital', year: '2025', tone: 96, pattern: 0, ratio: 'square' },
      { id: 'p5', title: 'Untitled #05', medium: '35mm', year: '2024', tone: 258, pattern: 2, ratio: 'square' },
      { id: 'p6', title: 'Untitled #06', medium: 'Digital', year: '2024', tone: 16, pattern: 4, ratio: 'square' },
    ],
  },

  /* ─── 04 · 소개 ───────────────────────────────────────────── */
  {
    kind: 'text',
    id: 'about',
    no: '04',
    name: 'ABOUT',
    nameKo: '소개',
    title: '관장의 말',
    intro: '이 전시관을 지은 사람에 대하여.',
    sections: [
      {
        heading: '지금',
        lines: [
          '웹을 만들고, 만든 과정을 기록합니다.',
          '작은 도구를 만들어 스스로의 하루를 고치는 일을 좋아합니다.',
          '요즘은 인터랙션과 3D 표현에 관심이 많습니다.',
        ],
      },
      {
        heading: '도구',
        lines: [
          'TypeScript · React · Next.js',
          'Node.js · Postgres · Supabase',
          'Figma · CSS Transforms · WebGL',
        ],
      },
      {
        heading: '연혁',
        lines: [
          '2026 — 개인 전시관 rhafta.com 개관',
          '2025 — 사이드 프로젝트 두 개 공개',
          '2024 — 기록을 남기기 시작',
        ],
      },
    ],
  },

  /* ─── 05 · 연락 ───────────────────────────────────────────── */
  {
    kind: 'contact',
    id: 'contact',
    no: '05',
    name: 'CONTACT',
    nameKo: '연락',
    title: '방명록',
    intro: '전시를 끝까지 봐주셔서 고맙습니다.',
    note: '함께 만들고 싶은 것이 있거나, 그냥 인사를 남기고 싶다면 언제든지.',
    links: [
      { label: 'hello@rhafta.com', href: 'mailto:hello@rhafta.com', hint: '메일' },
      { label: 'github.com/rhafta', href: 'https://github.com/rhafta', hint: '깃허브' },
      { label: 'x.com/rhafta', href: 'https://x.com/rhafta', hint: '엑스' },
    ],
  },
]
