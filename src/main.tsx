import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/breakpoints.css'
import './styles/global.css'
import './styles/responsive.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
