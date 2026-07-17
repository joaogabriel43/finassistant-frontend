import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../../theme';
import FronteiraPanel from '../FronteiraPanel';

vi.mock('../../../services/investimentoService', () => ({
  investimentoService: { obterFronteira: vi.fn() },
}));

vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    ResponsiveContainer: ({ children }) => (
      <div style={{ width: 400, height: 300 }}>{children}</div>
    ),
  };
});

import { investimentoService } from '../../../services/investimentoService';

const renderPanel = () =>
  render(
    <ThemeProvider theme={theme}>
      <FronteiraPanel refreshKey={0} />
    </ThemeProvider>
  );

const fronteiraCompleta = {
  pontos: [
    { risco: 0.10, retorno: 0.08 },
    { risco: 0.15, retorno: 0.12 },
    { risco: 0.22, retorno: 0.15 },
  ],
  maxSharpe: {
    risco: 0.15, retorno: 0.12, sharpe: 0.85,
    pesos: { PETR4: 0.62, ITUB4: 0.38 },
  },
  carteiraAtual: { risco: 0.18, retorno: 0.10 },
  taxaLivreRiscoAnual: 0.1175,
  motivoIndisponivel: null,
  ativosExcluidos: [],
  disclaimer: 'Fronteira indicativa — não é recomendação de investimento.',
};

describe('FronteiraPanel (ADR-033)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza gráfico, composição máx. Sharpe e disclaimer', async () => {
    investimentoService.obterFronteira.mockResolvedValueOnce(fronteiraCompleta);
    renderPanel();

    expect(await screen.findByTestId('grafico-fronteira')).toBeInTheDocument();
    expect(screen.getByText(/composição máx\. sharpe/i)).toBeInTheDocument();
    expect(screen.getByText(/PETR4 62,0%/)).toBeInTheDocument();
    expect(screen.getByText(/ITUB4 38,0%/)).toBeInTheDocument();
    expect(screen.getByText(/não é recomendação/i)).toBeInTheDocument();
  });

  it('estado indisponível mostra motivo do backend, sem gráfico', async () => {
    investimentoService.obterFronteira.mockResolvedValueOnce({
      ...fronteiraCompleta,
      pontos: [], maxSharpe: null, carteiraAtual: null,
      motivoIndisponivel: 'A fronteira exige pelo menos 2 ativos com histórico.',
    });
    renderPanel();

    expect(await screen.findByText(/pelo menos 2 ativos/i)).toBeInTheDocument();
    expect(screen.queryByTestId('grafico-fronteira')).not.toBeInTheDocument();
  });

  it('erro de rede mostra alerta amigável', async () => {
    investimentoService.obterFronteira.mockRejectedValueOnce(new Error('falhou'));
    renderPanel();

    expect(await screen.findByText(/não foi possível calcular/i)).toBeInTheDocument();
  });
});
