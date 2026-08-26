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
    // O script de boot no index.html pinta o <html> inline para evitar flash
    // antes do React montar. Se esse valor ficar, o overscroll do tema claro
    // continua mostrando o fundo escuro — limpa e deixa o CSS mandar.
    raiz.style.backgroundColor = '';

    // Mantém a barra do navegador (Android/PWA) coerente com o tema.
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', mode === 'light' ? '#F4EEE3' : '#09100E');
  }, [mode]);

  const setColorMode = useCallback((proximo) => {
    if (!MODOS_VALIDOS.includes(proximo)) return;
    setMode(proximo);
    salvarModoPersistido(proximo);
  }, []);

  // Efeito colateral FORA do updater do useState: o React pode reexecutar o
  // updater (StrictMode, render concorrente) e a escrita no storage
  // aconteceria mais de uma vez. Delega ao `setColorMode`, que ja separa as
  // duas coisas corretamente. Persistir num efeito de `mode` seria pior:
  // gravaria a preferencia do DISPOSITIVO na primeira montagem, congelando
  // uma escolha que o usuario nunca fez.
  const toggleColorMode = useCallback(() => {
    setColorMode(mode === 'dark' ? 'light' : 'dark');
  }, [mode, setColorMode]);

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
