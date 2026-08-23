# rhafta.com — The Gallery

내 닉네임 `rhafta` 로 여는 1인 전시관. 입체 공간의 벽마다 콘텐츠가 걸려 있고,
옆으로 돌리면 다음 벽이 나온다.

- **회전**: 드래그 / 스와이프 / 마우스 휠 / `←` `→` 키 / 하단 네비게이션
- **숫자 키** `1`~`9` 로 해당 벽으로 바로 이동
- 액자를 클릭하면 상세 화면이 열린다 (`Esc` 로 닫기)
- 현재 벽은 주소창 해시(`#works` 등)에 남아서 **특정 벽으로 바로 링크**할 수 있다

## 개발

패키지 매니저는 **pnpm** 을 쓴다 (`package.json` 의 `packageManager` 필드로
버전까지 고정돼 있다 — Corepack 이 자동으로 맞춰 씀).

```bash
pnpm install
pnpm dev         # 개발 서버
pnpm build       # dist/ 에 정적 빌드 (타입체크 포함)
pnpm lint         # ESLint
pnpm typecheck    # 타입만 검사
```

빌드 결과는 순수 정적 파일이라 Vercel, Netlify, GitHub Pages 어디에나 올릴 수 있다.

## 배포 (Vercel)

`vercel.json` 이 이미 준비되어 있다 — GitHub 저장소를 Vercel 프로젝트로
연결하면 `pnpm-lock.yaml` 을 보고 pnpm 으로 설치·빌드한다.

- `buildCommand: "pnpm build"` — 타입체크(`tsc -b`)를 통과해야 배포되도록
  빌드 스크립트를 명시했다. 타입 에러가 있는 채로는 배포가 올라가지 않는다.
- 정적 자산(`/assets/*`, 파일명에 콘텐츠 해시가 붙어 매번 바뀐다)에
  1년 `immutable` 캐시 헤더를 걸어 재방문 시 네트워크를 거의 타지 않게 했다.
  진입점 `index.html` 은 이 규칙에 안 걸리므로 항상 최신 배포를 가리킨다.
- 라우팅은 해시(`#works` 등)만 쓰므로 SPA 리라이트 설정이 필요 없다.

## 코드 구조

```
src/
  data/
    types.ts        # 스키마 — "무엇을 적을 수 있는가"
    content.ts       # 콘텐츠 — 실제로 적는 곳 (커스터마이징은 여기만)
  components/
    walls/           # 벽 kind 별 컴포넌트 (Hall/Gallery/Text/Contact)
    Room.tsx          # 3D 방 자체 — 벽 개수로 n각형 기하를 계산
    Artwork.tsx, Detail.tsx, Chrome.tsx, Icons.tsx, ExternalLink.tsx
  hooks/
    useRoomMetrics.ts  # 화면 크기 → 방 축척
    useRoom.ts          # 회전 조작계 (아래 세 훅을 합성)
    room/
      useRotationState.ts    # 회전 상태 엔진 (heading, index, settle)
      usePointerRotation.ts  # 드래그 / 스와이프
      useWheelRotation.ts     # 마우스 휠
      useKeyboardRotation.ts  # 키보드
  lib/
    art.ts     # tone/pattern → 절차적 추상 회화
    format.ts   # 명패 텍스트 포맷
```

회전 로직을 입력 방식별로 나눈 이유: 드래그·휠·키보드는 서로 독립적인
관심사라 한 훅에 있으면 어디를 고쳐도 나머지가 다칠까 걱정해야 한다.
`useRotationState` 가 "엔진"(heading을 어떻게 움직이고 어디서 멈추는지)만
알고, 나머지 세 훅은 그 엔진에 입력만 흘려보낸다.

## 3D 애니메이션 성능

Chrome 트레이싱(`Tracing.start` + `RasterTask` 합산)으로 벽 회전
1.1초 구간을 실측해서 고쳤다 — 추측이 아니라 측정.

**원인**: 빛 웅덩이·스포트라이트 글로우 대부분이 `radial-gradient` 위에
`filter: blur()` 를 덧씌우고 있었다. 이 요소들은 전부 3D 회전 중인
`.room` 의 자손이라, 원근 때문에 화면상 크기가 매 프레임 바뀐다 —
그때마다 블러 커널을 그 스케일에 맞게 다시 래스터화해야 해서, 회전
1.1초 동안 래스터 작업이 최대 846ms 를 먹고 있었다.

**처방**:
- 모든 글로우의 `filter: blur()` 를 제거하고, 그라디언트의 페이드
  구간을 넓혀 같은 부드러움을 대체했다. 그라디언트는 스케일이 바뀌어도
  다시 계산할 게 없어 래스터 비용이 사실상 0 이다.
- 보고 있지 않은 벽의 "초점 나감" 효과(`blur(1.5px)`)도 같은 문제라,
  회전·드래그 중에만 빼고 정지하면 다시 건다 — 밝기 낮춤(brightness)
  은 픽셀별 단순 곱셈이라 그대로 둬도 괜찮다.
- `.room` 에 `will-change: transform` 을 회전 중에만 건다(상시로 걸면
  메모리를 낭비하고, `.room` 을 항상 별도 합성 레이어로 만들어 버린다).

**결과**: 같은 방식으로 5회 반복 측정한 평균 래스터 작업량이
846ms → 약 300~400ms 로 줄었다. `box-shadow` 는 A/B로 껐다 켜봐도
차이가 없어(측정 오차 수준) 그대로 뒀다 — 안 쓰는 걸 없애는 게
포인트지, 다 걷어내는 게 목적이 아니다.

새 글로우 효과를 추가할 때는 `filter: blur()` 대신 `radial-gradient`
의 색상 정지점(stop)을 넓혀 부드러움을 내는 걸 기본으로 삼는다 —
회전하는 3D 요소 안이라면 특히.

## 폰트

전부 자체 호스팅한다 (`src/main.tsx` 상단). 외부 요청이 없다.

| 용도 | 글꼴 |
|---|---|
| 표제(영문) | Instrument Serif |
| 본문(영문) | Inter |
| 라벨·숫자 | JetBrains Mono |
| **한글 전체** | **Pretendard (가변폰트)** |

한글 웹폰트를 싣지 않으면 방문자 OS 기본 글꼴로 떨어진다 — 윈도우에서는
맑은 고딕이라 문서·발표자료 같은 인상이 된다. Pretendard 는 가변폰트라
파일 세트 하나로 모든 굵기를 덮고, `unicode-range` 로 92 조각으로
나뉘어 있어 **실제 문안에 쓰인 글자가 속한 조각만** 내려받는다.

굵기를 추가할 때는 실제 쓰는 `font-weight` 를 확인하고 해당
`@fontsource/.../latin-{weight}.css` 만 import 한다. 안 쓰는 굵기와
서브셋(키릴·그리스·라틴 확장)을 받아오지 않는 것이 핵심이다.

## 글의 언어 규칙

한국어와 영어를 섞되, **역할로 나눈다.**

- **영어** — 표지판 역할: 벽 번호·이름(`01 / WORKS`), 큰 제목
  (`Selected Works`), 소제목(`Now`, `Tools`), UI 문구(`Close`, 안내 문구)
- **한국어** — 말 역할: 제목 밑 소개 문장, 작품 설명, 방명록 문안,
  작품 제목

이렇게 두면 시선이 닿는 "포인트"는 전시 표지판처럼 읽히고, 실제 내용은
모국어로 편하게 읽힌다. 새 벽을 추가할 때도 `name` / `title` 은 영어,
`intro` 는 한국어로 두면 통일감이 유지된다.

---

# 커스터마이징 가이드

**모든 콘텐츠와 옵션은 `src/data/content.ts` 한 파일에 있다.**
(각 필드의 의미는 `src/data/types.ts` 의 주석 참고) 코드는 건드릴 필요 없다.

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

공통 필드: `no`(번호), `name`(표지판·네비게이션용 짧은 영문 이름),
`title`(벽에 크게 걸리는 영문 제목), `intro`(제목 아래 한국어 문장).

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
  mood: 'warm',            // 'warm' | 'neutral' | 'cool' — 표면색 + 조명색
  accent: '#d9a441',       // 강조색 (명패, 포인트)
  accentBright: '#f2c66d', // 강조색 밝은 버전
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
