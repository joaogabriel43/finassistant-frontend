import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import theme from '@/theme';
import EventosCorporativosPanel from '../EventosCorporativosPanel';

// --- MOCK: investimentoService ---
vi.mock('../../../services/investimentoService', () => ({
  investimentoService: {
    getEventosCorporativos: vi.fn(),
  },
}));

import { investimentoService } from '../../../services/investimentoService';

const renderPanel = () =>
  render(
    <ThemeProvider theme={theme}>
      <EventosCorporativosPanel />
    </ThemeProvider>,
  );

const dadosComEventos = {
  eventos: [
    {
      ticker: 'ITSA4',
      tipo: 'JCP',
      data: '2026-06-18',
      descricao: 'JCP anunciado',
      proximo: true,
    },
    {
      ticker: 'PETR4',
      tipo: 'DATA_COM',
      data: '2026-07-05',
      descricao: 'Data com dividendos',
      proximo: false,
    },
    {
      ticker: 'VALE3',
      tipo: 'DESDOBRAMENTO',
      data: '2026-09-10',
      descricao: 'Desdobramento 1:2',
      proximo: false,
    },
  ],
};

const dadosVazios = { eventos: [] };

describe('EventosCorporativosPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    investimentoService.getEventosCorporativos.mockResolvedValue(dadosComEventos);
  });

  it('renderiza a linha do tempo com os eventos vindos do service', async () => {
    renderPanel();

    await waitFor(() => {
      expect(screen.getByTestId('eventos-corporativos-timeline')).toBeInTheDocument();
    });

    // sem filtro inicial → chamada sem tipo
    expect(investimentoService.getEventosCorporativos).toHaveBeenCalledTimes(1);
    expect(investimentoService.getEventosCorporativos).toHaveBeenCalledWith(null);

    // 3 itens na timeline
    expect(screen.getAllByTestId('evento-corporativo-item')).toHaveLength(3);

    // tickers
    expect(screen.getByText('ITSA4')).toBeInTheDocument();
    expect(screen.getByText('PETR4')).toBeInTheDocument();
    expect(screen.getByText('VALE3')).toBeInTheDocument();

    // descrições
    expect(screen.getByText('JCP anunciado')).toBeInTheDocument();
    expect(screen.getByText('Desdobramento 1:2')).toBeInTheDocument();

    // data formatada dd/MM/yyyy sem bug de timezone
    expect(screen.getByText('18/06/2026')).toBeInTheDocument();
    expect(screen.getByText('10/09/2026')).toBeInTheDocument();
  });

  it('mapeia os enums de tipo para rótulos legíveis em PT-BR', async () => {
    renderPanel();

    await waitFor(() => {
      expect(screen.getByTestId('eventos-corporativos-timeline')).toBeInTheDocument();
    });

    const chips = screen.getAllByTestId('evento-tipo-chip');
    const labels = chips.map((c) => c.textContent);
    expect(labels).toContain('JCP');
    expect(labels).toContain('Data com');
    expect(labels).toContain('Desdobramento');
    // o enum cru nunca deve aparecer
    expect(labels).not.toContain('DATA_COM');
    expect(labels).not.toContain('DESDOBRAMENTO');
  });

  it('destaca eventos próximos (proximo: true) com chip "Em breve"', async () => {
    renderPanel();

    await waitFor(() => {
      expect(screen.getByTestId('eventos-corporativos-timeline')).toBeInTheDocument();
    });

    // apenas 1 evento próximo no mock (ITSA4)
    const proximos = screen.getAllByTestId('evento-proximo-chip');
    expect(proximos).toHaveLength(1);
    expect(proximos[0]).toHaveTextContent('Em breve');

    // o item destacado é o do ITSA4 (proximo=true via data-attr)
    const itens = screen.getAllByTestId('evento-corporativo-item');
    const destacados = itens.filter((el) => el.getAttribute('data-proximo') === 'true');
    expect(destacados).toHaveLength(1);
    expect(within(destacados[0]).getByText('ITSA4')).toBeInTheDocument();
  });

  it('troca de filtro dispara nova chamada com o tipo selecionado', async () => {
    const user = userEvent.setup();
    renderPanel();

    await waitFor(() => {
      expect(screen.getByTestId('eventos-corporativos-timeline')).toBeInTheDocument();
    });

    investimentoService.getEventosCorporativos.mockClear();
    investimentoService.getEventosCorporativos.mockResolvedValue({
      eventos: [dadosComEventos.eventos[2]],
    });

    // clica no filtro "Desdobramento"
    await user.click(screen.getByRole('button', { name: 'Desdobramento' }));

    await waitFor(() => {
      expect(investimentoService.getEventosCorporativos).toHaveBeenCalledWith('DESDOBRAMENTO');
    });
  });

  it('exibe o estado vazio quando não há eventos', async () => {
    investimentoService.getEventosCorporativos.mockResolvedValue(dadosVazios);

    renderPanel();

    await waitFor(() => {
      expect(screen.getByTestId('eventos-corporativos-empty')).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Nenhum evento corporativo na agenda no momento/i),
    ).toBeInTheDocument();
    // não renderiza a timeline no estado vazio
    expect(screen.queryByTestId('eventos-corporativos-timeline')).not.toBeInTheDocument();
  });

  it('exibe mensagem de erro quando o service falha', async () => {
    investimentoService.getEventosCorporativos.mockRejectedValue(new Error('boom'));

    renderPanel();

    await waitFor(() => {
      expect(
        screen.getByText('Não foi possível carregar a agenda de eventos corporativos.'),
      ).toBeInTheDocument();
    });
  });
});
