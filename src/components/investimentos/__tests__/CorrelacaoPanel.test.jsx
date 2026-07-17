import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../../theme';
import CorrelacaoPanel from '../CorrelacaoPanel';

vi.mock('../../../services/investimentoService', () => ({
  investimentoService: { obterAnaliseCorrelacao: vi.fn(), obterAlphaBeta: vi.fn() },
}));

import { investimentoService } from '../../../services/investimentoService';

const renderPanel = () =>
  render(
    <ThemeProvider theme={theme}>
      <CorrelacaoPanel refreshKey={0} />
    </ThemeProvider>
  );

const alphaBetaIndisponivel = {
  benchmark: null, itens: [], betaCarteira: null,
  motivoIndisponivel: 'Série do benchmark indisponível.', ativosExcluidos: [], disclaimer: 'D.',
};

const alphaBetaCompleto = {
  benchmark: 'IBOVESPA (simulado)',
  itens: [
    { ticker: 'PETR4', beta: 1.42, alphaMensal: 0.002, alphaAnualizado: 0.024 },
    { ticker: 'PETR3', beta: 0.98, alphaMensal: -0.001, alphaAnualizado: -0.012 },
  ],
  betaCarteira: 1.2,
  motivoIndisponivel: null, ativosExcluidos: [], disclaimer: 'D.',
};

const analiseCompleta = {
  tickers: ['PETR4', 'PETR3'],
  matrizCorrelacao: [[1.0, 0.95], [0.95, 1.0]],
  matrizCovariancia: [[0.0004, 0.00038], [0.00038, 0.0004]],
  paresAltaCorrelacao: [{ tickerA: 'PETR4', tickerB: 'PETR3', correlacao: 0.95 }],
  scoreDiversificacao: 5,
  motivoIndisponivel: null,
  ativosExcluidos: [{ ticker: 'NOVA3', motivo: 'Histórico insuficiente: mínimo de 12 retornos.' }],
  disclaimer: 'Análise estatística — não é recomendação de investimento.',
};

describe('CorrelacaoPanel (ADR-030)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    investimentoService.obterAlphaBeta.mockResolvedValue(alphaBetaIndisponivel);
  });

  it('renderiza heatmap, par correlacionado, score e disclaimer', async () => {
    investimentoService.obterAnaliseCorrelacao.mockResolvedValueOnce(analiseCompleta);
    renderPanel();

    expect(await screen.findByTestId('heatmap-correlacao')).toBeInTheDocument();
    expect(screen.getByText(/PETR4 × PETR3/)).toBeInTheDocument();
    expect(screen.getByText(/ρ 0,95/)).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText(/não é recomendação/i)).toBeInTheDocument();
  });

  it('exibe ativos excluídos com motivo', async () => {
    investimentoService.obterAnaliseCorrelacao.mockResolvedValueOnce(analiseCompleta);
    renderPanel();

    expect(await screen.findByText(/NOVA3/)).toBeInTheDocument();
    expect(screen.getByText(/mínimo de 12 retornos/i)).toBeInTheDocument();
  });

  it('estado indisponível mostra o motivo do backend, sem heatmap', async () => {
    investimentoService.obterAnaliseCorrelacao.mockResolvedValueOnce({
      tickers: [], matrizCorrelacao: [], matrizCovariancia: [],
      paresAltaCorrelacao: [], scoreDiversificacao: null,
      motivoIndisponivel: 'A análise exige pelo menos 2 ativos com histórico.',
      ativosExcluidos: [], disclaimer: 'Disclaimer.',
    });
    renderPanel();

    expect(await screen.findByText(/pelo menos 2 ativos/i)).toBeInTheDocument();
    expect(screen.queryByTestId('heatmap-correlacao')).not.toBeInTheDocument();
  });

  it('erro de rede mostra alerta amigável', async () => {
    investimentoService.obterAnaliseCorrelacao.mockRejectedValueOnce(new Error('falhou'));
    renderPanel();

    expect(await screen.findByText(/não foi possível carregar/i)).toBeInTheDocument();
  });

  it('exibe tabela de alpha/beta com beta da carteira quando o benchmark existe', async () => {
    investimentoService.obterAnaliseCorrelacao.mockResolvedValueOnce(analiseCompleta);
    investimentoService.obterAlphaBeta.mockResolvedValue(alphaBetaCompleto);
    renderPanel();

    expect(await screen.findByTestId('secao-alpha-beta')).toBeInTheDocument();
    expect(screen.getByText(/β carteira 1,20/)).toBeInTheDocument();
    expect(screen.getByText('1,42')).toBeInTheDocument();
    expect(screen.getByText('2,40%')).toBeInTheDocument();
    expect(screen.getByText('-1,20%')).toBeInTheDocument();
  });

  it('benchmark indisponível mostra o motivo na seção alpha/beta', async () => {
    investimentoService.obterAnaliseCorrelacao.mockResolvedValueOnce(analiseCompleta);
    renderPanel();

    expect(await screen.findByText(/benchmark indisponível/i)).toBeInTheDocument();
  });

  it('sem pares acima do limiar, a seção de alerta não aparece', async () => {
    investimentoService.obterAnaliseCorrelacao.mockResolvedValueOnce({
      ...analiseCompleta,
      paresAltaCorrelacao: [],
      scoreDiversificacao: 88,
    });
    renderPanel();

    expect(await screen.findByTestId('heatmap-correlacao')).toBeInTheDocument();
    expect(screen.queryByText(/altamente correlacionados/i)).not.toBeInTheDocument();
  });
});
