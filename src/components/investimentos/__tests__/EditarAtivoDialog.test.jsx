import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import EditarAtivoDialog from '../EditarAtivoDialog';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('../../../services/investimentoService', () => ({
  investimentoService: {
    editarAtivo: vi.fn(),
  },
}));

import { investimentoService } from '../../../services/investimentoService';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const ativo = { ticker: 'PETR4', quantidade: 100, precoMedio: 32.5, tipoAtivo: 'ACAO' };

const renderDialog = (props = {}) =>
  render(
    <EditarAtivoDialog
      open
      ativo={ativo}
      onClose={vi.fn()}
      onSaved={vi.fn()}
      {...props}
    />,
  );

beforeEach(() => {
  vi.clearAllMocks();
  investimentoService.editarAtivo.mockResolvedValue({
    ticker: 'PETR4', quantidade: 150, precoMedio: 30, tipoAtivo: 'ACAO', dataCompra: '2026-01-15',
  });
});

// ─── Testes ──────────────────────────────────────────────────────────────────

describe('EditarAtivoDialog', () => {
  it('abre pré-preenchido com a quantidade e o preço médio atuais da posição', () => {
    renderDialog();

    expect(screen.getByTestId('editar-ativo-dialog')).toBeInTheDocument();
    expect(screen.getByText(/editar posição petr4/i)).toBeInTheDocument();
    expect(screen.getByTestId('input-editar-quantidade').value).toBe('100');
    expect(screen.getByTestId('input-editar-preco-medio').value).toBe('32.5');
  });

  it('chama o PUT com o payload correto e fecha o dialog após salvar', async () => {
    const onClose = vi.fn();
    const onSaved = vi.fn();
    renderDialog({ onClose, onSaved });

    fireEvent.change(screen.getByTestId('input-editar-quantidade'), { target: { value: '150' } });
    fireEvent.change(screen.getByTestId('input-editar-preco-medio'), { target: { value: '30' } });
    fireEvent.click(screen.getByTestId('btn-salvar-edicao-ativo'));

    await waitFor(() => {
      expect(investimentoService.editarAtivo).toHaveBeenCalledWith('PETR4', {
        quantidade: 150,
        precoMedio: 30,
      });
    });

    expect(onSaved).toHaveBeenCalledWith(expect.stringContaining('PETR4'));
    expect(onClose).toHaveBeenCalled();
  });

  it('bloqueia o PUT quando a quantidade é inválida', async () => {
    renderDialog();

    fireEvent.change(screen.getByTestId('input-editar-quantidade'), { target: { value: '0' } });
    fireEvent.click(screen.getByTestId('btn-salvar-edicao-ativo'));

    expect(await screen.findByText(/quantidade deve ser maior que zero/i)).toBeInTheDocument();
    expect(investimentoService.editarAtivo).not.toHaveBeenCalled();
  });

  it('bloqueia o PUT quando o preço médio é inválido', async () => {
    renderDialog();

    fireEvent.change(screen.getByTestId('input-editar-preco-medio'), { target: { value: '-1' } });
    fireEvent.click(screen.getByTestId('btn-salvar-edicao-ativo'));

    expect(await screen.findByText(/preço médio deve ser maior que zero/i)).toBeInTheDocument();
    expect(investimentoService.editarAtivo).not.toHaveBeenCalled();
  });

  it('exibe mensagem específica quando a API retorna 404 e mantém o dialog aberto', async () => {
    const onClose = vi.fn();
    const onSaved = vi.fn();
    investimentoService.editarAtivo.mockRejectedValue({
      response: { status: 404, data: { status: 404, error: 'Not Found' } },
    });
    renderDialog({ onClose, onSaved });

    fireEvent.click(screen.getByTestId('btn-salvar-edicao-ativo'));

    expect(await screen.findByText(/ativo não encontrado no portfólio/i)).toBeInTheDocument();
    expect(onSaved).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('pré-preenche os selects de classificação com os valores atuais do ativo', () => {
    renderDialog({
      ativo: {
        ...ativo,
        setor: 'FINANCEIRO',
        subsetor: 'BANCOS',
        geografia: 'BRASIL',
      },
    });

    expect(screen.getByTestId('select-setor')).toHaveValue('FINANCEIRO');
    expect(screen.getByTestId('select-subsetor')).toHaveValue('BANCOS');
    expect(screen.getByTestId('select-geografia')).toHaveValue('BRASIL');
  });

  it('inclui a classificação no PUT quando selecionada (semântica merge)', async () => {
    renderDialog();

    // Escolher subsetor sem setor → auto-preenche o setor pai
    fireEvent.mouseDown(screen.getByRole('combobox', { name: /subsetor/i }));
    fireEvent.click(screen.getByRole('option', { name: 'Mineração' }));
    expect(screen.getByTestId('select-setor')).toHaveValue('MATERIAIS_BASICOS');

    fireEvent.mouseDown(screen.getByRole('combobox', { name: /geografia/i }));
    fireEvent.click(screen.getByRole('option', { name: 'Estados Unidos' }));

    fireEvent.click(screen.getByTestId('btn-salvar-edicao-ativo'));

    await waitFor(() => {
      expect(investimentoService.editarAtivo).toHaveBeenCalledWith('PETR4', {
        quantidade: 100,
        precoMedio: 32.5,
        setor: 'MATERIAIS_BASICOS',
        subsetor: 'MINERACAO',
        geografia: 'EUA',
      });
    });
  });

  it('omite a classificação do PUT quando nada foi selecionado (mantém a atual)', async () => {
    renderDialog();

    fireEvent.click(screen.getByTestId('btn-salvar-edicao-ativo'));

    await waitFor(() => {
      expect(investimentoService.editarAtivo).toHaveBeenCalledTimes(1);
    });

    const payload = investimentoService.editarAtivo.mock.calls[0][1];
    expect(payload).not.toHaveProperty('setor');
    expect(payload).not.toHaveProperty('subsetor');
    expect(payload).not.toHaveProperty('geografia');
  });

  it('exibe a mensagem de validação do backend em erro 400 (fields)', async () => {
    investimentoService.editarAtivo.mockRejectedValue({
      response: {
        status: 400,
        data: {
          status: 400,
          error: 'Validation Failed',
          fields: { quantidade: 'deve ser maior que 0' },
        },
      },
    });
    renderDialog();

    fireEvent.click(screen.getByTestId('btn-salvar-edicao-ativo'));

    expect(await screen.findByText('deve ser maior que 0')).toBeInTheDocument();
  });
});
