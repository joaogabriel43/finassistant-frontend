import '@testing-library/jest-dom'

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
