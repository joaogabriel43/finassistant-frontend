import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import theme, { applyCssVars } from './theme'
import './index.css'
import App from './App.jsx'

// Espelha os tokens D4 em CSS custom properties (--c-*, --r-*, --f-*)
// no :root para o CSS escrito à mão do design system.
applyCssVars()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
