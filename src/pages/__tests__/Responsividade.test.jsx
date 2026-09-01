import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import { ColorModeProvider } from '../../contexts/ColorModeContext'

// --- MOCK: AuthContext ---
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'test-id', email: 'test@test.com' }, logout: vi.fn() }),
}))

// --- MOCK: Outlet (react-router-dom) ---
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">page content</div>,
  }
})

// O shell lê tokens customizados do tema (palette.surfaces/lines) e o modo
// claro/escuro — em produção ele sempre vive sob o ColorModeProvider.
function renderLayout() {
  return render(
    <ColorModeProvider>
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    </ColorModeProvider>
  )
}

describe('Responsividade — Layout e Sidebar', () => {
  // --- Teste 1 --- Sidebar possui data-testid="sidebar"
  it('Sidebar possui data-testid="sidebar" renderizado no DOM', () => {
    renderLayout()
    const sidebars = screen.getAllByTestId('sidebar')
    expect(sidebars.length).toBeGreaterThanOrEqual(1)
  })

  // --- Teste 1b --- Regressao: a 220px, logo + 3 controles nao cabiam na
  // mesma linha e o `overflow: hidden` do drawer cortava o avatar (ultimo da
  // fila). O avatar precisa ficar FORA da linha da logo.
  it('Avatar do usuário não divide a linha da logo na sidebar', () => {
    renderLayout()
    const sidebar = screen.getAllByTestId('sidebar')[0]
    const logo = within(sidebar).getByTestId('logo-pondero')
    const avatar = within(sidebar).getAllByTestId('user-menu')[0]
    expect(sidebar).toContainElement(avatar)
    expect(logo.parentElement).not.toContainElement(avatar)
  })

  // --- Teste 2 --- Botão hamburger está no DOM
  it('Layout possui botão data-testid="menu-toggle" para abrir sidebar', () => {
    renderLayout()
    expect(screen.getByTestId('menu-toggle')).toBeInTheDocument()
  })

  // --- Teste 3 --- Clicar no hamburger muda aria-expanded de false → true
  it('Clicar em menu-toggle altera aria-expanded de "false" para "true"', async () => {
    const user = userEvent.setup()
    renderLayout()
    const toggle = screen.getByTestId('menu-toggle')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
  })

  // --- Teste 4 --- AppBar com data-testid="app-bar" está no DOM
  it('Layout possui AppBar com data-testid="app-bar"', () => {
    renderLayout()
    expect(screen.getByTestId('app-bar')).toBeInTheDocument()
  })

  // --- Teste 5 --- Toggle funciona em ciclo completo (abrir e fechar)
  it('menu-toggle funciona como toggle: abrir e depois fechar (aria-expanded ciclo)', async () => {
    const user = userEvent.setup()
    renderLayout()
    const toggle = screen.getByTestId('menu-toggle')

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  // --- Teste 6 --- Alternador de tema disponível no shell, com nome acessível
  it('Layout expõe o alternador de tema com nome acessível', () => {
    renderLayout()
    const alternadores = screen.getAllByTestId('theme-toggle')
    expect(alternadores.length).toBeGreaterThanOrEqual(1)
    expect(alternadores[0]).toHaveAccessibleName(/tema (claro|escuro)/i)
  })
})
