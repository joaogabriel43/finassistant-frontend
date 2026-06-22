import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import theme from '@/theme';
import RendaPassivaPanel from '../RendaPassivaPanel';

// --- MOCK: investimentoService ---
vi.mock('../../../services/investimentoService', () => ({
  investimentoService: {
    getRendaPassiva: vi.fn(),
  },
}));

import { investimentoService } from '../../../services/investimentoService';

// Helper: monta 12 meses; preenche os índices indicados (mês 1..12) com total/breakdown.
function montarMeses(preenchidos = {}) {
  return Array.from({ length: 12 }, (_, i) => {
    const mes = i + 1;
    const dado = preenchidos[mes];
    return {
      ano: 2025,
      mes,
      total: dado?.total ?? 0,
      breakdown: dado?.breakdown ?? [],
    };
  });
}

const renderPanel = () =>
  render(
    <ThemeProvider theme={theme}>
      <RendaPassivaPanel />
    </ThemeProvider>,
  );

const dadosComProventos = {
  meses: montarMeses({
    7: {
      total: 12.5,
      breakdown: [{ ticker: 'ITSA4', tipo: 'DIVIDENDO', valor: 12.5 }],
    },
    3: {
      total: 40.0,
      breakdown: [
        { ticker: 'PETR4', tipo: 'JCP', valor: 25.0 },
        { ticker: 'VALE3', tipo: 'DIVIDENDO', valor: 15.0 },
      ],
    },
  }),
  totalRecebidoNoAno: 150.0,
  mediaMensal: 12.5,
  mesComMaiorRecebimento: {
    ano: 2025,
    mes: 3,
    total: 40.0,
    breakdown: [
      { ticker: 'PETR4', tipo: 'JCP', valor: 25.0 },
      { ticker: 'VALE3', tipo: 'DIVIDENDO', valor: 15.0 },
    ],
  },
  yieldOnCostAgregado: 3.3333,
};

const dadosVazios = {
  meses: montarMeses(),
  totalRecebidoNoAno: 0,
  mediaMensal: 0,
  mesComMaiorRecebimento: null,
  yieldOnCostAgregado: 0,
};

describe('RendaPassivaPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('chama o service sem tipo no primeiro carregamento e renderiza o gráfico', async () => {
    investimentoService.getRendaPassiva.mockResolvedValue(dadosComProventos);

    renderPanel();

    await waitFor(() => {
      expect(screen.getByTestId('renda-passiva-chart')).toBeInTheDocument();
    });

    // Primeira chamada deve ser sem filtro (undefined).
    expect(investimentoService.getRendaPassiva).toHaveBeenCalledWith(null);
    // 12 barras renderizadas
    expect(screen.getAllByTestId(/renda-passiva-bar-/)).toHaveLength(12);
  });

  it('exibe as métricas agregadas com formatação BRL e fonte monoespaçada', async () => {
    investimentoService.getRendaPassiva.mockResolvedValue(dadosComProventos);

    renderPanel();

    await waitFor(() => {
      expect(screen.getByText('Total no ano')).toBeInTheDocument();
    });

    // Total no ano: R$ 150,00 (formatado em BRL)
    const total = screen.getByText(/R\$\s?150,00/);
    expect(total).toBeInTheDocument();
    // valor monetário usa fonte mono do tema
    expect(total).toHaveStyle({ fontFamily: theme.typography.fontFamilyMono });

    // Média mensal e yield on cost presentes
    expect(screen.getByText('Média mensal')).toBeInTheDocument();
    expect(screen.getByText('Yield on cost')).toBeInTheDocument();
    expect(screen.getByText(/3,33%/)).toBeInTheDocument();
    // Maior recebimento formatado mes/ano (· separa mês e valor)
    expect(screen.getByText(/Mar\/25 · R\$\s?40,00/)).toBeInTheDocument();
  });

  it('exibe o estado vazio quando não há proventos no período', async () => {
    investimentoService.getRendaPassiva.mockResolvedValue(dadosVazios);

    renderPanel();

    await waitFor(() => {
      expect(screen.getByTestId('renda-passiva-empty')).toBeInTheDocument();
    });

    expect(screen.getByText(/Nenhum provento recebido no período ainda/i)).toBeInTheDocument();
    // não renderiza o gráfico no estado vazio
    expect(screen.queryByTestId('renda-passiva-chart')).not.toBeInTheDocument();
  });

  it('mostra o breakdown por ativo ao clicar em uma barra do mês', async () => {
    investimentoService.getRendaPassiva.mockResolvedValue(dadosComProventos);

    renderPanel();

    await waitFor(() => {
      expect(screen.getByTestId('renda-passiva-chart')).toBeInTheDocument();
    });

    // Mês 3 (Março) = índice 2, possui PETR4 e VALE3
    fireEvent.click(screen.getByTestId('renda-passiva-bar-2'));

    const breakdown = await screen.findByTestId('renda-passiva-breakdown');
    expect(within(breakdown).getByText('PETR4')).toBeInTheDocument();
    expect(within(breakdown).getByText('VALE3')).toBeInTheDocument();
    // valor por ativo formatado em BRL
    expect(within(breakdown).getByText(/R\$\s?25,00/)).toBeInTheDocument();
  });

  it('refaz a chamada com tipo ao trocar o filtro de provento', async () => {
    investimentoService.getRendaPassiva.mockResolvedValue(dadosComProventos);

    renderPanel();

    await waitFor(() => {
      expect(investimentoService.getRendaPassiva).toHaveBeenCalledWith(null);
    });

    // Clica no filtro "JCP"
    fireEvent.click(screen.getByRole('button', { name: 'JCP' }));

    await waitFor(() => {
      expect(investimentoService.getRendaPassiva).toHaveBeenCalledWith('JCP');
    });
  });

  it('exibe mensagem de erro quando o service falha', async () => {
    investimentoService.getRendaPassiva.mockRejectedValue(new Error('boom'));

    renderPanel();

    await waitFor(() => {
      expect(screen.getByText('Não foi possível carregar a renda passiva.')).toBeInTheDocument();
    });
  });
});
