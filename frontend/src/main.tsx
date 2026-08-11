import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// The browser restores scroll before the list has loaded, so the page is still
// short and it lands in the wrong place
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
