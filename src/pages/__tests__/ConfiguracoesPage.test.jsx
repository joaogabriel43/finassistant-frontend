import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import Configuracoes from '../Configuracoes'

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockService = vi.hoisted(() => ({
  getPerfil: vi.fn(),
  atualizarPerfil: vi.fn(),
  alterarSenha: vi.fn(),
  getPreferencias: vi.fn(),
  atualizarPreferencias: vi.fn(),
  uploadFoto: vi.fn(),
  desativarConta: vi.fn(),
}))

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'uuid-1', nome: 'Joao Silva', email: 'joao@example.com', fotoUrl: null },
    logout: vi.fn(),
    updateUser: vi.fn(),
  }),
}))

vi.mock('../../contexts/ColorModeContext', () => ({
  useColorMode: () => ({ mode: 'dark', toggleMode: vi.fn(), setMode: vi.fn() }),
}))

vi.mock('../../services/configuracaoService', () => ({
  configuracaoService: mockService,
}))

// ── Setup ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  mockService.getPreferencias.mockResolvedValue({
    temaEscuro: true,
    notificacaoEmailAtiva: true,
    digestSemanalAtivo: true,
  })
})

// ── Testes ─────────────────────────────────────────────────────────────────

describe('Configuracoes — pagina de configuracoes', () => {

  it('renderiza o titulo e as 4 abas', () => {
    render(<Configuracoes />)
    expect(screen.getByText('Configuracoes')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Perfil' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Seguranca' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Notificacoes' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Conta' })).toBeInTheDocument()
  })

  it('aba Perfil exibe nome e email do usuario', () => {
    render(<Configuracoes />)
    expect(screen.getByDisplayValue('Joao Silva')).toBeInTheDocument()
    expect(screen.getByDisplayValue('joao@example.com')).toBeInTheDocument()
  })

  it('aba Perfil: erro se nome vazio ao salvar', async () => {
    render(<Configuracoes />)
    const nomeInput = screen.getByDisplayValue('Joao Silva')
    fireEvent.change(nomeInput, { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: /salvar perfil/i }))
    await waitFor(() => {
      expect(screen.getByText(/nome e email sao obrigatorios/i)).toBeInTheDocument()
    })
    expect(mockService.atualizarPerfil).not.toHaveBeenCalled()
  })

  it('aba Perfil: chama service ao salvar com dados validos', async () => {
    mockService.atualizarPerfil.mockResolvedValue({ nome: 'Joao Silva', email: 'joao@example.com' })
    render(<Configuracoes />)
    fireEvent.click(screen.getByRole('button', { name: /salvar perfil/i }))
    await waitFor(() => {
      expect(mockService.atualizarPerfil).toHaveBeenCalledWith('Joao Silva', 'joao@example.com')
    })
  })

  it('navega para aba Seguranca ao clicar', () => {
    render(<Configuracoes />)
    fireEvent.click(screen.getByRole('tab', { name: 'Seguranca' }))
    expect(screen.getByLabelText(/senha atual/i)).toBeInTheDocument()
    expect(screen.getAllByLabelText(/nova senha/i).length).toBeGreaterThan(0)
  })

  it('aba Seguranca: erro se nova senha diferente da confirmacao', async () => {
    render(<Configuracoes />)
    fireEvent.click(screen.getByRole('tab', { name: 'Seguranca' }))

    fireEvent.change(screen.getByLabelText(/senha atual/i), { target: { value: 'antiga123' } })
    const [novaSenhaInput] = screen.getAllByLabelText(/nova senha/i)
    fireEvent.change(novaSenhaInput, { target: { value: 'nova123' } })
    fireEvent.change(screen.getByLabelText(/confirmar nova senha/i), { target: { value: 'diferente' } })
    fireEvent.click(screen.getByRole('button', { name: /alterar senha/i }))

    await waitFor(() => {
      expect(screen.getByText(/nao coincidem/i)).toBeInTheDocument()
    })
    expect(mockService.alterarSenha).not.toHaveBeenCalled()
  })

  it('aba Seguranca: erro 422 exibe mensagem de senha incorreta', async () => {
    mockService.alterarSenha.mockRejectedValue({ response: { status: 422 } })
    render(<Configuracoes />)
    fireEvent.click(screen.getByRole('tab', { name: 'Seguranca' }))

    fireEvent.change(screen.getByLabelText(/senha atual/i), { target: { value: 'errada' } })
    const [novaSenhaInput422] = screen.getAllByLabelText(/nova senha/i)
    fireEvent.change(novaSenhaInput422, { target: { value: 'nova123' } })
    fireEvent.change(screen.getByLabelText(/confirmar nova senha/i), { target: { value: 'nova123' } })
    fireEvent.click(screen.getByRole('button', { name: /alterar senha/i }))

    await waitFor(() => {
      expect(screen.getByText(/senha atual incorreta/i)).toBeInTheDocument()
    })
  })

  it('aba Seguranca: erro se nova senha muito curta', async () => {
    render(<Configuracoes />)
    fireEvent.click(screen.getByRole('tab', { name: 'Seguranca' }))

    fireEvent.change(screen.getByLabelText(/senha atual/i), { target: { value: 'antiga123' } })
    const [novaSenhaCurta] = screen.getAllByLabelText(/nova senha/i)
    fireEvent.change(novaSenhaCurta, { target: { value: '123' } })
    fireEvent.change(screen.getByLabelText(/confirmar nova senha/i), { target: { value: '123' } })
    fireEvent.click(screen.getByRole('button', { name: /alterar senha/i }))

    await waitFor(() => {
      expect(screen.getByText(/pelo menos 6 caracteres/i)).toBeInTheDocument()
    })
  })

  it('aba Notificacoes carrega preferencias da API', async () => {
    render(<Configuracoes />)
    fireEvent.click(screen.getByRole('tab', { name: 'Notificacoes' }))
    await waitFor(() => {
      expect(mockService.getPreferencias).toHaveBeenCalled()
    })
    expect(screen.getByText(/tema escuro/i)).toBeInTheDocument()
  })

  it('aba Conta exibe botao de desativacao', () => {
    render(<Configuracoes />)
    fireEvent.click(screen.getByRole('tab', { name: 'Conta' }))
    expect(screen.getByRole('button', { name: /desativar minha conta/i })).toBeInTheDocument()
  })

  it('aba Conta: confirmacao dupla antes de desativar', async () => {
    render(<Configuracoes />)
    fireEvent.click(screen.getByRole('tab', { name: 'Conta' }))

    // Primeiro clique mostra confirmação
    fireEvent.click(screen.getByRole('button', { name: /desativar minha conta/i }))
    expect(screen.getByRole('button', { name: /confirmar desativacao/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
    expect(mockService.desativarConta).not.toHaveBeenCalled()
  })

  it('aba Conta: cancelar volta ao estado inicial', () => {
    render(<Configuracoes />)
    fireEvent.click(screen.getByRole('tab', { name: 'Conta' }))

    fireEvent.click(screen.getByRole('button', { name: /desativar minha conta/i }))
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))

    expect(screen.getByRole('button', { name: /desativar minha conta/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /confirmar desativacao/i })).not.toBeInTheDocument()
  })
})
