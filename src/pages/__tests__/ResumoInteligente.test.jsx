import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import theme from '../../theme'
import ResumoInteligente from '../ResumoInteligente'
import useResumoInteligente from '../../hooks/useResumoInteligente'

vi.mock('../../hooks/useResumoInteligente', () => ({
  default: vi.fn(),
}))

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}))

const gerarMock = vi.fn()

const baseResumo = {
  mes: 7, ano: 2026, modoDireto: false, geradoComIa: true,
  narrativa: 'Seu mês foi de altos e baixos.',
  topInsights: [
    { tipo: 'ALERTA', titulo: 'Alimentação subiu 30%', texto: 'Gastou mais.',
      porQue: 'De R$ 400,00 para R$ 520,00 (+30.0%)', relevancia: 90 },
  ],
  outrosInsights: [
    { tipo: 'CONQUISTA', titulo: 'Transporte caiu 50%', texto: 'Economizou.',
      porQue: 'economia de R$ 100,00', relevancia: 40 },
  ],
  disclaimer: 'Análise informativa gerada a partir dos seus lançamentos.',
}

const mockHook = (over = {}) =>
  useResumoInteligente.mockReturnValue({
    resumo: baseResumo, loading: false, error: null, gerar: gerarMock, ...over,
  })

// A pagina le tokens customizados do tema (palette.lines / palette.surfaces),
// entao precisa do ThemeProvider no teste — regra do design system.
const renderPage = () =>
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={['/resumo']}>
        <ResumoInteligente />
      </MemoryRouter>
    </ThemeProvider>
  )

// O MUI Switch renderiza um <input type="checkbox"> — pega direto pelo type
// (evita ambiguidade de role no ambiente jsdom).
const getToggle = (container) => container.querySelector('input[type="checkbox"]')

beforeEach(() => {
  vi.clearAllMocks()
  mockHook()
})

describe('ResumoInteligente', () => {
  it('renderiza o título da feature', () => {
    renderPage()
    expect(screen.getByText(/Resumo Inteligente do Período/i)).toBeInTheDocument()
  })

  it('dispara gerar() ao montar com mês/ano correntes e modoDireto=false', async () => {
    renderPage()
    await waitFor(() => expect(gerarMock).toHaveBeenCalled())
    const [, , modoDireto] = gerarMock.mock.calls[0]
    expect(modoDireto).toBe(false)
  })

  it('exibe a narrativa da IA quando geradoComIa é true', () => {
    renderPage()
    expect(screen.getByText('Seu mês foi de altos e baixos.')).toBeInTheDocument()
  })

  it('mostra top insight e o insight secundário', () => {
    renderPage()
    expect(screen.getByText('Alimentação subiu 30%')).toBeInTheDocument()
    expect(screen.getByText('Transporte caiu 50%')).toBeInTheDocument()
  })

  it('botão "por quê?" revela a explicação com os números', () => {
    renderPage()
    // O porQue começa oculto (Collapse)
    const botoes = screen.getAllByRole('button', { name: /por quê/i })
    fireEvent.click(botoes[0])
    expect(screen.getByText(/De R\$ 400,00 para R\$ 520,00/)).toBeInTheDocument()
  })

  it('toggle "modo direto" re-dispara gerar() com modoDireto=true', async () => {
    const { container } = renderPage()
    await waitFor(() => expect(gerarMock).toHaveBeenCalled())
    gerarMock.mockClear()

    fireEvent.click(getToggle(container))

    await waitFor(() => expect(gerarMock).toHaveBeenCalled())
    const ultimaChamada = gerarMock.mock.calls[gerarMock.mock.calls.length - 1]
    expect(ultimaChamada[2]).toBe(true)
  })

  it('renderiza o disclaimer', () => {
    renderPage()
    expect(screen.getByText(/Análise informativa/i)).toBeInTheDocument()
  })

  it('estado vazio quando não há insights', () => {
    mockHook({ resumo: { ...baseResumo, topInsights: [], outrosInsights: [], narrativa: null, geradoComIa: false } })
    renderPage()
    expect(screen.getByText(/Nenhum destaque relevante/i)).toBeInTheDocument()
  })
})
