import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// ← RED: ExclusaoContaModal.jsx não existe ainda
import ExclusaoContaModal from './ExclusaoContaModal'

vi.mock('../services/api', () => ({
  default: {
    delete: vi.fn().mockResolvedValue({ data: null }),
  },
}))

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'test-uuid', email: 'test@test.com' },
    logout: vi.fn(),
  })),
}))

// ExclusaoContaModal usa useNavigate para redirect após exclusão
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(() => vi.fn()),
}))

import api from '../services/api'

describe('ExclusaoContaModal', () => {
  const onClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 1. Renderiza quando open=true
  it('renderiza aviso de exclusão permanente quando open=true', () => {
    render(<ExclusaoContaModal open={true} onClose={onClose} />)

    // data-testid evita múltiplos matches de texto entre elementos pai/filho
    expect(screen.getByTestId('exclusao-titulo')).toBeInTheDocument()
    expect(screen.getByTestId('exclusao-titulo')).toHaveTextContent(/permanente|excluir conta/i)
  })

  // 2. Campo de confirmação presente com instrução de digitar "EXCLUIR"
  it('exibe campo pedindo para digitar EXCLUIR', () => {
    render(<ExclusaoContaModal open={true} onClose={onClose} />)

    // Busca em todos os elementos — "Digite" + "EXCLUIR" podem estar em elementos separados
    const elementos = screen.getAllByText(/EXCLUIR/i)
    expect(elementos.length).toBeGreaterThan(0)
  })

  // 3. Botão confirmar desabilitado até texto correto
  it('botão de confirmar desabilitado quando campo está vazio', () => {
    render(<ExclusaoContaModal open={true} onClose={onClose} />)

    const confirmarBtn = screen.getByRole('button', { name: /excluir.*conta|confirmar/i })
    expect(confirmarBtn).toBeDisabled()
  })

  it('botão de confirmar desabilitado com texto errado', () => {
    render(<ExclusaoContaModal open={true} onClose={onClose} />)

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'excluir' } }) // minúsculas

    const confirmarBtn = screen.getByRole('button', { name: /excluir.*conta|confirmar/i })
    expect(confirmarBtn).toBeDisabled()
  })

  it('botão de confirmar habilitado quando texto é exatamente "EXCLUIR"', () => {
    render(<ExclusaoContaModal open={true} onClose={onClose} />)

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'EXCLUIR' } })

    const confirmarBtn = screen.getByRole('button', { name: /excluir.*conta|confirmar/i })
    expect(confirmarBtn).not.toBeDisabled()
  })

  // 4. Confirmar chama DELETE /api/conta com { confirmacao: "EXCLUIR" }
  it('ao confirmar chama DELETE /api/conta com corpo { confirmacao: "EXCLUIR" }', async () => {
    render(<ExclusaoContaModal open={true} onClose={onClose} />)

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'EXCLUIR' } })
    fireEvent.click(screen.getByRole('button', { name: /excluir.*conta|confirmar/i }))

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith(
        '/conta',
        expect.objectContaining({
          data: expect.objectContaining({ confirmacao: 'EXCLUIR' }),
        })
      )
    })
  })

  // 5. Botão cancelar fecha o modal
  it('botão Cancelar chama onClose', () => {
    render(<ExclusaoContaModal open={true} onClose={onClose} />)

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
