import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

// 자체 호스팅 폰트 — 실제 쓰는 굵기만 (base.css 의 --font-* 참고)
import '@fontsource/instrument-serif/400.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'

import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
