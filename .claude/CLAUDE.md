# CLAUDE.md

코드 품질 기준. 모든 작업에 적용된다.

## 0. Gold Standard Obligation

**"It works" is not done. Done means it's the right way to do it.**

Before implementing anything non-trivial:

- Identify if an industry-standard library or pattern exists. Use it. Custom implementations are the last resort.
- Research first when the best approach is uncertain.

After implementing:

- Verify it scales and the next dev can understand it in 6 months.
- Verify a senior engineer would call this the correct solution.
- If either answer is no, redesign before shipping.

The cost of doing it right once is always lower than the cost of rewriting later.

## 0-1. Courage to Refactor

기존 코드가 잘못된 방향이면 점진적 패치 대신 과감하게 재설계한다. 구조적 문제를 임시방편으로 덮지 않는다.

**과감함의 범위 (0-3의 Gold Standard 영역 한정):** 표준 라이브러리 도입, 파일·계층·추상화 경계의 전면 재설계까지 주저하지 않는다. 기존 코드 보존이 목표가 아니라 올바른 구조가 목표다.

**가드레일:**

- Prototype-First 영역(0-3 표)까지 과도하게 다듬지 않는다 — 오버엔지니어링이다.
- 파급이 큰 변경(새 의존성, 전면 재설계)은 실행 전에 먼저 알리고 합의한다.

**범위 기준:** 요청 범위 안의 잘못된 구조는 즉시 고친다. 범위 밖이면 알리기만 하고, 현재 요청은 기존 구조에 맞춰 완료한 뒤 리팩토링은 별도로 제안한다. 조용히 넘어가지도, 조용히 혼자 고치지도 않는다.

## 0-2. Balanced Engineering (Prototype-First)

**현재 단계: 소규모 프로토타입.** 이 컨텍스트를 항상 유지한다.

밸런스 우선순위 (이 프로젝트 기준):

1. 개발 속도 — 빠르게 검증할 수 있어야 한다
2. 가독성 — 혼자 또는 소수가 유지보수한다
3. 확장성 — 구조는 올바르게, 구현은 현재 필요한 만큼만
4. 성능 / 보안 — 병목이나 취약점이 실제로 존재할 때 대응한다

오버엔지니어링 금지:

- 현재 사용자가 없는 기능의 캐싱/큐/분산 처리: skip
- 마이크로서비스, 이벤트 소싱 등 대규모 아키텍처 패턴: skip
- 프로토타입 단계에서 필요 없는 완벽한 에러 복구 로직: skip

"분수에 맞는 수준" = 지금 실제로 필요한 것만. 다음 단계는 다음 단계에.

## 0-3. Gold Standard vs Prototype-First — 충돌 해소 원칙

이 두 원칙은 자주 충돌한다. 충돌할 때의 판단 기준:

**Gold Standard는 되돌리기 어려운 결정에 적용한다.**
**Prototype-First는 나중에 쉽게 바꿀 수 있는 결정에 적용한다.**

| 영역                                    | 적용 원칙       | 이유                         |
| --------------------------------------- | --------------- | ---------------------------- |
| DB 스키마, 관계 설계                    | Gold Standard   | 마이그레이션 비용이 크다     |
| 컴포넌트 계층 구조                      | Gold Standard   | 잘못 잡으면 전체를 다시 짠다 |
| 추상화 경계 (어느 계층이 무엇을 아는가) | Gold Standard   | 뒤집으면 파급 범위가 크다    |
| 타입 설계 (domain types)                | Gold Standard   | 전파 범위가 넓다             |
| 에러 메시지 디테일                      | Prototype-First | 텍스트는 언제든 바꾼다       |
| 성능 최적화 (캐싱, 쿼리 튜닝)           | Prototype-First | 병목이 생기면 그때 한다      |
| 에러 복구 로직의 완성도                 | Prototype-First | 실제 장애 패턴 보고 결정한다 |
| UI 세부 디자인                          | Prototype-First | 검증 전에 완성하지 않는다    |

한 문장으로: **구조와 방향은 Gold Standard, 구현의 완성도는 Prototype-First.**

## 1. Think Before Coding

State assumptions explicitly. Present tradeoffs when multiple interpretations exist. Push back when a simpler approach exists. Stop and ask when something is unclear — never guess silently.

Before touching a Gold Standard area (0-3 표 기준: 컴포넌트 계층, 공유 타입, 정책/규칙, 추상화 경계), read how it's already used elsewhere in the codebase — UI 패턴, 기존 로직, 관련 계층까지. 한 문장으로 diff를 설명할 수 있는 사소한 변경(텍스트, 스타일, 단일 파일 버그 수정)은 생략한다.

기능을 하나 추가하더라도 그 기능만 딱 떼어 만들지 않는다. 기존 코드와 구조를 충분히 분석해 비슷한 기능이 이미 어떻게 처리되고 있는지 먼저 확인하고, 이 기능에 당연히 같이 따라와야 하는 부수 기능·처리가 있는지 조사·분석해서 상황에 맞게 함께 구현한다.

## 2. Simplicity First

Minimum code that solves the problem. Nothing speculative.

- Features beyond what was asked: skip.
- Abstractions for single-use code: skip.
- Error handling for impossible scenarios: skip.
- If 200 lines could be 50, rewrite it.

Ask: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes + Zero Dead Code

Touch only what the request requires. Match existing style.

When changes create orphans (no exceptions):

- Remove all imports YOUR changes made unused.
- Remove all variables/functions/types YOUR changes made unused.
- Delete old files YOUR changes replaced.
- Consolidate immediately if two definitions of the same thing now exist.
- Trace every consumer when you change something shared (a type, an enum, a policy, a rule) — a change isn't finished until they all agree.

Every changed line traces to the user's request. No orphans survive a commit.

미구현 기능의 stub 코드(TODO, 빈 함수, 하드코딩 0 등)는 **의도된 상태**이므로 dead code로 보지 않는다.
단, stub임을 코드에서 명확히 알 수 있어야 한다 (짧은 주석 또는 네이밍으로).

## 4. Goal-Driven Execution

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Reproduce it, then make it not reproduce"
- "Refactor X" → "Tests pass before and after"

## 5. Git Commit Messages

모든 커밋 메시지는 **한국어로 작성**한다.

**형식:**

```
<type>: <subject>
```

**제목 규칙 (subject):**

- 명령형 현재형: "추가했다" ❌ → "추가" ✅
- 간결함: 50자 이내 (한국어 기준 ~25자)
- 구체성: "버그 수정" ❌ → "로그인 폼 유효성 검사 버그 수정" ✅
- 무엇을 했는지만: 왜는 필요시 본문에

**Type (Conventional Commits):**

- `feat:` 새로운 기능
- `fix:` 버그 수정
- `refactor:` 코드 재구성 (기능 변경 없음)
- `docs:` 문서 변경
- `test:` 테스트 추가/수정
- `chore:` 기타 (의존성, 빌드 등)

**예시:**

- ✅ `feat: 사용자 인증 추가`
- ✅ `fix: API 응답 타입 오류`
- ❌ `feat: 여러 기능을 추가하고 버그도 고쳤습니다`
- ❌ `update: 코드 개선`

**본문 (선택사항):**

- 50자 제목 이후 한 줄 띄우고 작성
- 무엇을 변경했고 왜 변경했는지만 (다만 커밋이 명확하면 생략 가능)
