import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

// 자체 호스팅 폰트 — 실제 쓰는 굵기의 latin 서브셋만 (base.css 의 --font-* 참고).
// 서브셋을 지정하지 않는 기본 CSS(예: '.../400.css')는 키릴·그리스·베트남어까지
// 함께 번들에 끼워 넣으므로 피한다. latin-ext(악센트 글자)는 이 사이트 문안에
// 쓰이지 않아 뺐다 — 혹시 쓰더라도 아래 Pretendard 가 받아준다.
import '@fontsource/instrument-serif/latin-400.css'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/jetbrains-mono/latin-400.css'
import '@fontsource/jetbrains-mono/latin-500.css'

// 한글 — Pretendard 가변폰트의 dynamic subset.
// 웹폰트를 안 실으면 방문자 OS 기본 한글 글꼴(윈도우는 맑은 고딕)로
// 떨어져서 "문서/발표자료" 인상이 난다. 가변폰트라 파일 세트 하나로
// 모든 굵기를 덮고, unicode-range 로 쪼개져 있어 실제 쓰인 글자가
// 속한 조각만 내려받는다.
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css'

import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
