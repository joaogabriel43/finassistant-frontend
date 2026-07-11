import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import RemoverAtivoDialog from '../RemoverAtivoDialog';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('../../../services/investimentoService', () => ({
  investimentoService: {
    removerAtivo: vi.fn(),
  },
}));

import { investimentoService } from '../../../services/investimentoService';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const ativo = { ticker: 'VALE3', quantidade: 50, precoMedio: 61.2 };

const renderDialog = (props = {}) =>
  render(
    <RemoverAtivoDialog
      open
      ativo={ativo}
      onClose={vi.fn()}
      onRemoved={vi.fn()}
      {...props}
    />,
  );

beforeEach(() => {
  vi.clearAllMocks();
  investimentoService.removerAtivo.mockResolvedValue(undefined);
});

// ─── Testes ──────────────────────────────────────────────────────────────────

describe('RemoverAtivoDialog', () => {
  it('exibe a confirmação com o ticker do ativo', () => {
    renderDialog();

    expect(screen.getByTestId('remover-ativo-dialog')).toBeInTheDocument();
    expect(screen.getByText(/tem certeza que deseja remover vale3/i)).toBeInTheDocument();
    expect(screen.getByText(/não pode ser desfeita/i)).toBeInTheDocument();
  });

  it('chama o DELETE ao confirmar e notifica o pai', async () => {
    const onClose = vi.fn();
    const onRemoved = vi.fn();
    renderDialog({ onClose, onRemoved });

    fireEvent.click(screen.getByTestId('btn-confirmar-remocao-ativo'));

    await waitFor(() => {
      expect(investimentoService.removerAtivo).toHaveBeenCalledWith('VALE3');
    });

    expect(onRemoved).toHaveBeenCalledWith(expect.stringContaining('VALE3'));
    expect(onClose).toHaveBeenCalled();
  });

  it('não chama o DELETE ao cancelar', () => {
    const onClose = vi.fn();
    renderDialog({ onClose });

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(investimentoService.removerAtivo).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('exibe mensagem específica quando a API retorna 404 e não notifica o pai', async () => {
    const onRemoved = vi.fn();
    investimentoService.removerAtivo.mockRejectedValue({
      response: { status: 404, data: { status: 404, error: 'Not Found' } },
    });
    renderDialog({ onRemoved });

    fireEvent.click(screen.getByTestId('btn-confirmar-remocao-ativo'));

    expect(await screen.findByText(/ativo não encontrado no portfólio/i)).toBeInTheDocument();
    expect(onRemoved).not.toHaveBeenCalled();
  });
});
