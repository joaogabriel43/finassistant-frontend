import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../../theme';
import CartoesCard from '../CartoesCard';

vi.mock('../../../services/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

import api from '../../../services/api';

const renderCard = () =>
  render(
    <ThemeProvider theme={theme}>
      <CartoesCard />
    </ThemeProvider>
  );

const cartoes = [
  {
    id: 'c1', nome: 'Roxinho', bandeira: 'Master', limiteTotal: 2000.0,
    diaFechamento: 5, diaVencimento: 15,
    faturaAberta: 300.0, percentualLimite: 15.0,
    proximoFechamento: '2026-07-05', proximoVencimento: '2026-07-15',
  },
  {
    id: 'c2', nome: 'Sem limite', bandeira: null, limiteTotal: null,
    diaFechamento: 10, diaVencimento: 20,
    faturaAberta: 120.5, percentualLimite: null,
    proximoFechamento: '2026-07-10', proximoVencimento: '2026-07-20',
  },
];

describe('CartoesCard (ADR-035)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: cartoes });
  });

  it('lista cartões com fatura aberta e dias de fechamento/vencimento', async () => {
    renderCard();

    expect(await screen.findByText('Roxinho')).toBeInTheDocument();
    expect(screen.getByText(/fecha dia 5 · vence dia 15/i)).toBeInTheDocument();
    expect(screen.getByText('Sem limite')).toBeInTheDocument();
  });

  it('sem cartões mostra o convite com aviso de nunca usar o número real', async () => {
    api.get.mockResolvedValue({ data: [] });
    renderCard();

    expect(await screen.findByText(/nunca o número real/i)).toBeInTheDocument();
  });

  it('dialog de novo cartão exibe o aviso anti-PAN e envia o POST', async () => {
    api.post.mockResolvedValue({ data: {} });
    renderCard();

    fireEvent.click(await screen.findByRole('button', { name: /novo cartão/i }));
    expect(screen.getByText(/nunca digite o número real do cartão/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/apelido do cartão/i), { target: { value: 'Nubank' } });
    fireEvent.change(screen.getByLabelText(/dia fechamento/i), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText(/dia vencimento/i), { target: { value: '15' } });
    fireEvent.click(screen.getByRole('button', { name: /^criar$/i }));

    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/cartoes', expect.objectContaining({
      nome: 'Nubank', diaFechamento: 5, diaVencimento: 15,
    })));
  });

  it('lançar compra parcelada envia cartaoId, valor decimal PT-BR e parcelas', async () => {
    api.post.mockResolvedValue({ data: [] });
    renderCard();

    fireEvent.click((await screen.findAllByLabelText(/lançar compra/i))[0]);
    fireEvent.change(screen.getByLabelText(/descrição/i), { target: { value: 'Notebook' } });
    fireEvent.change(screen.getByLabelText(/valor total/i), { target: { value: '1.200,00' } });
    fireEvent.click(screen.getByRole('button', { name: /^lançar$/i }));

    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/cartoes/compra', expect.objectContaining({
      cartaoId: 'c1', valor: 1200, descricao: 'Notebook',
    })));
  });

  it('erro do backend (ex.: anti-PAN 422) aparece no alerta', async () => {
    api.post.mockRejectedValue({
      response: { status: 422, data: { message: 'Não insira o número real do cartão — use apenas um apelido.' } },
    });
    renderCard();

    fireEvent.click(await screen.findByRole('button', { name: /novo cartão/i }));
    fireEvent.change(screen.getByLabelText(/apelido do cartão/i), { target: { value: 'x' } });
    fireEvent.change(screen.getByLabelText(/dia fechamento/i), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText(/dia vencimento/i), { target: { value: '15' } });
    fireEvent.click(screen.getByRole('button', { name: /^criar$/i }));

    expect(await screen.findByText(/use apenas um apelido/i)).toBeInTheDocument();
  });
});
