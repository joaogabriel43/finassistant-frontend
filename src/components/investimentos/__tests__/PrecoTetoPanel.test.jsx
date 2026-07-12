import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import theme from '@/theme';
import PrecoTetoPanel from '../PrecoTetoPanel';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('../../../services/investimentoService', () => ({
  investimentoService: {
    obterPrecoTeto: vi.fn(),
    avaliarPrecoTetoAvulso: vi.fn(),
  },
}));

import { investimentoService } from '../../../services/investimentoService';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const carteira = {
  yieldDesejado: 0.06,
  disclaimer: 'Cálculo meramente informativo. Não constitui recomendação de investimento.',
  ativos: [
    {
      ticker: 'PETR4',
      precoAtual: 38.5,
      origemPreco: 'COTACAO',
      bazin: { status: 'VALIDO', precoTeto: 48.2, margemSeguranca: 25.3, veredito: 'ABAIXO_DO_TETO' },
      graham: { status: 'VALIDO', numeroGraham: 34.6, margemSeguranca: -10.1, veredito: 'ACIMA_DO_TETO' },
    },
    {
      ticker: 'MGLU3',
      precoAtual: 12.0,
      origemPreco: 'PRECO_MEDIO',
      bazin: { status: 'INVALIDO', motivo: 'Empresa em prejuízo.' },
      graham: { status: 'SEM_DADOS', motivo: 'Sem dividendos declarados.' },
    },
  ],
};

const carteiraVazia = {
  yieldDesejado: 0.06,
  disclaimer: 'Cálculo meramente informativo.',
  ativos: [],
};

const resultadoAvulso = {
  yieldDesejado: 0.06,
  disclaimer: 'Cálculo meramente informativo.',
  analise: {
    ticker: 'BBAS3',
    precoAtual: 25,
    origemPreco: 'MANUAL',
    bazin: { status: 'VALIDO', precoTeto: 53.3, margemSeguranca: 113.2, veredito: 'ABAIXO_DO_TETO' },
    graham: { status: 'VALIDO', numeroGraham: 40, margemSeguranca: 60, veredito: 'ABAIXO_DO_TETO' },
  },
};

const renderPanel = (props = {}) =>
  render(
    <ThemeProvider theme={theme}>
      <PrecoTetoPanel {...props} />
    </ThemeProvider>,
  );

beforeEach(() => {
  vi.clearAllMocks();
  investimentoService.obterPrecoTeto.mockResolvedValue(carteira);
  investimentoService.avaliarPrecoTetoAvulso.mockResolvedValue(resultadoAvulso);
});

// ─── Tabela da carteira ──────────────────────────────────────────────────────

describe('PrecoTetoPanel — tabela por ação da carteira', () => {
  it('carrega com o yield default de 6% (GET com 0.06)', async () => {
    renderPanel();
    await screen.findByTestId('tabela-preco-teto');

    expect(investimentoService.obterPrecoTeto).toHaveBeenCalledTimes(1);
    expect(investimentoService.obterPrecoTeto).toHaveBeenCalledWith(0.06);
  });

  it('renderiza o preço atual (BRL) e a origem do preço por ação', async () => {
    renderPanel();

    const linha = await screen.findByTestId('linha-PETR4');
    expect(within(linha).getByTestId('preco-atual-PETR4')).toHaveTextContent(/R\$\s*38,50/);
    expect(within(linha).getByTestId('origem-preco-PETR4')).toHaveTextContent('cotação');

    const linhaMglu = screen.getByTestId('linha-MGLU3');
    expect(within(linhaMglu).getByTestId('origem-preco-MGLU3')).toHaveTextContent('preço médio');
  });

  it('renderiza Bazin e Graham lado a lado com teto (BRL) e margem quando VALIDO', async () => {
    renderPanel();

    const linha = await screen.findByTestId('linha-PETR4');
    // Bazin ABAIXO_DO_TETO → margem positiva, "barata", ícone de queda
    expect(within(linha).getByTestId('bazin-PETR4-teto')).toHaveTextContent(/R\$\s*48,20/);
    expect(within(linha).getByTestId('bazin-PETR4-margem')).toHaveTextContent('25,3%');
    expect(within(linha).getByTestId('bazin-PETR4-margem')).toHaveTextContent('+');
    expect(within(within(linha).getByTestId('bazin-PETR4-valido')).getByText('barata')).toBeInTheDocument();

    // Graham ACIMA_DO_TETO → margem negativa, "cara" (numeroGraham como teto)
    expect(within(linha).getByTestId('graham-PETR4-teto')).toHaveTextContent(/R\$\s*34,60/);
    expect(within(linha).getByTestId('graham-PETR4-margem')).toHaveTextContent('10,1%');
    expect(within(within(linha).getByTestId('graham-PETR4-valido')).getByText('cara')).toBeInTheDocument();
  });

  it('colore a margem pelo veredito (ícone de tendência distingue barata × cara)', async () => {
    renderPanel();
    const linha = await screen.findByTestId('linha-PETR4');

    // ABAIXO_DO_TETO usa ícone de queda; ACIMA_DO_TETO usa ícone de alta
    expect(
      within(within(linha).getByTestId('bazin-PETR4-valido')).getByTestId('TrendingDownIcon'),
    ).toBeInTheDocument();
    expect(
      within(within(linha).getByTestId('graham-PETR4-valido')).getByTestId('TrendingUpIcon'),
    ).toBeInTheDocument();
  });

  it('mostra o motivo (sem número) quando o método é INVALIDO ou SEM_DADOS', async () => {
    renderPanel();

    const linha = await screen.findByTestId('linha-MGLU3');
    // Bazin INVALIDO → motivo textual, nenhum teto renderizado
    expect(within(linha).getByTestId('bazin-MGLU3-indisponivel')).toHaveTextContent('Empresa em prejuízo.');
    expect(within(linha).queryByTestId('bazin-MGLU3-teto')).not.toBeInTheDocument();

    // Graham SEM_DADOS → motivo textual, nenhum número quebrado
    expect(within(linha).getByTestId('graham-MGLU3-indisponivel')).toHaveTextContent('Sem dividendos declarados.');
    expect(within(linha).queryByTestId('graham-MGLU3-teto')).not.toBeInTheDocument();
  });
});

// ─── Controle de yield ───────────────────────────────────────────────────────

describe('PrecoTetoPanel — controle de yield desejado', () => {
  it('refaz o GET com o novo yield ao aplicar (6% → 7%)', async () => {
    renderPanel();
    await screen.findByTestId('tabela-preco-teto');
    expect(investimentoService.obterPrecoTeto).toHaveBeenCalledTimes(1);

    fireEvent.change(screen.getByTestId('input-yield'), { target: { value: '7' } });
    fireEvent.click(screen.getByTestId('btn-aplicar-yield'));

    await waitFor(() => {
      expect(investimentoService.obterPrecoTeto).toHaveBeenCalledTimes(2);
    });
    expect(investimentoService.obterPrecoTeto).toHaveBeenLastCalledWith(0.07);
    expect(screen.getByTestId('yield-aplicado')).toHaveTextContent('7%');
  });
});

// ─── Avaliador avulso ────────────────────────────────────────────────────────

describe('PrecoTetoPanel — avaliador avulso', () => {
  const preencherEEnviar = async (campos) => {
    renderPanel();
    await screen.findByTestId('preco-teto-panel');
    if (campos.ticker != null) fireEvent.change(screen.getByTestId('avulso-ticker'), { target: { value: campos.ticker } });
    if (campos.precoAtual != null) fireEvent.change(screen.getByTestId('avulso-preco'), { target: { value: campos.precoAtual } });
    if (campos.dividendoAnual != null) fireEvent.change(screen.getByTestId('avulso-dividendo'), { target: { value: campos.dividendoAnual } });
    if (campos.lpa != null) fireEvent.change(screen.getByTestId('avulso-lpa'), { target: { value: campos.lpa } });
    if (campos.vpa != null) fireEvent.change(screen.getByTestId('avulso-vpa'), { target: { value: campos.vpa } });
    fireEvent.click(screen.getByTestId('btn-avaliar-avulso'));
  };

  it('faz POST com o payload correto incluindo os campos manuais e o yield aplicado', async () => {
    await preencherEEnviar({
      ticker: 'bbas3',
      precoAtual: '25,00',
      dividendoAnual: '3,20',
      lpa: '5,5',
      vpa: '12',
    });

    await waitFor(() => {
      expect(investimentoService.avaliarPrecoTetoAvulso).toHaveBeenCalledWith({
        ticker: 'BBAS3',
        yieldDesejado: 0.06,
        precoAtual: 25,
        dividendoAnual: 3.2,
        lpa: 5.5,
        vpa: 12,
      });
    });

    // Renderiza a análise retornada com o mesmo layout Bazin/Graham
    const linha = await screen.findByTestId('avulso-linha-BBAS3');
    expect(within(linha).getByTestId('avulso-preco-atual')).toHaveTextContent(/R\$\s*25,00/);
    expect(within(linha).getByTestId('avulso-bazin-teto')).toHaveTextContent(/R\$\s*53,30/);
  });

  it('omite do payload os campos manuais deixados em branco (só ticker + yield)', async () => {
    await preencherEEnviar({ ticker: 'PETR4' });

    await waitFor(() => {
      expect(investimentoService.avaliarPrecoTetoAvulso).toHaveBeenCalledWith({
        ticker: 'PETR4',
        yieldDesejado: 0.06,
      });
    });
  });

  it('bloqueia o envio sem ticker (não chama a API)', async () => {
    await preencherEEnviar({ precoAtual: '10' });

    expect(await screen.findByTestId('avulso-erro')).toHaveTextContent(/informe o ticker/i);
    expect(investimentoService.avaliarPrecoTetoAvulso).not.toHaveBeenCalled();
  });

  it('trata o 400 do backend exibindo a mensagem do erro', async () => {
    investimentoService.avaliarPrecoTetoAvulso.mockRejectedValue({
      response: { status: 400, data: { status: 400, message: 'Preço atual deve ser positivo.' } },
    });
    await preencherEEnviar({ ticker: 'BBAS3', precoAtual: '10' });

    const erro = await screen.findByTestId('avulso-erro');
    expect(erro).toHaveTextContent('Preço atual deve ser positivo.');
  });
});

// ─── Disclaimer, estado vazio e erro ─────────────────────────────────────────

describe('PrecoTetoPanel — disclaimer, vazio e erro', () => {
  it('renderiza o disclaimer vindo da API (nunca hardcoded)', async () => {
    renderPanel();

    const disclaimer = await screen.findByTestId('preco-teto-disclaimer');
    expect(disclaimer).toHaveTextContent(
      'Cálculo meramente informativo. Não constitui recomendação de investimento.',
    );
  });

  it('exibe estado vazio amigável quando a carteira não tem ações', async () => {
    investimentoService.obterPrecoTeto.mockResolvedValue(carteiraVazia);
    renderPanel();

    expect(await screen.findByTestId('preco-teto-vazio')).toHaveTextContent(
      /adicione ações à carteira/i,
    );
    expect(screen.queryByTestId('tabela-preco-teto')).not.toBeInTheDocument();
  });

  it('exibe erro de API sem quebrar o painel', async () => {
    investimentoService.obterPrecoTeto.mockRejectedValue(new Error('network down'));
    renderPanel();

    expect(await screen.findByTestId('preco-teto-erro')).toHaveTextContent(
      /falha ao carregar a análise de preço-teto/i,
    );
  });

  it('explica os métodos Bazin e Graham num accordion acessível', async () => {
    renderPanel();
    await screen.findByTestId('preco-teto-panel');

    const explicacao = screen.getByTestId('metodos-explicacao');
    expect(within(explicacao).getByText(/Método Bazin:/)).toBeInTheDocument();
    expect(within(explicacao).getByText(/Método Graham:/)).toBeInTheDocument();
  });
});
