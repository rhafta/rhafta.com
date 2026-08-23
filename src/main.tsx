import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

// 자체 호스팅 폰트 — 실제 쓰는 굵기 + 라틴/라틴 확장 서브셋만 (base.css 의
// --font-* 참고). 서브셋을 지정하지 않는 기본 CSS(예: '.../400.css')는
// 키릴·그리스·베트남어 서브셋까지 함께 번들에 끼워 넣으므로 피한다.
import '@fontsource/instrument-serif/latin-400.css'
import '@fontsource/instrument-serif/latin-ext-400.css'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-ext-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-ext-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-ext-600.css'
import '@fontsource/jetbrains-mono/latin-400.css'
import '@fontsource/jetbrains-mono/latin-ext-400.css'
import '@fontsource/jetbrains-mono/latin-500.css'
import '@fontsource/jetbrains-mono/latin-ext-500.css'

import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
