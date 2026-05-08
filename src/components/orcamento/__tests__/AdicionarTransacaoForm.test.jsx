import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import AdicionarTransacaoForm from '../AdicionarTransacaoForm'

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-123' } }),
}))

vi.mock('../../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

vi.mock('react-select/creatable', () => ({
  default: ({ onChange, placeholder }) => (
    <input
      data-testid="categoria-select"
      placeholder={placeholder}
      onChange={(e) => onChange({ value: e.target.value, label: e.target.value })}
    />
  ),
}))

import api from '../../../services/api'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const hoje = () => new Date().toISOString().split('T')[0] // "yyyy-MM-dd"

// Preenche os campos obrigatórios que JÁ existem no formulário.
const preencherCamposBase = async () => {
  fireEvent.change(screen.getByLabelText(/Valor/i), { target: { value: '100' } })
  fireEvent.change(screen.getByTestId('categoria-select'), {
    target: { value: 'alimentacao' },
  })
  fireEvent.change(screen.getByLabelText(/Descrição/i), {
    target: { value: 'almoço' },
  })
}

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  // api.get para categorias — retorna lista vazia por padrão
  api.get.mockResolvedValue({ data: [] })
  // api.post para transação — simula sucesso por padrão
  api.post.mockResolvedValue({ data: {} })
})

// ─── Testes (RED — todos devem FALHAR porque o campo de data não existe) ─────

describe('AdicionarTransacaoForm — campo de data (RED)', () => {
  it('deve renderizar campo de data com valor padrão igual a hoje', () => {
    render(<AdicionarTransacaoForm />)

    // Espera um input type="date" OU um input com aria-label/label relacionado a "data"
    const campoData =
      document.querySelector('input[type="date"]') ||
      screen.queryByLabelText(/data/i) ||
      screen.queryByPlaceholderText(/data/i)

    expect(campoData).not.toBeNull()
    expect(campoData.value).toBe(hoje())
  })

  it('deve incluir data de hoje no payload quando não alterada', async () => {
    render(<AdicionarTransacaoForm />)

    await preencherCamposBase()

    fireEvent.click(screen.getByRole('button', { name: /adicionar/i }))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        `/orcamento/transacao/user-123`,
        expect.objectContaining({ data: hoje() })
      )
    })
  })

  it('deve incluir data customizada no payload quando alterada pelo usuário', async () => {
    render(<AdicionarTransacaoForm />)

    await preencherCamposBase()

    // Altera o campo de data para uma data passada específica
    const campoData =
      document.querySelector('input[type="date"]') ||
      screen.queryByLabelText(/data/i)

    expect(campoData).not.toBeNull()

    fireEvent.change(campoData, { target: { value: '2026-05-01' } })

    fireEvent.click(screen.getByRole('button', { name: /adicionar/i }))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        `/orcamento/transacao/user-123`,
        expect.objectContaining({ data: '2026-05-01' })
      )
    })
  })

  it('deve impedir submit com data futura', async () => {
    render(<AdicionarTransacaoForm />)

    await preencherCamposBase()

    const campoData =
      document.querySelector('input[type="date"]') ||
      screen.queryByLabelText(/data/i)

    expect(campoData).not.toBeNull()

    fireEvent.change(campoData, { target: { value: '2030-12-31' } })

    fireEvent.click(screen.getByRole('button', { name: /adicionar/i }))

    // Após o submit, a validação deve impedir o envio
    // O erro pode aparecer em um Alert ou a API não deve ter sido chamada
    await waitFor(() => {
      expect(api.post).not.toHaveBeenCalled()
    })
  })
})
