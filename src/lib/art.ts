import type { CSSProperties } from 'react'

const c = (h: number, s: number, l: number, a = 1) =>
  `hsl(${((h % 360) + 360) % 360} ${s}% ${l}% / ${a})`

/**
 * 이미지가 없는 작품을 위한 절차적 추상 회화.
 * tone(색상)과 pattern(무늬 번호)만으로 매번 같은 그림이 나옵니다.
 */
export function paint(tone = 30, pattern = 0): CSSProperties {
  const h = tone
  switch (((pattern % 6) + 6) % 6) {
    /* 0 — 색면: 지평선 */
    case 0:
      return {
        backgroundColor: c(h, 16, 84),
        backgroundImage: [
          `radial-gradient(118% 76% at 50% 42%, ${c(h + 34, 42, 91, 0.7)}, transparent 64%)`,
          `linear-gradient(180deg, ${c(h, 28, 62, 0.92)} 0 40%, transparent 40.6%)`,
          `linear-gradient(180deg, transparent 62%, ${c(h + 14, 24, 34, 0.9)} 62.6%)`,
        ].join(','),
      }

    /* 1 — 겹친 구체 */
    case 1:
      return {
        backgroundColor: c(h, 14, 15),
        backgroundImage: [
          `radial-gradient(closest-side circle at 36% 36%, ${c(h, 38, 62)}, ${c(h, 38, 56, 0)})`,
          `radial-gradient(closest-side circle at 68% 64%, ${c(h + 42, 34, 50)}, ${c(h + 42, 34, 46, 0)})`,
          `radial-gradient(130% 110% at 50% 120%, ${c(h - 18, 22, 24)}, transparent 72%)`,
        ].join(','),
        backgroundSize: '80% 80%, 64% 64%, 100% 100%',
        backgroundPosition: '8% 10%, 54% 50%, 0 0',
        backgroundRepeat: 'no-repeat',
      }

    /* 2 — 사선 지층 */
    case 2:
      return {
        backgroundColor: c(h, 18, 76),
        backgroundImage: [
          `repeating-linear-gradient(118deg, ${c(h, 24, 44, 0.42)} 0 9%, transparent 9% 22%)`,
          `linear-gradient(200deg, ${c(h + 26, 30, 88)}, ${c(h - 20, 26, 48)})`,
        ].join(','),
      }

    /* 3 — 동심 아치 */
    case 3:
      return {
        backgroundColor: c(h, 20, 88),
        backgroundImage: [
          `repeating-radial-gradient(circle at 50% 92%, ${c(h, 26, 46, 0.34)} 0 5.5%, transparent 5.5% 13%)`,
          `linear-gradient(180deg, ${c(h + 22, 34, 91)}, ${c(h, 24, 68)})`,
        ].join(','),
      }

    /* 4 — 언덕과 해 */
    case 4:
      return {
        backgroundColor: c(h, 26, 84),
        backgroundImage: [
          `radial-gradient(closest-side circle at 68% 28%, ${c(h + 22, 52, 74)} 94%, transparent)`,
          `radial-gradient(132% 60% at 20% 116%, ${c(h - 10, 24, 34)} 60%, transparent 61%)`,
          `radial-gradient(120% 56% at 86% 122%, ${c(h + 8, 28, 48)} 60%, transparent 61%)`,
          `linear-gradient(180deg, ${c(h + 36, 38, 90)}, ${c(h, 30, 70)})`,
        ].join(','),
        backgroundSize: '30% 30%, 100% 100%, 100% 100%, 100% 100%',
        backgroundRepeat: 'no-repeat',
      }

    /* 5 — 망점 */
    default:
      return {
        backgroundColor: c(h, 18, 24),
        backgroundImage: [
          `radial-gradient(circle, ${c(h + 26, 38, 72, 0.75)} 18%, transparent 19%)`,
          `linear-gradient(150deg, ${c(h, 26, 36)}, ${c(h + 44, 20, 18)})`,
        ].join(','),
        backgroundSize: '5.6% 5.6%, 100% 100%',
      }
  }
}
