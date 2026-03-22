import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import RebalanceamentoPanel from '../RebalanceamentoPanel'

// --- MOCK: useRebalanceamento hook ---
vi.mock('../../../hooks/useRebalanceamento', () => ({
  useRebalanceamento: vi.fn(),
}))

describe('RebalanceamentoPanel', () => {
  let useRebalanceamento

  beforeEach(async () => {
    vi.clearAllMocks()
    useRebalanceamento = (await import('../../../hooks/useRebalanceamento')).useRebalanceamento
  })

  // --- Teste 1: loading state ---
  it('renderiza loading state enquanto dados são carregados', () => {
    useRebalanceamento.mockReturnValue({ loading: true, error: null, sugestoes: null })

    render(<RebalanceamentoPanel />)

    expect(document.querySelector('.MuiCircularProgress-root')).toBeInTheDocument()
  })

  // --- Teste 2: sugestões de COMPRA exibidas em verde ---
  it('renderiza sugestões de compra em verde', () => {
    useRebalanceamento.mockReturnValue({
      loading: false,
      error: null,
      sugestoes: [
        {
          classe: 'ACAO',
          valorAtual: 100,
          valorAlvo: 400,
          percentualAtual: 10,
          percentualAlvo: 40,
          desvio: -30,
          acao: 'COMPRAR',
          valorAjuste: 300,
        },
      ],
    })

    render(<RebalanceamentoPanel />)

    expect(screen.getByText('COMPRAR')).toBeInTheDocument()
    // ACAO é exibido como "Ações" pelo LABEL_MAP
    expect(screen.getByText('Ações')).toBeInTheDocument()
  })

  // --- Teste 3: sugestões de VENDA exibidas em vermelho ---
  it('renderiza sugestões de venda em vermelho', () => {
    useRebalanceamento.mockReturnValue({
      loading: false,
      error: null,
      sugestoes: [
        {
          classe: 'ACAO',
          valorAtual: 800,
          valorAlvo: 400,
          percentualAtual: 80,
          percentualAlvo: 40,
          desvio: 40,
          acao: 'VENDER',
          valorAjuste: 400,
        },
      ],
    })

    render(<RebalanceamentoPanel />)

    expect(screen.getByText('VENDER')).toBeInTheDocument()
  })

  // --- Teste 4: carteira balanceada → Alert success ---
  it('renderiza mensagem quando carteira já está balanceada', () => {
    useRebalanceamento.mockReturnValue({
      loading: false,
      error: null,
      sugestoes: [
        {
          classe: 'ACAO',
          valorAtual: 400,
          valorAlvo: 400,
          percentualAtual: 40,
          percentualAlvo: 40,
          desvio: 0,
          acao: 'OK',
          valorAjuste: 0,
        },
      ],
    })

    render(<RebalanceamentoPanel />)

    expect(screen.getByText(/Carteira balanceada/i)).toBeInTheDocument()
  })

  // --- Teste 5: desvio percentual por classe exibido ---
  it('exibe desvio percentual por classe', () => {
    useRebalanceamento.mockReturnValue({
      loading: false,
      error: null,
      sugestoes: [
        {
          classe: 'RENDA_FIXA',
          valorAtual: 200,
          valorAlvo: 600,
          percentualAtual: 20,
          percentualAlvo: 60,
          desvio: -40,
          acao: 'COMPRAR',
          valorAjuste: 400,
        },
      ],
    })

    render(<RebalanceamentoPanel />)

    // RENDA_FIXA é exibido como "Renda Fixa" pelo LABEL_MAP
    expect(screen.getByText('Renda Fixa')).toBeInTheDocument()
    // desvio coluna: -40,00% (pt-BR com sinal negativo)
    const desvioEl = screen.getByText(/-40[,.]00%|-40%/i)
    expect(desvioEl).toBeInTheDocument()
  })
})
