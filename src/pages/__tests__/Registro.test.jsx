import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Registro from '../Registro';

vi.mock('../../services/authService', () => ({
  default: { registrar: vi.fn() },
}));
vi.mock('../../services/api', () => ({
  default: { post: vi.fn() },
}));

import authService from '../../services/authService';

const renderRegistro = () =>
  render(
    <MemoryRouter>
      <Registro />
    </MemoryRouter>
  );

const preencher = ({ email = 'novo@test.com', senha = 'senha123', aceitar = true } = {}) => {
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: email } });
  fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: senha } });
  if (aceitar) fireEvent.click(screen.getByRole('checkbox'));
};

describe('Registro — política de senha (ADR-028)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exibe o checklist da política de senha', () => {
    renderRegistro();
    expect(screen.getByText(/mínimo de 8 caracteres/i)).toBeInTheDocument();
    expect(screen.getByText(/pelo menos 1 letra/i)).toBeInTheDocument();
    expect(screen.getByText(/pelo menos 1 número/i)).toBeInTheDocument();
  });

  it('botão fica desabilitado com senha fora da política, mesmo com termos aceitos', () => {
    renderRegistro();
    preencher({ senha: 'abc' });
    expect(screen.getByRole('button', { name: /criar conta/i })).toBeDisabled();
    expect(authService.registrar).not.toHaveBeenCalled();
  });

  it('botão habilita com senha válida + termos aceitos e o registro é chamado', async () => {
    authService.registrar.mockResolvedValueOnce({});
    renderRegistro();
    preencher({ senha: 'senha123' });

    const botao = screen.getByRole('button', { name: /criar conta/i });
    expect(botao).toBeEnabled();

    fireEvent.click(botao);
    await waitFor(() =>
      expect(authService.registrar).toHaveBeenCalledWith('novo@test.com', 'senha123')
    );
  });

  it('400 do backend (política de senha) exibe a mensagem do Bean Validation', async () => {
    authService.registrar.mockRejectedValueOnce({
      response: {
        status: 400,
        data: { fields: { senha: 'A senha deve ter no mínimo 8 caracteres, incluindo pelo menos 1 letra e 1 número.' } },
      },
    });
    renderRegistro();
    preencher({ senha: 'senha123' });
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));

    expect(await screen.findByText(/no mínimo 8 caracteres/i)).toBeInTheDocument();
  });

  it('429 do rate limit exibe a mensagem do backend com tempo de espera', async () => {
    authService.registrar.mockRejectedValueOnce({
      response: {
        status: 429,
        data: { erro: 'RATE_LIMIT', mensagem: 'Muitas tentativas. Tente novamente em 3600 segundos.' },
      },
    });
    renderRegistro();
    preencher({ senha: 'senha123' });
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));

    expect(await screen.findByText(/muitas tentativas/i)).toBeInTheDocument();
  });
});
