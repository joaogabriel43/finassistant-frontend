import { createTheme } from '@mui/material/styles'

const darkTokens = {
  background: { default: '#0a0a0f', paper: 'rgba(255,255,255,0.04)' },
  text: { primary: '#FFFFFF', secondary: '#8B8BA8' },
  divider: 'rgba(255,255,255,0.06)',
  inputBorder: 'rgba(255,255,255,0.12)',
  inputBorderHover: 'rgba(255,255,255,0.24)',
  paperBorder: 'rgba(255,255,255,0.08)',
}

const lightTokens = {
  background: { default: '#f4f4f8', paper: '#ffffff' },
  text: { primary: '#1a1a2e', secondary: '#56566e' },
  divider: 'rgba(0,0,0,0.08)',
  inputBorder: 'rgba(0,0,0,0.18)',
  inputBorderHover: 'rgba(0,0,0,0.36)',
  paperBorder: 'rgba(0,0,0,0.08)',
}

export function createAppTheme(mode = 'dark') {
  const t = mode === 'dark' ? darkTokens : lightTokens

  return createTheme({
    palette: {
      mode,
      primary: { main: '#7C6AF7' },
      secondary: { main: '#00D4AA' },
      error: { main: '#FF4D6A' },
      background: t.background,
      text: t.text,
      divider: t.divider,
    },
    typography: {
      fontFamily: '"Inter", "Roboto", sans-serif',
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 600 },
    },
    shape: { borderRadius: 16 },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: '1px solid ' + t.paperBorder,
            boxShadow: 'none',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: '1px solid ' + t.paperBorder,
            boxShadow: 'none',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          contained: {
            background: 'linear-gradient(135deg, #7C6AF7 0%, #5B4FD4 100%)',
            boxShadow: 'none',
            borderRadius: 8,
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': {
              boxShadow: '0 0 20px rgba(124,106,247,0.4)',
              background: 'linear-gradient(135deg, #7C6AF7 0%, #5B4FD4 100%)',
            },
          },
          outlined: {
            border: '1px solid rgba(124,106,247,0.5)',
            color: '#7C6AF7',
            textTransform: 'none',
            borderRadius: 8,
            fontWeight: 600,
            '&:hover': {
              border: '1px solid rgba(124,106,247,0.8)',
              backgroundColor: 'rgba(124,106,247,0.08)',
            },
          },
          text: {
            textTransform: 'none',
            fontWeight: 500,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: t.inputBorder },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: t.inputBorderHover },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#7C6AF7' },
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: t.inputBorder },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: t.inputBorderHover },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#7C6AF7' },
          },
        },
      },
      MuiDivider: {
        styleOverrides: { root: { borderColor: t.divider } },
      },
      MuiChip: {
        styleOverrides: { root: { borderRadius: 6 } },
      },
    },
  })
}

// Default export for backwards compatibility
export default createAppTheme('dark')
