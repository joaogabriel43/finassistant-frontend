import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../../theme';
import CalendarioGastosCard from '../CalendarioGastosCard';
import EntradasSaidasChart from '../EntradasSaidasChart';

vi.mock('../../../services/api', () => ({
  default: { get: vi.fn() },
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

import api from '../../../services/api';

const renderComTema = (el) => render(<ThemeProvider theme={theme}>{el}</ThemeProvider>);

const calendarioJunho = {
  mes: 6, ano: 2026,
  dias: Array.from({ length: 30 }, (_, i) => ({
    dia: i + 1,
    totalDebito: i === 4 ? 150.0 : 0.0,
    totalCredito: i === 0 ? 2000.0 : 0.0,
  })),
  totalDebitos: 150.0, totalCreditos: 2000.0, maiorGastoDia: 150.0,
};

describe('CalendarioGastosCard (ADR-036)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: calendarioJunho });
  });

  it('renderiza a grade do mês com todos os dias e os totais', async () => {
    renderComTema(<CalendarioGastosCard />);

    expect(await screen.findByTestId('heatmap-calendario')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument(); // último dia na grade
    expect(screen.getByText(/total do mês/i)).toBeInTheDocument();
  });

  it('navegação de mês refaz a busca com os novos parâmetros', async () => {
    renderComTema(<CalendarioGastosCard />);
    await screen.findByTestId('heatmap-calendario');

    fireEvent.click(screen.getByLabelText(/mês anterior/i));

    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2));
  });

  it('erro de rede mostra alerta', async () => {
    api.get.mockRejectedValue(new Error('falhou'));
    renderComTema(<CalendarioGastosCard />);

    expect(await screen.findByText(/não foi possível carregar o calendário/i)).toBeInTheDocument();
  });
});

describe('EntradasSaidasChart (ADR-036)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza o gráfico quando a série chega', async () => {
    api.get.mockResolvedValue({
      data: [
        { mes: '05/2026', receitas: 2800, despesas: 900, saldo: 1900 },
        { mes: '06/2026', receitas: 3000, despesas: 1200, saldo: 1800 },
      ],
    });
    renderComTema(<EntradasSaidasChart />);

    expect(await screen.findByTestId('grafico-entradas-saidas')).toBeInTheDocument();
  });

  it('erro de rede mostra alerta', async () => {
    api.get.mockRejectedValue(new Error('falhou'));
    renderComTema(<EntradasSaidasChart />);

    expect(await screen.findByText(/não foi possível carregar entradas/i)).toBeInTheDocument();
  });
});
