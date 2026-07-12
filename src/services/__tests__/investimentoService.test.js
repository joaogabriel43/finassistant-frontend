import { vi, describe, it, expect, beforeEach } from 'vitest';

// ─── Mock do client HTTP (zero chamadas reais) ──────────────────────────────

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from '../api';
import { investimentoService } from '../investimentoService';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('investimentoService — CRUD de posições do portfólio', () => {
  it('adicionarAtivo faz POST em /investimentos/portfolio/ativos com o payload', async () => {
    api.post.mockResolvedValue({ data: undefined });
    const payload = {
      ticker: 'PETR4',
      quantidade: 10,
      precoCompra: 32.5,
      tipoAtivo: 'ACAO',
      dataCompra: '2026-07-10',
    };

    await investimentoService.adicionarAtivo(payload);

    expect(api.post).toHaveBeenCalledWith('/investimentos/portfolio/ativos', payload);
  });

  it('editarAtivo faz PUT em /investimentos/portfolio/ativos/{ticker} e retorna a posição atualizada', async () => {
    const resposta = { ticker: 'PETR4', quantidade: 150, precoMedio: 30, tipoAtivo: 'ACAO', dataCompra: '2026-01-15' };
    api.put.mockResolvedValue({ data: resposta });

    const resultado = await investimentoService.editarAtivo('PETR4', { quantidade: 150, precoMedio: 30 });

    expect(api.put).toHaveBeenCalledWith('/investimentos/portfolio/ativos/PETR4', {
      quantidade: 150,
      precoMedio: 30,
    });
    expect(resultado).toEqual(resposta);
  });

  it('removerAtivo faz DELETE em /investimentos/portfolio/ativos/{ticker} com ticker URL-encoded', async () => {
    api.delete.mockResolvedValue({});

    await investimentoService.removerAtivo('BTC/USD');

    expect(api.delete).toHaveBeenCalledWith('/investimentos/portfolio/ativos/BTC%2FUSD');
  });

  it('propaga o erro da API para o chamador (rethrow)', async () => {
    const erro = { response: { status: 400, data: { error: 'Validation Failed' } } };
    api.post.mockRejectedValue(erro);

    await expect(
      investimentoService.adicionarAtivo({ ticker: 'X', quantidade: 1, precoCompra: 1 }),
    ).rejects.toBe(erro);
  });
});

describe('investimentoService — saúde da carteira (alertas + aporte)', () => {
  it('obterAlertas faz GET em /investimentos/estrategia/alertas e retorna o payload', async () => {
    const resposta = {
      alertas: [{ dimensao: 'ATIVO', chave: 'PETR4', percentualReal: 35, limite: 20, excesso: 15 }],
      scoreAderencia: 72.5,
      motivoScoreIndisponivel: null,
    };
    api.get.mockResolvedValue({ data: resposta });

    const resultado = await investimentoService.obterAlertas();

    expect(api.get).toHaveBeenCalledWith('/investimentos/estrategia/alertas');
    expect(resultado).toEqual(resposta);
  });

  it('sugerirAporte faz POST em /investimentos/estrategia/aporte com { valor }', async () => {
    const resposta = {
      valorAporte: 1000,
      parcelas: [{ classe: 'ACAO', valor: 600 }],
      valorNaoAlocavel: 400,
      motivoNaoAlocavel: 'Teto atingido',
      simulacao: [],
      disclaimer: 'Sugestão informativa.',
    };
    api.post.mockResolvedValue({ data: resposta });

    const resultado = await investimentoService.sugerirAporte(1000);

    expect(api.post).toHaveBeenCalledWith('/investimentos/estrategia/aporte', { valor: 1000 });
    expect(resultado).toEqual(resposta);
  });

  it('sugerirAporte propaga o 400 do backend (sem estratégia configurada)', async () => {
    const erro = {
      response: { status: 400, data: { status: 400, message: 'Nenhuma estratégia configurada' } },
    };
    api.post.mockRejectedValue(erro);

    await expect(investimentoService.sugerirAporte(500)).rejects.toBe(erro);
  });
});

describe('investimentoService — preço-teto (valuation Bazin + Graham)', () => {
  it('obterPrecoTeto faz GET em /investimentos/valuation/preco-teto com o yield como query param', async () => {
    const resposta = { yieldDesejado: 0.07, ativos: [], disclaimer: 'Metodologia informativa.' };
    api.get.mockResolvedValue({ data: resposta });

    const resultado = await investimentoService.obterPrecoTeto(0.07);

    expect(api.get).toHaveBeenCalledWith('/investimentos/valuation/preco-teto?yield=0.07');
    expect(resultado).toEqual(resposta);
  });

  it('obterPrecoTeto sem yield omite a query param (backend usa o default)', async () => {
    api.get.mockResolvedValue({ data: { yieldDesejado: 0.06, ativos: [], disclaimer: 'x' } });

    await investimentoService.obterPrecoTeto();

    expect(api.get).toHaveBeenCalledWith('/investimentos/valuation/preco-teto');
  });

  it('obterPrecoTeto propaga o 400 do backend (yield ≤ 0)', async () => {
    const erro = { response: { status: 400, data: { status: 400, message: 'yield deve ser positivo' } } };
    api.get.mockRejectedValue(erro);

    await expect(investimentoService.obterPrecoTeto(0)).rejects.toBe(erro);
  });

  it('avaliarPrecoTetoAvulso faz POST em /investimentos/valuation/preco-teto/avulso com o payload', async () => {
    const payload = { ticker: 'BBAS3', yieldDesejado: 0.06, dividendoAnual: 3.2, lpa: 5.5, vpa: 12 };
    const resposta = { yieldDesejado: 0.06, analise: { ticker: 'BBAS3' }, disclaimer: 'x' };
    api.post.mockResolvedValue({ data: resposta });

    const resultado = await investimentoService.avaliarPrecoTetoAvulso(payload);

    expect(api.post).toHaveBeenCalledWith('/investimentos/valuation/preco-teto/avulso', payload);
    expect(resultado).toEqual(resposta);
  });

  it('avaliarPrecoTetoAvulso propaga o 400 do backend (ticker ausente)', async () => {
    const erro = { response: { status: 400, data: { status: 400, message: 'ticker é obrigatório' } } };
    api.post.mockRejectedValue(erro);

    await expect(investimentoService.avaliarPrecoTetoAvulso({})).rejects.toBe(erro);
  });
});
