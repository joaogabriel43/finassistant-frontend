import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import ThemeToggle from '../ThemeToggle'
import { ColorModeProvider } from '../../../contexts/ColorModeContext'
import { COLOR_MODE_STORAGE_KEY } from '../../../contexts/colorMode'

const renderToggle = () =>
  render(
    <ColorModeProvider>
      <ThemeToggle />
    </ColorModeProvider>,
  )

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    // O polyfill de setupTests.js devolve matches:false → dispositivo escuro.
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }))
  })

  it('expõe um nome acessível que descreve a ação disponível', () => {
    renderToggle()
    expect(screen.getByRole('button', { name: /tema claro/i })).toBeInTheDocument()
  })

  it('alterna o tema ao ser acionado e atualiza o nome acessível', async () => {
    const user = userEvent.setup()
    renderToggle()

    await user.click(screen.getByRole('button', { name: /tema claro/i }))

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /tema escuro/i })).toBeInTheDocument(),
    )
    expect(localStorage.getItem(COLOR_MODE_STORAGE_KEY)).toBe('light')
  })

  it('é acionável pelo teclado', async () => {
    const user = userEvent.setup()
    renderToggle()

    await user.tab()
    expect(screen.getByRole('button', { name: /tema claro/i })).toHaveFocus()
    await user.keyboard('{Enter}')

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /tema escuro/i })).toBeInTheDocument(),
    )
  })
})
