// src/contexts/colorMode.js
// Contexto e utilidades do tema claro/escuro. Separado do provider (.jsx)
// de propósito: um arquivo que exporta componentes E hooks dispara o aviso
// react-refresh/only-export-components — dividir custa nada e mantém o
// lint limpo.

import { createContext, useContext } from 'react';

/**
 * Chave de persistência da preferência de tema.
 * Namespace próprio — não colide com `authToken` nem `refreshToken`,
 * e sobrevive ao logout (preferência visual não é dado de sessão).
 */
export const COLOR_MODE_STORAGE_KEY = 'pondero-color-mode';

export const MODOS_VALIDOS = ['light', 'dark'];

export const ColorModeContext = createContext({
  mode: 'dark',
  setColorMode: () => {},
  toggleColorMode: () => {},
});

/** Lê a preferência persistida, tolerando localStorage indisponível. */
export function lerModoPersistido() {
  try {
    const salvo = localStorage.getItem(COLOR_MODE_STORAGE_KEY);
    return MODOS_VALIDOS.includes(salvo) ? salvo : null;
  } catch {
    // Modo privado / storage bloqueado: seguimos com a preferência do device.
    return null;
  }
}

/** Grava a preferência, tolerando localStorage indisponível. */
export function salvarModoPersistido(mode) {
  try {
    localStorage.setItem(COLOR_MODE_STORAGE_KEY, mode);
  } catch {
    // Sem persistência a troca ainda vale para a sessão atual.
  }
}

/** Preferência declarada pelo sistema operacional do usuário. */
export function lerPreferenciaDoDispositivo() {
  try {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

/**
 * Modo inicial: preferência persistida vence; sem ela, o dispositivo decide.
 * Mesma regra do script anti-flash em index.html — as duas implementações
 * precisam concordar, senão a tela pisca no primeiro paint.
 */
export function resolverModoInicial() {
  return lerModoPersistido() ?? lerPreferenciaDoDispositivo();
}

export function useColorMode() {
  return useContext(ColorModeContext);
}
