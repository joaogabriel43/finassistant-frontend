import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ColorModeProvider } from './contexts/ColorModeContext'
import './index.css'
import App from './App.jsx'

// O ColorModeProvider é quem monta o ThemeProvider e o CssBaseline: o modo
// (claro/escuro) precisa estar acima de TODO o app, não só do Dashboard.
// Ele também espelha os tokens em CSS custom properties (--c-*, --r-*, --f-*)
// a cada troca de modo, para o CSS escrito à mão.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ColorModeProvider>
      <App />
    </ColorModeProvider>
  </StrictMode>,
)
