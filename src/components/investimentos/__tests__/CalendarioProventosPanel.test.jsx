import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import theme from '@/theme';
import CalendarioProventosPanel from '../CalendarioProventosPanel';

// --- MOCK: investimentoService ---
vi.mock('../../../services/investimentoService', () => ({
  investimentoService: {
    getCalendarioProventos: vi.fn(),
  },
}));

import { investimentoService } from '../../../services/investimentoService';

const renderPanel = () =>
  render(
    <ThemeProvider theme={theme}>
      <CalendarioProventosPanel />
    </ThemeProvider>,
  );

const dadosComEventos = {
  meses: [
    {
      ano: 2026,
      mes: 7,
      totalEstimado: 120.0,
      eventos: [
        {
          ticker: 'HSML11',
          tipo: 'RENDIMENTO',
          valorPorCota: 0.8,
          valorEstimadoTotal: 80.0,
          dataPagamento: '2026-07-15',
          confirmado: true,
        },
        {
          ticker: 'ITSA4',
          tipo: 'DIVIDENDO',
          valorPorCota: 0.2,
          valorEstimadoTotal: 40.0,
          dataPagamento: '2026-07-20',
          confirmado: false,
        },
      ],
    },
    {
      ano: 2026,
      mes: 8,
      totalEstimado: 50.0,
      eventos: [
        {
          ticker: 'PETR4',
          tipo: 'JCP',
          valorPorCota: 0.5,
          valorEstimadoTotal: 50.0,
          dataPagamento: '2026-08-10',
          confirmado: false,
        },
      ],
    },
  ],
};

const dadosVazios = { meses: [] };

describe('CalendarioProventosPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza os meses com seus eventos vindos do service', async () => {
    investimentoService.getCalendarioProventos.mockResolvedValue(dadosComEventos);

    renderPanel();

    await waitFor(() => {
      expect(screen.getByTestId('calendario-proventos-meses')).toBeInTheDocument();
    });

    expect(investimentoService.getCalendarioProventos).toHaveBeenCalledTimes(1);

    // 2 meses renderizados
    expect(screen.getAllByTestId('calendario-mes-card')).toHaveLength(2);
    // cabeçalhos dos meses
    expect(screen.getByText('Julho de 2026')).toBeInTheDocument();
    expect(screen.getByText('Agosto de 2026')).toBeInTheDocument();

    // tickers dos eventos
    expect(screen.getByText('HSML11')).toBeInTheDocument();
    expect(screen.getByText('ITSA4')).toBeInTheDocument();
    expect(screen.getByText('PETR4')).toBeInTheDocument();
  });

  it('distingue visualmente CONFIRMADO de PROJETADO com badges e cores distintas', async () => {
    investimentoService.getCalendarioProventos.mockResolvedValue(dadosComEventos);

    renderPanel();

    await waitFor(() => {
      expect(screen.getByTestId('calendario-proventos-meses')).toBeInTheDocument();
    });

    // 1 confirmado (HSML11) + 2 projetados (ITSA4, PETR4)
    const confirmados = screen.getAllByTestId('status-confirmado');
    const projetados = screen.getAllByTestId('status-projetado');
    expect(confirmados).toHaveLength(1);
    expect(projetados).toHaveLength(2);

    // textos distintos
    expect(within(confirmados[0]).getByText('Confirmado')).toBeInTheDocument();
    expect(within(projetados[0]).getByText('Projetado')).toBeInTheDocument();

    // legenda explicando os dois estados (transparência)
    const legenda = screen.getByTestId('calendario-proventos-legenda');
    expect(within(legenda).getByText(/data-com já anunciada/i)).toBeInTheDocument();
    expect(within(legenda).getByText(/estimativa baseada no histórico/i)).toBeInTheDocument();
  });

  it('exibe o total estimado do mês com formatação BRL e fonte monoespaçada', async () => {
    investimentoService.getCalendarioProventos.mockResolvedValue(dadosComEventos);

    renderPanel();

    await waitFor(() => {
      expect(screen.getByTestId('calendario-proventos-meses')).toBeInTheDocument();
    });

    const totais = screen.getAllByTestId('calendario-mes-total');
    // primeiro mês: R$ 120,00
    expect(totais[0]).toHaveTextContent(/R\$\s?120,00/);
    expect(totais[0]).toHaveStyle({ fontFamily: theme.typography.fontFamilyMono });
    // segundo mês: R$ 50,00
    expect(totais[1]).toHaveTextContent(/R\$\s?50,00/);

    // valor de um evento individual formatado em BRL
    expect(screen.getByText(/R\$\s?80,00/)).toBeInTheDocument();
  });

  it('exibe o estado vazio quando não há meses com proventos', async () => {
    investimentoService.getCalendarioProventos.mockResolvedValue(dadosVazios);

    renderPanel();

    await waitFor(() => {
      expect(screen.getByTestId('calendario-proventos-empty')).toBeInTheDocument();
    });

    expect(screen.getByText(/Nenhum provento previsto no momento/i)).toBeInTheDocument();
    // não renderiza a grade de meses no estado vazio
    expect(screen.queryByTestId('calendario-proventos-meses')).not.toBeInTheDocument();
  });

  it('exibe mensagem de erro quando o service falha', async () => {
    investimentoService.getCalendarioProventos.mockRejectedValue(new Error('boom'));

    renderPanel();

    await waitFor(() => {
      expect(
        screen.getByText('Não foi possível carregar o calendário de proventos.'),
      ).toBeInTheDocument();
    });
  });
});
