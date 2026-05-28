import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// RecorrenciasCard ainda não existe — import intencional para causar falha (RED phase TDD)
import RecorrenciasCard from '../RecorrenciasCard'

const recorrenciaNetflix = {
  nome: 'Netflix',
  valorMedio: 45.90,
  frequencia: 'MENSAL',
  diaRecorrente: 15,
  proximaCobrancaEstimada: '2026-06-15',
  totalOcorrencias: 3,
}

describe('RecorrenciasCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza lista de assinaturas detectadas', () => {
    render(<RecorrenciasCard recorrencias={[recorrenciaNetflix]} />)

    expect(screen.getByText('Netflix')).toBeInTheDocument()
  })

  it('cada item mostra nome, valor e dia do mês', () => {
    render(<RecorrenciasCard recorrencias={[recorrenciaNetflix]} />)

    expect(screen.getByText('Netflix')).toBeInTheDocument()
    expect(screen.getByText(/R\$/)).toBeInTheDocument()
    expect(screen.getByText(/dia 15/i)).toBeInTheDocument()
  })

  it('exibe chip de frequência', () => {
    render(<RecorrenciasCard recorrencias={[recorrenciaNetflix]} />)

    // Aceita tanto "Mensal" quanto "MENSAL" dependendo de como o componente formatar
    expect(screen.getByText(/mensal/i)).toBeInTheDocument()
  })

  it('estado vazio exibe mensagem quando lista está vazia', () => {
    render(<RecorrenciasCard recorrencias={[]} />)

    // Deve exibir alguma mensagem informando ausência de recorrências detectadas
    expect(
      screen.getByText(/nenhuma|detectada/i)
    ).toBeInTheDocument()
  })

  it('renderiza estado de loading com skeletons', () => {
    render(<RecorrenciasCard recorrencias={[]} loading={true} />)

    // Aceita role="progressbar" (CircularProgress do MUI), aria-label="loading", ou data-testid
    const loadingElement =
      screen.queryByRole('progressbar') ||
      screen.queryByLabelText(/loading/i) ||
      screen.queryByTestId('recorrencias-loading')

    expect(loadingElement).not.toBeNull()
  })
})
