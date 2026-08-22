# rhafta.com — The Gallery

내 닉네임 `rhafta` 로 여는 1인 전시관. 입체 공간의 벽마다 콘텐츠가 걸려 있고,
옆으로 돌리면 다음 벽이 나온다.

- **회전**: 드래그 / 스와이프 / 마우스 휠 / `←` `→` 키 / 하단 네비게이션
- **숫자 키** `1`~`9` 로 해당 벽으로 바로 이동
- 액자를 클릭하면 상세 화면이 열린다 (`Esc` 로 닫기)
- 현재 벽은 주소창 해시(`#works` 등)에 남아서 **특정 벽으로 바로 링크**할 수 있다

## 개발

```bash
npm install
npm run dev      # 개발 서버
npm run build    # dist/ 에 정적 빌드
```

빌드 결과는 순수 정적 파일이라 Vercel, Netlify, GitHub Pages 어디에나 올릴 수 있다.

---

# 커스터마이징 가이드

**모든 콘텐츠와 옵션은 `src/data/gallery.ts` 한 파일에 있다.**
코드는 건드릴 필요 없다.

## 1. 벽 (전시실)

`walls` 배열의 원소 하나 = 벽 하나. **벽을 추가/삭제하면 방의 모양 자체가
바뀐다** — 4면이면 정사각형 방, 5면이면 오각형, 6면이면 육각형, 8면이면 팔각형.
배열 순서가 곧 도는 순서다.

벽의 `kind` 네 가지:

| kind | 용도 | 주요 필드 |
|---|---|---|
| `hall` | 입구 — 닉네임 + 링크 로고 | `title`, `tagline`, `intro`, `links` |
| `gallery` | 액자를 거는 전시 벽 | `layout`, `items` |
| `text` | 벽에 붙는 안내판(소개 등) | `sections` |
| `contact` | 방명록 / 연락처 | `note`, `links` |

`gallery` 벽의 `layout`:

- `row` — 한 줄로 나란히
- `salon` — 높낮이가 들쭉날쭉한 살롱식
- `grid` — 격자 (사진 벽에 좋음)
- `single` — 대형 작품 한 점만

## 2. 작품 (`Artwork`)

```ts
{
  id: 'w1',
  title: '작품 이름',          // 명패 1줄
  medium: 'React · Three.js',  // 명패 2줄 (기술 스택이나 장소)
  year: '2026',
  body: '상세 화면에 나오는 설명',
  links: [{ label: '바로가기', href: 'https://...' }],

  image: '/art/foo.jpg',       // public/art/ 에 넣은 이미지. 없으면 ↓
  tone: 34,                    // 자동 생성 회화의 색상 (0~360)
  pattern: 0,                  // 자동 생성 회화의 무늬 (0~5)

  ratio: 'landscape',          // 'portrait' | 'landscape' | 'square'
  scale: 1.1,                  // salon 배치에서 크기 가중치
  frame: 'dark',               // 'dark' | 'gilded'(금박) | 'light' | 'thin'
  mat: true,                   // false 면 흰 매트 없이 꽉 채움
  plate: true,                 // false 면 명패 숨김
}
```

이미지를 걸려면 `public/art/` 에 파일을 넣고 `image: '/art/파일명.jpg'` 만
적으면 된다. `image` 가 없으면 `tone` + `pattern` 으로 매번 같은 추상 회화가
자동으로 그려진다.

## 3. 전역 설정 (`settings`)

```ts
export const settings: SiteSettings = {
  mood: 'warm',            // 'warm' | 'neutral' | 'cool' — 벽·바닥 색감
  accent: '#c99a4e',       // 강조색 (명패, 포인트)
  accentBright: '#eec987', // 강조색 밝은 버전
  lightIntensity: 1,       // 조명 밝기 0.4 ~ 1.2
  lampsPerWall: 3,         // 벽마다 레일 조명 개수
  turnMs: 820,             // 벽 회전 시간(ms)
  hintDesktop: '...',      // 하단 안내 문구
  hintMobile: '...',
}
```

## 4. 홀 링크 로고

`hall` 벽의 `links` 는 흑백 로고 아이콘으로 표시된다.
`label` 로 로고를 알아본다: GitHub / X / Instagram / Email / LinkedIn 은
전용 로고, 그 외는 첫 글자를 새긴 원형 마크가 된다.

## 5. 라이트 모드 되살리기

지금은 야간(다크) 모드만 공개 상태다. `src/App.tsx` 맨 위의
`NIGHT_ONLY` 를 `false` 로 바꾸면 헤더에 주간/야간 토글이 다시 나타나고
주간 팔레트(CSS 에 그대로 보존돼 있음)가 살아난다.
