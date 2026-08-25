import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { ColorModeProvider } from '../ColorModeContext'
import { useColorMode, COLOR_MODE_STORAGE_KEY } from '../colorMode'

// Simula a preferência do dispositivo. O polyfill de setupTests.js sempre
// devolve matches:false; aqui controlamos a resposta por query.
const mockPrefersLight = (prefereClaro) => {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: query.includes('light') ? prefereClaro : !prefereClaro,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }))
}

function Sonda() {
  const { mode, toggleColorMode } = useColorMode()
  return (
    <div>
      <span data-testid="modo">{mode}</span>
      <button onClick={toggleColorMode}>alternar</button>
    </div>
  )
}

const renderSonda = () =>
  render(
    <ColorModeProvider>
      <Sonda />
    </ColorModeProvider>,
  )

describe('ColorModeContext', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    mockPrefersLight(false)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('sem preferência persistida, adota o tema escuro do dispositivo', () => {
    mockPrefersLight(false)
    renderSonda()
    expect(screen.getByTestId('modo')).toHaveTextContent('dark')
  })

  it('sem preferência persistida, adota o tema claro do dispositivo', () => {
    mockPrefersLight(true)
    renderSonda()
    expect(screen.getByTestId('modo')).toHaveTextContent('light')
  })

  it('preferência persistida vence a preferência do dispositivo', () => {
    mockPrefersLight(false)
    localStorage.setItem(COLOR_MODE_STORAGE_KEY, 'light')
    renderSonda()
    expect(screen.getByTestId('modo')).toHaveTextContent('light')
  })

  it('valor persistido inválido cai no fallback do dispositivo', () => {
    mockPrefersLight(true)
    localStorage.setItem(COLOR_MODE_STORAGE_KEY, 'roxo-neon')
    renderSonda()
    expect(screen.getByTestId('modo')).toHaveTextContent('light')
  })

  it('alterna o modo e persiste a escolha já no primeiro acesso', async () => {
    const user = userEvent.setup()
    mockPrefersLight(false)
    renderSonda()

    expect(screen.getByTestId('modo')).toHaveTextContent('dark')
    await user.click(screen.getByRole('button', { name: /alternar/i }))

    await waitFor(() => expect(screen.getByTestId('modo')).toHaveTextContent('light'))
    expect(localStorage.getItem(COLOR_MODE_STORAGE_KEY)).toBe('light')
  })

  it('usa uma chave própria e nunca toca em authToken/refreshToken', async () => {
    const user = userEvent.setup()
    localStorage.setItem('authToken', 'token-de-acesso')
    localStorage.setItem('refreshToken', 'token-de-renovacao')
    renderSonda()

    await user.click(screen.getByRole('button', { name: /alternar/i }))

    expect(COLOR_MODE_STORAGE_KEY).not.toBe('authToken')
    expect(COLOR_MODE_STORAGE_KEY).not.toBe('refreshToken')
    expect(localStorage.getItem('authToken')).toBe('token-de-acesso')
    expect(localStorage.getItem('refreshToken')).toBe('token-de-renovacao')
  })

  it('espelha o modo em data-theme na raiz do documento', async () => {
    const user = userEvent.setup()
    mockPrefersLight(false)
    renderSonda()

    await waitFor(() => expect(document.documentElement.dataset.theme).toBe('dark'))
    await user.click(screen.getByRole('button', { name: /alternar/i }))
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe('light'))
  })

  it('não quebra quando o localStorage está indisponível', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('acesso negado ao armazenamento')
    })
    mockPrefersLight(true)

    expect(() => renderSonda()).not.toThrow()
    expect(screen.getByTestId('modo')).toHaveTextContent('light')
    getItem.mockRestore()
  })
})
