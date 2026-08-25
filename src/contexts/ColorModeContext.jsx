// src/contexts/ColorModeContext.jsx
// Provider global de tema claro/escuro. Fica ACIMA de todo o app (main.jsx),
// não dentro do Dashboard — o shell inteiro (Layout, Sidebar, UserMenu)
// precisa reagir à troca.

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createAppTheme, applyCssVars } from '../theme';
import {
  ColorModeContext,
  MODOS_VALIDOS,
  resolverModoInicial,
  salvarModoPersistido,
} from './colorMode';

export function ColorModeProvider({ children }) {
  // Estado inicial resolvido de forma preguiçosa: roda uma vez, antes do
  // primeiro paint do React, então não há frame com o tema errado.
  const [mode, setMode] = useState(resolverModoInicial);

  // Espelha o modo no <html> para o CSS escrito à mão (index.css usa
  // [data-theme]) e para o color-scheme nativo de scrollbars e widgets.
  useEffect(() => {
    const raiz = document.documentElement;
    raiz.dataset.theme = mode;
    raiz.style.colorScheme = mode;
    applyCssVars(raiz, mode);

    // Mantém a barra do navegador (Android/PWA) coerente com o tema.
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', mode === 'light' ? '#F4EEE3' : '#09100E');
  }, [mode]);

  const setColorMode = useCallback((proximo) => {
    if (!MODOS_VALIDOS.includes(proximo)) return;
    setMode(proximo);
    salvarModoPersistido(proximo);
  }, []);

  const toggleColorMode = useCallback(() => {
    setMode((atual) => {
      const proximo = atual === 'dark' ? 'light' : 'dark';
      salvarModoPersistido(proximo);
      return proximo;
    });
  }, []);

  const theme = useMemo(() => createAppTheme(mode), [mode]);
  const valor = useMemo(
    () => ({ mode, setColorMode, toggleColorMode }),
    [mode, setColorMode, toggleColorMode],
  );

  return (
    <ColorModeContext.Provider value={valor}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default ColorModeProvider;
