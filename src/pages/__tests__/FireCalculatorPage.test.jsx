import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import FireCalculator from '../FireCalculator'

// --- MOCK: AuthContext ---
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

// --- MOCK: useFireCalculator hook ---
vi.mock('../../hooks/useFireCalculator', () => ({
  useFireCalculator: vi.fn(),
}))

// --- MOCK: recharts (ResponsiveContainer precisa de dimensões reais em jsdom) ---
vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    ResponsiveContainer: ({ children }) => (
      <div style={{ width: 400, height: 300 }}>{children}</div>
    ),
  }
})

describe('FireCalculatorPage', () => {
  let useAuth
  let useFireCalculator

  beforeEach(async () => {
    vi.clearAllMocks()
    useAuth = (await import('../../contexts/AuthContext')).useAuth
    useFireCalculator = (await import('../../hooks/useFireCalculator')).useFireCalculator

    useAuth.mockReturnValue({
      user: { id: 'abc-123', email: 'test@fortunai.com' },
    })
  })

  // --- Teste 1: renderiza formulário com todos os campos ---
  it('renderiza formulário com todos os campos necessários', () => {
    useFireCalculator.mockReturnValue({
      loading: false,
      error: null,
      resultado: null,
      calcular: vi.fn(),
    })

    render(<FireCalculator />)

    // campos do formulário
    expect(screen.getByLabelText(/patrimônio atual/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/aporte mensal/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/despesa mensal/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/idade atual/i)).toBeInTheDocument()

    // botão de calcular
    expect(screen.getByRole('button', { name: /calcular/i })).toBeInTheDocument()
  })

  // --- Teste 2: chama calcular ao submeter o formulário ---
  it('chama a função calcular ao submeter o formulário', async () => {
    const mockCalcular = vi.fn()
    useFireCalculator.mockReturnValue({
      loading: false,
      error: null,
      resultado: null,
      calcular: mockCalcular,
    })

    render(<FireCalculator />)

    fireEvent.change(screen.getByLabelText(/patrimônio atual/i), {
      target: { value: '100000' },
    })
    fireEvent.change(screen.getByLabelText(/aporte mensal/i), {
      target: { value: '2000' },
    })
    fireEvent.change(screen.getByLabelText(/despesa mensal/i), {
      target: { value: '5000' },
    })
    fireEvent.change(screen.getByLabelText(/idade atual/i), {
      target: { value: '30' },
    })

    fireEvent.click(screen.getByRole('button', { name: /calcular/i }))

    await waitFor(() => {
      expect(mockCalcular).toHaveBeenCalledOnce()
    })
  })

  // --- Teste 3: exibe anos até FIRE em destaque no resultado ---
  it('exibe anos até FIRE em destaque após calcular', () => {
    useFireCalculator.mockReturnValue({
      loading: false,
      error: null,
      resultado: {
        metaPatrimonioFIRE: 1500000,
        patrimonioAtual: 100000,
        aporteMensal: 2000,
        anosAteFireConservador: 25,
        anosAteFireModerado: 20,
        anosAteFireArrojado: 14,
        idadeFireConservador: 55,
        idadeFireModerado: 50,
        idadeFireArrojado: 44,
        percentualAtingido: 6.67,
      },
      calcular: vi.fn(),
    })

    render(<FireCalculator />)

    // anos deve aparecer em algum lugar da seção de resultado (Math.ceil de inteiro = mesmo valor)
    expect(screen.getByText('20')).toBeInTheDocument() // moderado = 20 anos
    expect(screen.getByText('14')).toBeInTheDocument() // arrojado = 14 anos
  })

  // --- Teste 4: exibe patrimônio FIRE necessário formatado ---
  it('exibe meta FIRE formatada em BRL', () => {
    useFireCalculator.mockReturnValue({
      loading: false,
      error: null,
      resultado: {
        metaPatrimonioFIRE: 1500000,
        patrimonioAtual: 100000,
        aporteMensal: 2000,
        anosAteFireConservador: 25,
        anosAteFireModerado: 20,
        anosAteFireArrojado: 14,
        idadeFireConservador: 55,
        idadeFireModerado: 50,
        idadeFireArrojado: 44,
        percentualAtingido: 6.67,
      },
      calcular: vi.fn(),
    })

    render(<FireCalculator />)

    // meta FIRE deve aparecer formatada (R$ 1.500.000 ou similar)
    expect(screen.getByText(/1\.500\.000|1,500,000/)).toBeInTheDocument()
  })

  // --- Teste 5: mostra projeção por perfil (3 cards) ---
  it('mostra projeção para os 3 perfis (conservador, moderado, arrojado)', () => {
    useFireCalculator.mockReturnValue({
      loading: false,
      error: null,
      resultado: {
        metaPatrimonioFIRE: 1500000,
        patrimonioAtual: 100000,
        aporteMensal: 2000,
        anosAteFireConservador: 25,
        anosAteFireModerado: 20,
        anosAteFireArrojado: 14,
        idadeFireConservador: 55,
        idadeFireModerado: 50,
        idadeFireArrojado: 44,
        percentualAtingido: 6.67,
      },
      calcular: vi.fn(),
    })

    render(<FireCalculator />)

    expect(screen.getByText(/conservador/i)).toBeInTheDocument()
    expect(screen.getByText(/moderado/i)).toBeInTheDocument()
    expect(screen.getByText(/arrojado/i)).toBeInTheDocument()
  })
})
