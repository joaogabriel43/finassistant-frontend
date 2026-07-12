import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AdicionarAtivoForm from '../AdicionarAtivoForm';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('../../../services/investimentoService', () => ({
  investimentoService: {
    adicionarAtivo: vi.fn(),
  },
}));

import { investimentoService } from '../../../services/investimentoService';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const hoje = () => new Date().toISOString().split('T')[0]; // "yyyy-MM-dd"

const preencherCamposValidos = () => {
  fireEvent.change(screen.getByTestId('input-ticker'), { target: { value: 'mxrf11' } });
  fireEvent.change(screen.getByTestId('input-quantidade'), { target: { value: '10' } });
  fireEvent.change(screen.getByTestId('input-preco-compra'), { target: { value: '28.5' } });
};

const submeter = () => {
  fireEvent.click(screen.getByTestId('btn-adicionar-ativo'));
};

beforeEach(() => {
  vi.clearAllMocks();
  investimentoService.adicionarAtivo.mockResolvedValue(undefined);
});

// ─── Testes ──────────────────────────────────────────────────────────────────

describe('AdicionarAtivoForm — renderização', () => {
  it('renderiza todos os campos, o hint de re-compra e o botão de submit', () => {
    render(<AdicionarAtivoForm />);

    expect(screen.getByTestId('input-ticker')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /tipo/i })).toBeInTheDocument();
    expect(screen.getByTestId('input-quantidade')).toBeInTheDocument();
    expect(screen.getByTestId('input-preco-compra')).toBeInTheDocument();

    // Data da compra: default = hoje e máximo = hoje (nunca futura)
    const campoData = screen.getByTestId('input-data-compra');
    expect(campoData.value).toBe(hoje());
    expect(campoData).toHaveAttribute('max', hoje());

    // Hint sobre re-compra com preço médio ponderado
    expect(screen.getByText(/re-compra/i)).toBeInTheDocument();
    expect(screen.getByText(/preço médio é recalculado/i)).toBeInTheDocument();

    expect(screen.getByTestId('btn-adicionar-ativo')).toBeInTheDocument();
  });

  it('exibe os 5 tipos de ativo com rótulos PT-BR no select (incluindo Exterior)', () => {
    render(<AdicionarAtivoForm />);

    fireEvent.mouseDown(screen.getByRole('combobox', { name: /tipo/i }));

    expect(screen.getByRole('option', { name: 'Ação' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'FII' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Renda Fixa' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Cripto' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Exterior' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /detectar automaticamente/i })).toBeInTheDocument();
  });

  it('renderiza os selects opcionais de setor, subsetor e geografia', () => {
    render(<AdicionarAtivoForm />);

    expect(screen.getByRole('combobox', { name: /^setor$/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /subsetor/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /geografia/i })).toBeInTheDocument();
  });
});

describe('AdicionarAtivoForm — classificação setor/subsetor/geografia', () => {
  it('filtra o subsetor pelo setor selecionado', () => {
    render(<AdicionarAtivoForm />);

    // Seleciona o setor Financeiro
    fireEvent.mouseDown(screen.getAllByRole('combobox', { name: /^setor/i })[0]);
    fireEvent.click(screen.getByRole('option', { name: 'Financeiro' }));

    // O select de subsetor mostra apenas os filhos de Financeiro
    fireEvent.mouseDown(screen.getByRole('combobox', { name: /subsetor/i }));
    expect(screen.getByRole('option', { name: 'Bancos' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Seguros' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Mineração' })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Transporte' })).not.toBeInTheDocument();
  });

  it('escolher subsetor sem setor auto-preenche o setor pai', async () => {
    render(<AdicionarAtivoForm />);

    // Sem setor selecionado, o subsetor lista a taxonomia completa
    fireEvent.mouseDown(screen.getByRole('combobox', { name: /subsetor/i }));
    fireEvent.click(screen.getByRole('option', { name: 'Mineração' }));

    // Setor pai (Materiais Básicos) auto-preenchido
    expect(screen.getByTestId('select-setor')).toHaveValue('MATERIAIS_BASICOS');
    expect(screen.getByTestId('select-subsetor')).toHaveValue('MINERACAO');
  });

  it('trocar o setor limpa o subsetor incompatível', () => {
    render(<AdicionarAtivoForm />);

    // Financeiro → Bancos
    fireEvent.mouseDown(screen.getAllByRole('combobox', { name: /^setor/i })[0]);
    fireEvent.click(screen.getByRole('option', { name: 'Financeiro' }));
    fireEvent.mouseDown(screen.getByRole('combobox', { name: /subsetor/i }));
    fireEvent.click(screen.getByRole('option', { name: 'Bancos' }));
    expect(screen.getByTestId('select-subsetor')).toHaveValue('BANCOS');

    // Troca o setor para Saúde → Bancos é incompatível e deve ser limpo
    fireEvent.mouseDown(screen.getAllByRole('combobox', { name: /^setor/i })[0]);
    fireEvent.click(screen.getByRole('option', { name: 'Saúde' }));

    expect(screen.getByTestId('select-setor')).toHaveValue('SAUDE');
    expect(screen.getByTestId('select-subsetor')).toHaveValue('');
  });

  it('envia setor, subsetor e geografia no payload quando selecionados', async () => {
    render(<AdicionarAtivoForm />);

    preencherCamposValidos();

    fireEvent.mouseDown(screen.getAllByRole('combobox', { name: /^setor/i })[0]);
    fireEvent.click(screen.getByRole('option', { name: 'Financeiro' }));
    fireEvent.mouseDown(screen.getByRole('combobox', { name: /subsetor/i }));
    fireEvent.click(screen.getByRole('option', { name: 'Bancos' }));
    fireEvent.mouseDown(screen.getByRole('combobox', { name: /geografia/i }));
    fireEvent.click(screen.getByRole('option', { name: 'Brasil' }));

    submeter();

    await waitFor(() => {
      expect(investimentoService.adicionarAtivo).toHaveBeenCalledWith({
        ticker: 'MXRF11',
        quantidade: 10,
        precoCompra: 28.5,
        dataCompra: hoje(),
        setor: 'FINANCEIRO',
        subsetor: 'BANCOS',
        geografia: 'BRASIL',
      });
    });
  });

  it('omite setor/subsetor/geografia do payload quando "Não classificar"', async () => {
    render(<AdicionarAtivoForm />);

    preencherCamposValidos();
    submeter();

    await waitFor(() => {
      expect(investimentoService.adicionarAtivo).toHaveBeenCalledTimes(1);
    });

    const payload = investimentoService.adicionarAtivo.mock.calls[0][0];
    expect(payload).not.toHaveProperty('setor');
    expect(payload).not.toHaveProperty('subsetor');
    expect(payload).not.toHaveProperty('geografia');
  });
});

describe('AdicionarAtivoForm — validação client-side', () => {
  it('bloqueia submit sem ticker', async () => {
    render(<AdicionarAtivoForm />);

    fireEvent.change(screen.getByTestId('input-quantidade'), { target: { value: '10' } });
    fireEvent.change(screen.getByTestId('input-preco-compra'), { target: { value: '28.5' } });
    submeter();

    expect(await screen.findByText(/informe o ticker/i)).toBeInTheDocument();
    expect(investimentoService.adicionarAtivo).not.toHaveBeenCalled();
  });

  it('bloqueia submit com quantidade menor ou igual a zero', async () => {
    render(<AdicionarAtivoForm />);

    preencherCamposValidos();
    fireEvent.change(screen.getByTestId('input-quantidade'), { target: { value: '0' } });
    submeter();

    expect(await screen.findByText(/quantidade deve ser maior que zero/i)).toBeInTheDocument();
    expect(investimentoService.adicionarAtivo).not.toHaveBeenCalled();
  });

  it('bloqueia submit com preço menor ou igual a zero', async () => {
    render(<AdicionarAtivoForm />);

    preencherCamposValidos();
    fireEvent.change(screen.getByTestId('input-preco-compra'), { target: { value: '-5' } });
    submeter();

    expect(await screen.findByText(/preço de compra deve ser maior que zero/i)).toBeInTheDocument();
    expect(investimentoService.adicionarAtivo).not.toHaveBeenCalled();
  });

  it('bloqueia submit com data de compra futura', async () => {
    render(<AdicionarAtivoForm />);

    preencherCamposValidos();
    fireEvent.change(screen.getByTestId('input-data-compra'), { target: { value: '2099-12-31' } });
    submeter();

    expect(await screen.findByText(/data da compra não pode ser futura/i)).toBeInTheDocument();
    expect(investimentoService.adicionarAtivo).not.toHaveBeenCalled();
  });
});

describe('AdicionarAtivoForm — submit válido', () => {
  it('envia o payload correto (ticker uppercase, números parseados, data default) e notifica o pai', async () => {
    const onAtivoAdicionado = vi.fn();
    render(<AdicionarAtivoForm onAtivoAdicionado={onAtivoAdicionado} />);

    preencherCamposValidos();

    // Seleciona tipo FII
    fireEvent.mouseDown(screen.getByRole('combobox', { name: /tipo/i }));
    fireEvent.click(screen.getByRole('option', { name: 'FII' }));

    submeter();

    await waitFor(() => {
      expect(investimentoService.adicionarAtivo).toHaveBeenCalledWith({
        ticker: 'MXRF11',
        quantidade: 10,
        precoCompra: 28.5,
        tipoAtivo: 'FUNDO_IMOBILIARIO',
        dataCompra: hoje(),
      });
    });

    expect(onAtivoAdicionado).toHaveBeenCalledTimes(1);
    expect(await screen.findByText(/MXRF11 adicionado ao portfólio/i)).toBeInTheDocument();
    // Formulário resetado após sucesso
    expect(screen.getByTestId('input-ticker').value).toBe('');
  });

  it('omite tipoAtivo do payload quando "Detectar automaticamente" está selecionado', async () => {
    render(<AdicionarAtivoForm />);

    preencherCamposValidos();
    submeter();

    await waitFor(() => {
      expect(investimentoService.adicionarAtivo).toHaveBeenCalledTimes(1);
    });

    const payload = investimentoService.adicionarAtivo.mock.calls[0][0];
    expect(payload).not.toHaveProperty('tipoAtivo');
    expect(payload.ticker).toBe('MXRF11');
  });
});

describe('AdicionarAtivoForm — erros da API', () => {
  it('exibe a mensagem de validação do backend em erro 400 (fields) e não notifica o pai', async () => {
    const onAtivoAdicionado = vi.fn();
    investimentoService.adicionarAtivo.mockRejectedValue({
      response: {
        status: 400,
        data: {
          status: 400,
          error: 'Validation Failed',
          fields: { dataCompra: 'Data da compra não pode ser futura' },
        },
      },
    });

    render(<AdicionarAtivoForm onAtivoAdicionado={onAtivoAdicionado} />);
    preencherCamposValidos();
    submeter();

    expect(await screen.findByText('Data da compra não pode ser futura')).toBeInTheDocument();
    expect(onAtivoAdicionado).not.toHaveBeenCalled();
  });

  it('exibe mensagem genérica quando o erro não tem corpo reconhecível', async () => {
    investimentoService.adicionarAtivo.mockRejectedValue(new Error('network down'));

    render(<AdicionarAtivoForm />);
    preencherCamposValidos();
    submeter();

    expect(await screen.findByText(/falha ao adicionar o ativo/i)).toBeInTheDocument();
  });
});
