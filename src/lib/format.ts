/** 명패에 쓰는 "재료 · 연도" 한 줄 포맷. 빈 값은 건너뛴다. */
export function formatMeta(...parts: (string | undefined)[]): string {
  return parts.filter(Boolean).join('  ·  ')
}
