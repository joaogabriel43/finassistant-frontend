import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import theme from '@/theme';
import EstrategiaSetoresPanel from '../EstrategiaSetoresPanel';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('../../../services/investimentoService', () => ({
  investimentoService: {
    obterTetos: vi.fn(),
    salvarTetos: vi.fn(),
    obterBreakdown: vi.fn(),
  },
}));

import { investimentoService } from '../../../services/investimentoService';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const tetosVazios = { porClasse: {}, porSetor: {}, porGeografia: {} };

const tetosConfigurados = {
  porClasse: { ACAO: 30 },
  porSetor: { FINANCEIRO: 25 },
  porGeografia: { BRASIL: 80 },
};

const breakdownVazio = {
  valorTotal: 0,
  porClasse: [],
  porSetor: [],
  porSubsetor: [],
  porGeografia: [],
};

const breakdownComDados = {
  valorTotal: 10000,
  porClasse: [
    {
      chave: 'ACAO',
      valor: 4000,
      percentualReal: 40,
      percentualAlvo: 30,
      percentualTeto: 30,
      excedeuTeto: true,
    },
    {
      chave: 'FUNDO_IMOBILIARIO',
      valor: 6000,
      percentualReal: 60,
      percentualAlvo: 70,
      percentualTeto: null,
      excedeuTeto: false,
    },
  ],
  porSetor: [
    {
      chave: 'FINANCEIRO',
      valor: 2000,
      percentualReal: 20,
      percentualAlvo: null,
      percentualTeto: 25,
      excedeuTeto: false,
    },
    {
      chave: 'NAO_CLASSIFICADO',
      valor: 8000,
      percentualReal: 80,
      percentualAlvo: null,
      percentualTeto: null,
      excedeuTeto: false,
    },
  ],
  porSubsetor: [
    {
      chave: 'BANCOS',
      valor: 2000,
      percentualReal: 20,
      percentualAlvo: null,
      percentualTeto: null,
      excedeuTeto: false,
    },
  ],
  porGeografia: [
    {
      chave: 'BRASIL',
      valor: 10000,
      percentualReal: 100,
      percentualAlvo: null,
      percentualTeto: 80,
      excedeuTeto: true,
    },
  ],
};

const renderPanel = (props = {}) =>
  render(
    <ThemeProvider theme={theme}>
      <EstrategiaSetoresPanel {...props} />
    </ThemeProvider>,
  );

beforeEach(() => {
  vi.clearAllMocks();
  investimentoService.obterBreakdown.mockResolvedValue(breakdownComDados);
  investimentoService.obterTetos.mockResolvedValue(tetosConfigurados);
  investimentoService.salvarTetos.mockResolvedValue(tetosConfigurados);
});

// ─── Testes ──────────────────────────────────────────────────────────────────

describe('EstrategiaSetoresPanel — breakdown por dimensão', () => {
  it('renderiza a dimensão Classe por padrão com real, alvo, teto e valores BRL', async () => {
    renderPanel();

    expect(await screen.findByTestId('breakdown-item-ACAO')).toBeInTheDocument();
    const acao = screen.getByTestId('breakdown-item-ACAO');
    expect(within(acao).getByText('Ação')).toBeInTheDocument();
    expect(within(acao).getByText(/Real: 40,0%/)).toBeInTheDocument();
    expect(within(acao).getByText(/Alvo: 30,0%/)).toBeInTheDocument();
    expect(within(acao).getByText(/Teto: 30,0%/)).toBeInTheDocument();

    // FII sem teto configurado: não exibe "Teto:"
    const fii = screen.getByTestId('breakdown-item-FUNDO_IMOBILIARIO');
    expect(within(fii).getByText('FII')).toBeInTheDocument();
    expect(within(fii).queryByText(/Teto:/)).not.toBeInTheDocument();
  });

  it('destaca ultrapassagem com o chip "Acima do teto" apenas quando excedeuTeto=true', async () => {
    renderPanel();

    expect(await screen.findByTestId('chip-acima-teto-ACAO')).toBeInTheDocument();
    expect(screen.queryByTestId('chip-acima-teto-FUNDO_IMOBILIARIO')).not.toBeInTheDocument();
  });

  it('troca de dimensão pelas tabs e exibe o bucket "Não classificado" no setor', async () => {
    renderPanel();
    await screen.findByTestId('breakdown-item-ACAO');

    fireEvent.click(screen.getByTestId('tab-porSetor'));

    expect(await screen.findByTestId('breakdown-item-NAO_CLASSIFICADO')).toBeInTheDocument();
    expect(screen.getByText('Não classificado')).toBeInTheDocument();
    expect(screen.getByText('Financeiro')).toBeInTheDocument();
    // Itens da dimensão anterior saem da tela
    expect(screen.queryByTestId('breakdown-item-ACAO')).not.toBeInTheDocument();
  });

  it('exibe a dimensão Geografia com destaque de teto excedido', async () => {
    renderPanel();
    await screen.findByTestId('breakdown-item-ACAO');

    fireEvent.click(screen.getByTestId('tab-porGeografia'));

    expect(await screen.findByTestId('breakdown-item-BRASIL')).toBeInTheDocument();
    expect(screen.getByTestId('chip-acima-teto-BRASIL')).toBeInTheDocument();
    expect(screen.getByText('Brasil')).toBeInTheDocument();
  });

  it('subsetor é somente leitura: sem alvo e sem teto', async () => {
    renderPanel();
    await screen.findByTestId('breakdown-item-ACAO');

    fireEvent.click(screen.getByTestId('tab-porSubsetor'));

    const bancos = await screen.findByTestId('breakdown-item-BANCOS');
    expect(within(bancos).getByText('Bancos')).toBeInTheDocument();
    expect(within(bancos).queryByText(/Alvo:/)).not.toBeInTheDocument();
    expect(within(bancos).queryByText(/Teto:/)).not.toBeInTheDocument();
  });
});

describe('EstrategiaSetoresPanel — estados vazios e erro', () => {
  it('exibe mensagem amigável quando a carteira está vazia', async () => {
    investimentoService.obterBreakdown.mockResolvedValue(breakdownVazio);
    investimentoService.obterTetos.mockResolvedValue(tetosVazios);
    renderPanel();

    expect(await screen.findByTestId('estrategia-carteira-vazia')).toBeInTheDocument();
    expect(screen.getByText(/carteira ainda está vazia/i)).toBeInTheDocument();
  });

  it('exibe CTA para configurar tetos quando nenhum teto foi definido', async () => {
    investimentoService.obterTetos.mockResolvedValue(tetosVazios);
    renderPanel();

    expect(await screen.findByTestId('cta-configurar-tetos')).toBeInTheDocument();

    // O CTA abre a área de configuração
    fireEvent.click(within(screen.getByTestId('cta-configurar-tetos')).getByText('Configurar'));
    expect(screen.getByTestId('config-tetos')).toBeInTheDocument();
    expect(screen.queryByTestId('cta-configurar-tetos')).not.toBeInTheDocument();
  });

  it('não exibe o CTA quando já há tetos configurados', async () => {
    renderPanel();

    await screen.findByTestId('breakdown-item-ACAO');
    expect(screen.queryByTestId('cta-configurar-tetos')).not.toBeInTheDocument();
  });

  it('exibe erro de API sem quebrar o painel', async () => {
    investimentoService.obterBreakdown.mockRejectedValue(new Error('network down'));
    renderPanel();

    expect(
      await screen.findByText(/falha ao carregar a estratégia por setores/i),
    ).toBeInTheDocument();
  });
});

describe('EstrategiaSetoresPanel — configuração de tetos', () => {
  const abrirConfig = async () => {
    renderPanel();
    await screen.findByTestId('breakdown-item-ACAO');
    fireEvent.click(screen.getByTestId('btn-configurar-tetos'));
    return screen.getByTestId('config-tetos');
  };

  it('pré-carrega as linhas com os tetos já configurados', async () => {
    const config = await abrirConfig();

    expect(within(config).getByTestId('input-teto-porClasse-0').value).toBe('30');
    expect(within(config).getByTestId('input-teto-porSetor-0').value).toBe('25');
    expect(within(config).getByTestId('input-teto-porGeografia-0').value).toBe('80');
  });

  it('bloqueia o PUT quando um teto está fora de 0 < x ≤ 100', async () => {
    const config = await abrirConfig();

    fireEvent.change(within(config).getByTestId('input-teto-porClasse-0'), {
      target: { value: '150' },
    });
    fireEvent.click(screen.getByTestId('btn-salvar-tetos'));

    expect(await screen.findByText(/maior que 0 e no máximo 100/i)).toBeInTheDocument();
    expect(investimentoService.salvarTetos).not.toHaveBeenCalled();
  });

  it('bloqueia o PUT quando um teto é zero', async () => {
    const config = await abrirConfig();

    fireEvent.change(within(config).getByTestId('input-teto-porSetor-0'), {
      target: { value: '0' },
    });
    fireEvent.click(screen.getByTestId('btn-salvar-tetos'));

    expect(await screen.findByText(/maior que 0 e no máximo 100/i)).toBeInTheDocument();
    expect(investimentoService.salvarTetos).not.toHaveBeenCalled();
  });

  it('envia o PUT com o payload completo (substituição total das 3 dimensões)', async () => {
    const config = await abrirConfig();

    fireEvent.change(within(config).getByTestId('input-teto-porClasse-0'), {
      target: { value: '35' },
    });
    fireEvent.click(screen.getByTestId('btn-salvar-tetos'));

    await waitFor(() => {
      expect(investimentoService.salvarTetos).toHaveBeenCalledWith({
        porClasse: { ACAO: 35 },
        porSetor: { FINANCEIRO: 25 },
        porGeografia: { BRASIL: 80 },
      });
    });

    expect(await screen.findByText(/tetos salvos com sucesso/i)).toBeInTheDocument();
    // Recarrega breakdown + tetos após salvar (2 chamadas: mount + pós-save)
    expect(investimentoService.obterBreakdown).toHaveBeenCalledTimes(2);
  });

  it('remover todas as linhas envia mapas vazios (limpa as dimensões)', async () => {
    const config = await abrirConfig();

    // Remove a única linha de cada dimensão
    fireEvent.click(within(config).getByLabelText(/remover teto por classe 1/i));
    fireEvent.click(within(config).getByLabelText(/remover teto por setor 1/i));
    fireEvent.click(within(config).getByLabelText(/remover teto por geografia 1/i));
    fireEvent.click(screen.getByTestId('btn-salvar-tetos'));

    await waitFor(() => {
      expect(investimentoService.salvarTetos).toHaveBeenCalledWith({
        porClasse: {},
        porSetor: {},
        porGeografia: {},
      });
    });
  });

  it('pré-carrega o teto por ativo individual quando configurado no backend', async () => {
    investimentoService.obterTetos.mockResolvedValue({
      ...tetosConfigurados,
      porAtivoIndividual: 15,
    });
    const config = await abrirConfig();

    expect(within(config).getByTestId('input-teto-por-ativo').value).toBe('15');
  });

  it('bloqueia o PUT quando o teto por ativo está fora de 0 < x ≤ 100', async () => {
    const config = await abrirConfig();

    fireEvent.change(within(config).getByTestId('input-teto-por-ativo'), {
      target: { value: '120' },
    });
    fireEvent.click(screen.getByTestId('btn-salvar-tetos'));

    expect(
      await screen.findByText(/teto por ativo individual deve ser maior que 0 e no máximo 100/i),
    ).toBeInTheDocument();
    expect(investimentoService.salvarTetos).not.toHaveBeenCalled();
  });

  it('inclui porAtivoIndividual no PUT quando preenchido', async () => {
    const config = await abrirConfig();

    fireEvent.change(within(config).getByTestId('input-teto-por-ativo'), {
      target: { value: '10' },
    });
    fireEvent.click(screen.getByTestId('btn-salvar-tetos'));

    await waitFor(() => {
      expect(investimentoService.salvarTetos).toHaveBeenCalledWith({
        porClasse: { ACAO: 30 },
        porSetor: { FINANCEIRO: 25 },
        porGeografia: { BRASIL: 80 },
        porAtivoIndividual: 10,
      });
    });
  });

  it('omite porAtivoIndividual no PUT quando o campo fica vazio (remove o limite)', async () => {
    investimentoService.obterTetos.mockResolvedValue({
      ...tetosConfigurados,
      porAtivoIndividual: 15,
    });
    const config = await abrirConfig();

    fireEvent.change(within(config).getByTestId('input-teto-por-ativo'), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByTestId('btn-salvar-tetos'));

    await waitFor(() => {
      expect(investimentoService.salvarTetos).toHaveBeenCalledWith({
        porClasse: { ACAO: 30 },
        porSetor: { FINANCEIRO: 25 },
        porGeografia: { BRASIL: 80 },
      });
    });
    expect(
      investimentoService.salvarTetos.mock.calls[0][0],
    ).not.toHaveProperty('porAtivoIndividual');
  });

  it('exibe o erro do backend quando o PUT falha (400 teto inválido)', async () => {
    investimentoService.salvarTetos.mockRejectedValue({
      response: {
        status: 400,
        data: { status: 400, error: 'Bad Request', message: 'Teto deve ser maior que zero' },
      },
    });
    await abrirConfig();

    fireEvent.click(screen.getByTestId('btn-salvar-tetos'));

    expect(await screen.findByText(/teto deve ser maior que zero/i)).toBeInTheDocument();
  });
});
