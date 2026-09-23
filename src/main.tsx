import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import JeannaApp from './JeannaApp.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <JeannaApp />
  </StrictMode>,
)
