import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../../theme';
import OrcamentoLimitesCard from '../OrcamentoLimitesCard';

vi.mock('../../../services/api', () => ({
  default: { get: vi.fn(), put: vi.fn() },
}));

import api from '../../../services/api';

const renderCard = () =>
  render(
    <ThemeProvider theme={theme}>
      <OrcamentoLimitesCard />
    </ThemeProvider>
  );

const progressoCompleto = {
  itens: [
    {
      categoria: 'Mercado', limite: 1000.0, gasto: 400.0, percentual: 40.0,
      projecaoFimDeMes: 1200.0, diaEstimadoEstouro: 25, status: 'OK',
    },
    {
      categoria: 'Lazer', limite: 500.0, gasto: 620.0, percentual: 124.0,
      projecaoFimDeMes: 1860.0, diaEstimadoEstouro: null, status: 'ESTOURADO',
    },
  ],
  totalLimites: 1500.0,
  totalGasto: 1020.0,
};

describe('OrcamentoLimitesCard (ADR-034)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: progressoCompleto });
  });

  it('renderiza barras com status e valores por categoria', async () => {
    renderCard();

    expect(await screen.findByText('Mercado')).toBeInTheDocument();
    expect(screen.getByText('Dentro do limite')).toBeInTheDocument();
    expect(screen.getByText('Estourado')).toBeInTheDocument();
  });

  it('mostra a projeção de estouro com o dia estimado', async () => {
    renderCard();

    expect(await screen.findByText(/estoura por volta do dia 25/i)).toBeInTheDocument();
  });

  it('categoria estourada mostra o valor ultrapassado', async () => {
    renderCard();

    expect(await screen.findByText(/ultrapassado em/i)).toBeInTheDocument();
  });

  it('sem limites configurados mostra o convite para definir', async () => {
    api.get.mockResolvedValue({ data: { itens: [], totalLimites: 0, totalGasto: 0 } });
    renderCard();

    expect(await screen.findByText(/defina limites mensais/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /definir limites/i })).toBeInTheDocument();
  });

  it('edição envia PUT com o mapa categoria → valor (decimal PT-BR)', async () => {
    api.put.mockResolvedValue({ data: {} });
    renderCard();

    fireEvent.click(await screen.findByRole('button', { name: /editar limites/i }));
    const campos = screen.getAllByLabelText(/limite mensal/i);
    fireEvent.change(campos[0], { target: { value: '1.750,50' } });
    fireEvent.click(screen.getByRole('button', { name: /^salvar$/i }));

    await waitFor(() => expect(api.put).toHaveBeenCalledWith('/orcamento/limites', {
      Mercado: 1750.5,
      Lazer: 500,
    }));
  });

  it('valor inválido na edição bloqueia o salvamento com mensagem', async () => {
    renderCard();

    fireEvent.click(await screen.findByRole('button', { name: /editar limites/i }));
    const campos = screen.getAllByLabelText(/limite mensal/i);
    fireEvent.change(campos[0], { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: /^salvar$/i }));

    expect(await screen.findByText(/limite inválido/i)).toBeInTheDocument();
    expect(api.put).not.toHaveBeenCalled();
  });
});
