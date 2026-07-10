import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

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

  it('exibe chip de frequência bimestral', () => {
    const seguro = { ...recorrenciaNetflix, nome: 'Seguro Carro', frequencia: 'BIMESTRAL' }
    render(<RecorrenciasCard recorrencias={[seguro]} />)

    expect(screen.getByText(/bimestral/i)).toBeInTheDocument()
  })

  it('exibe badge de nível de confiança quando presente', () => {
    const comConfianca = { ...recorrenciaNetflix, confianca: 'ALTA' }
    render(<RecorrenciasCard recorrencias={[comConfianca]} />)

    expect(screen.getByText(/alta confiança/i)).toBeInTheDocument()
  })

  it('não exibe badge de confiança quando o campo está ausente', () => {
    render(<RecorrenciasCard recorrencias={[recorrenciaNetflix]} />)

    expect(screen.queryByText(/confiança/i)).not.toBeInTheDocument()
  })

  it('marca visualmente assinatura possivelmente cancelada', () => {
    const cancelada = { ...recorrenciaNetflix, possivelmenteCancelada: true }
    render(<RecorrenciasCard recorrencias={[cancelada]} />)

    expect(screen.getByText(/possivelmente cancelada/i)).toBeInTheDocument()
  })

  it('exibe indicador de aumento de valor com o valor anterior', () => {
    const aumentou = {
      ...recorrenciaNetflix,
      aumentouValor: true,
      valorAnterior: 30.0,
    }
    render(<RecorrenciasCard recorrencias={[aumentou]} />)

    expect(screen.getByText(/valor subiu/i)).toBeInTheDocument()
    expect(screen.getByText(/antes R\$/i)).toBeInTheDocument()
  })

  it('exibe o total mensal comprometido quando informado', () => {
    render(
      <RecorrenciasCard
        recorrencias={[recorrenciaNetflix]}
        totalMensalComprometido={216.67}
      />
    )

    expect(screen.getByText(/comprometido\/mês/i)).toBeInTheDocument()
    expect(screen.getByText(/216,67/)).toBeInTheDocument()
  })

  it('não exibe o total mensal quando é zero', () => {
    render(
      <RecorrenciasCard
        recorrencias={[recorrenciaNetflix]}
        totalMensalComprometido={0}
      />
    )

    expect(screen.queryByText(/comprometido\/mês/i)).not.toBeInTheDocument()
  })
})
