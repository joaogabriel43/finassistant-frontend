import React, { createContext, useContext, useMemo, useState } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { createAppTheme } from '../theme'

const ColorModeContext = createContext({
  mode: 'dark',
  toggleMode: () => {},
  setMode: () => {},
})

export function ColorModeProvider({ children }) {
  const [mode, setModeState] = useState(() => {
    const saved = localStorage.getItem('temaEscuro')
    return saved === 'false' ? 'light' : 'dark'
  })

  const toggleMode = () => {
    setModeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('temaEscuro', next === 'dark' ? 'true' : 'false')
      return next
    })
  }

  const setMode = (isDark) => {
    const next = isDark ? 'dark' : 'light'
    localStorage.setItem('temaEscuro', isDark ? 'true' : 'false')
    setModeState(next)
  }

  const theme = useMemo(() => createAppTheme(mode), [mode])

  return (
    <ColorModeContext.Provider value={{ mode, toggleMode, setMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}

export function useColorMode() {
  return useContext(ColorModeContext)
}
