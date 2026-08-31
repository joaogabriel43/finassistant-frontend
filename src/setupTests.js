import '@testing-library/jest-dom'

// Este setup roda para TODOS os arquivos de teste, inclusive os que declaram
// `// @vitest-environment node` (ex.: src/pwa/__tests__, que precisam do
// Request/Response nativos do undici para montar as estratégias do Workbox).
// Nesses casos não existe `window` — o polyfill abaixo é só para o jsdom.
if (typeof window !== 'undefined') {
  // jsdom does not implement window.matchMedia — polyfill for tests
  // (used by usePWAInstall and any component relying on media queries)
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })
}
