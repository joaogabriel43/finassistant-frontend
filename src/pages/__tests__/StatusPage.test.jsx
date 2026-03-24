import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import StatusPage from '../StatusPage'

vi.mock('../../hooks/useStatusPage', () => ({
  useStatusPage: vi.fn(),
}))

import { useStatusPage } from '../../hooks/useStatusPage'

const mockServicos = [
  { nome: 'Gemini AI', status: 'OPERACIONAL', latenciaMs: 320, ultimaVerificacao: '14:30:00', mensagem: 'Resposta em 320ms' },
  { nome: 'Database', status: 'OPERACIONAL', latenciaMs: 12, ultimaVerificacao: '14:30:00', mensagem: 'Conexao OK' },
]

describe('StatusPage', () => {
  const mockRefetch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar todos os servicos operacionais', () => {
    useStatusPage.mockReturnValue({ servicos: mockServicos, loading: false, error: null, refetch: mockRefetch })
    render(<StatusPage />)

    expect(screen.getByText('Gemini AI')).toBeInTheDocument()
    expect(screen.getByText('Database')).toBeInTheDocument()
    expect(screen.getByText('Todos os sistemas operacionais')).toBeInTheDocument()
    expect(screen.getAllByTestId('servico-card')).toHaveLength(2)
  })

  it('deve exibir status degradado quando servico com problemas', () => {
    const degraded = [
      { nome: 'Gemini AI', status: 'DEGRADADO', latenciaMs: 3200, ultimaVerificacao: '14:30:00', mensagem: 'Resposta em 3200ms' },
      { nome: 'Database', status: 'OPERACIONAL', latenciaMs: 12, ultimaVerificacao: '14:30:00', mensagem: 'Conexao OK' },
    ]
    useStatusPage.mockReturnValue({ servicos: degraded, loading: false, error: null, refetch: mockRefetch })
    render(<StatusPage />)

    expect(screen.getByText('Alguns servicos com problemas')).toBeInTheDocument()
    expect(screen.getByText('Degradado')).toBeInTheDocument()
  })

  it('deve exibir latencia dos servicos', () => {
    useStatusPage.mockReturnValue({ servicos: mockServicos, loading: false, error: null, refetch: mockRefetch })
    render(<StatusPage />)

    expect(screen.getByText('320ms')).toBeInTheDocument()
    expect(screen.getByText('12ms')).toBeInTheDocument()
  })

  it('deve chamar refetch ao clicar em refresh', () => {
    useStatusPage.mockReturnValue({ servicos: mockServicos, loading: false, error: null, refetch: mockRefetch })
    render(<StatusPage />)

    fireEvent.click(screen.getByTestId('refresh-btn'))
    expect(mockRefetch).toHaveBeenCalledTimes(1)
  })
})
