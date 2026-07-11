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
