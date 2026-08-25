import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import ImportacaoLoteInvestimentosModal from '../ImportacaoLoteInvestimentosModal'

vi.mock('../../../services/api', () => ({
  default: {
    post: vi.fn(),
  },
}))

import api from '../../../services/api'

const PREVIEW_ID = '11111111-1111-1111-1111-111111111111'

const createMockFile = (name = 'investimentos.csv', type = 'text/csv') => {
  return new File(
    ['classe;ativo;operacao;data;quantidade;preco_unitario;valor_total\nAções;FICT3;Compra;01/03/2026;10;25,50;255,00'],
    name,
    { type }
  )
}

const itemPronto = (overrides = {}) => ({
  linha: 2,
  classe: 'Ações',
  ticker: 'FICT3',
  operacao: 'COMPRA',
  data: '2026-03-01',
  quantidade: 10,
  precoUnitario: 25.5,
  valorTotal: 255.0,
  tipoAtivo: 'ACAO',
  erro: null,
  previewId: PREVIEW_ID,
  ...overrides,
})

describe('ImportacaoLoteInvestimentosModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar dropzone para CSV', () => {
    render(<ImportacaoLoteInvestimentosModal open={true} onClose={vi.fn()} />)

    expect(screen.getByText('Importar Investimentos (CSV)')).toBeInTheDocument()
    expect(screen.getByText(/Arraste um arquivo CSV de investimentos/)).toBeInTheDocument()
    expect(screen.getByText('Analisar Arquivo')).toBeInTheDocument()
  })

  it('deve exibir preview segregado em prontos/eventos/erros', async () => {
    api.post.mockResolvedValueOnce({
      data: {
        prontos: [itemPronto()],
        eventosCorporativos: [
          { linha: 3, classe: 'Ações', ticker: 'FICT4', operacao: 'DESDOBRAMENTO', data: '2026-03-02', quantidade: 0, precoUnitario: 0, valorTotal: 0, tipoAtivo: null, erro: null, previewId: null },
        ],
        erros: [
          { linha: 4, classe: null, ticker: null, operacao: null, data: null, quantidade: 0, precoUnitario: null, valorTotal: null, tipoAtivo: null, erro: 'Linha malformada', previewId: null },
        ],
        totalLinhas: 3,
        previewId: PREVIEW_ID,
      },
    })

    render(<ImportacaoLoteInvestimentosModal open={true} onClose={vi.fn()} />)

    const input = document.querySelector('input[type="file"]')
    fireEvent.change(input, { target: { files: [createMockFile()] } })
    fireEvent.click(screen.getByText('Analisar Arquivo'))

    await waitFor(() => {
      expect(screen.getByText('Preview da Importação')).toBeInTheDocument()
      expect(screen.getByText(/3 linhas encontradas/)).toBeInTheDocument()
      expect(screen.getByText(/1 prontas para importar/)).toBeInTheDocument()
      expect(screen.getByText(/1 eventos corporativos/)).toBeInTheDocument()
      expect(screen.getByText(/1 com erro/)).toBeInTheDocument()
      expect(screen.getByText('FICT3')).toBeInTheDocument()
      expect(screen.getByText(/FICT4 — Desdobramento/)).toBeInTheDocument()
      expect(screen.getByText(/Linha malformada/)).toBeInTheDocument()
    })
  })

  it('deve permitir desmarcar um item pronto antes de confirmar', async () => {
    api.post.mockResolvedValueOnce({
      data: {
        prontos: [itemPronto({ linha: 2, ticker: 'FICT3' }), itemPronto({ linha: 5, ticker: 'FICT4' })],
        eventosCorporativos: [],
        erros: [],
        totalLinhas: 2,
        previewId: PREVIEW_ID,
      },
    })

    render(<ImportacaoLoteInvestimentosModal open={true} onClose={vi.fn()} />)

    const input = document.querySelector('input[type="file"]')
    fireEvent.change(input, { target: { files: [createMockFile()] } })
    fireEvent.click(screen.getByText('Analisar Arquivo'))

    await waitFor(() => {
      expect(screen.getByText(/Importar 2 operações/)).toBeInTheDocument()
    })

    const checkboxItem1 = screen.getByTestId('checkbox-item-1').querySelector('input[type="checkbox"]')
    fireEvent.click(checkboxItem1)

    await waitFor(() => {
      expect(screen.getByText(/Importar 1 operações/)).toBeInTheDocument()
    })
  })

  it('deve confirmar e importar apenas os itens selecionados', async () => {
    api.post
      .mockResolvedValueOnce({
        data: {
          prontos: [itemPronto()],
          eventosCorporativos: [],
          erros: [],
          totalLinhas: 1,
          previewId: PREVIEW_ID,
        },
      })
      .mockResolvedValueOnce({
        data: { mensagem: '1 operações importadas com sucesso!', totalImportadas: 1 },
      })

    render(<ImportacaoLoteInvestimentosModal open={true} onClose={vi.fn()} />)

    const input = document.querySelector('input[type="file"]')
    fireEvent.change(input, { target: { files: [createMockFile()] } })
    fireEvent.click(screen.getByText('Analisar Arquivo'))

    await waitFor(() => {
      expect(screen.getByText(/Importar 1 operações/)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText(/Importar 1 operações/))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/investimentos/portfolio/ativos/lote/confirmar',
        { itens: [itemPronto()], eventosCorporativos: [] }
      )
      expect(screen.getByText(/1 operações importadas com sucesso!/)).toBeInTheDocument()
    })
  })

  it('deve chamar onImportado ao fechar após importação bem-sucedida', async () => {
    const onImportado = vi.fn()
    const onClose = vi.fn()

    api.post
      .mockResolvedValueOnce({
        data: { prontos: [itemPronto()], eventosCorporativos: [], erros: [], totalLinhas: 1, previewId: PREVIEW_ID },
      })
      .mockResolvedValueOnce({
        data: { mensagem: '1 operações importadas com sucesso!', totalImportadas: 1 },
      })

    render(<ImportacaoLoteInvestimentosModal open={true} onClose={onClose} onImportado={onImportado} />)

    const input = document.querySelector('input[type="file"]')
    fireEvent.change(input, { target: { files: [createMockFile()] } })
    fireEvent.click(screen.getByText('Analisar Arquivo'))

    await waitFor(() => screen.getByText(/Importar 1 operações/))
    fireEvent.click(screen.getByText(/Importar 1 operações/))

    await waitFor(() => screen.getByText(/1 operações importadas com sucesso!/))

    fireEvent.click(screen.getByTestId('btn-fechar-sucesso'))

    expect(onImportado).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('deve exibir erro retornado pelo backend ao analisar arquivo', async () => {
    api.post.mockRejectedValueOnce({
      response: { data: { erro: 'ARQUIVO_INVALIDO', mensagem: 'Envie um arquivo .csv de até 5MB.' } },
    })

    render(<ImportacaoLoteInvestimentosModal open={true} onClose={vi.fn()} />)

    const input = document.querySelector('input[type="file"]')
    fireEvent.change(input, { target: { files: [createMockFile()] } })
    fireEvent.click(screen.getByText('Analisar Arquivo'))

    await waitFor(() => {
      expect(screen.getByText('Envie um arquivo .csv de até 5MB.')).toBeInTheDocument()
    })
  })

  const previewComEventoPendenteDeFator = () => ({
    data: {
      prontos: [
        itemPronto({ linha: 2, ticker: 'FICT3', operacao: 'COMPRA', data: '2026-03-01' }),
        itemPronto({ linha: 6, ticker: 'FICT3', operacao: 'VENDA', data: '2026-03-05' }),
      ],
      eventosCorporativos: [
        {
          linha: 4,
          classe: 'Ações',
          ticker: 'FICT3',
          operacao: 'DESDOBRAMENTO',
          data: '2026-03-03',
          quantidade: 0,
          precoUnitario: 0,
          valorTotal: 0,
          tipoAtivo: null,
          erro: null,
          previewId: null,
        },
      ],
      erros: [],
      totalLinhas: 3,
      previewId: PREVIEW_ID,
    },
  })

  it('deve exigir o fator de um evento corporativo com venda subsequente e bloquear o botão de importar', async () => {
    api.post.mockResolvedValueOnce(previewComEventoPendenteDeFator())

    render(<ImportacaoLoteInvestimentosModal open={true} onClose={vi.fn()} />)

    const input = document.querySelector('input[type="file"]')
    fireEvent.change(input, { target: { files: [createMockFile()] } })
    fireEvent.click(screen.getByText('Analisar Arquivo'))

    await waitFor(() => {
      expect(screen.getByTestId('input-fator-evento-4')).toBeInTheDocument()
    })

    expect(screen.getByTestId('btn-confirmar-importacao')).toBeDisabled()
  })

  it('deve liberar o botão de importar ao preencher o fator do evento corporativo', async () => {
    api.post.mockResolvedValueOnce(previewComEventoPendenteDeFator())

    render(<ImportacaoLoteInvestimentosModal open={true} onClose={vi.fn()} />)

    const input = document.querySelector('input[type="file"]')
    fireEvent.change(input, { target: { files: [createMockFile()] } })
    fireEvent.click(screen.getByText('Analisar Arquivo'))

    await waitFor(() => {
      expect(screen.getByTestId('input-fator-evento-4')).toBeInTheDocument()
    })

    const fatorInput = screen.getByTestId('input-fator-evento-4').querySelector('input')
    fireEvent.change(fatorInput, { target: { value: '2' } })

    await waitFor(() => {
      expect(screen.getByTestId('btn-confirmar-importacao')).not.toBeDisabled()
    })

    api.post.mockResolvedValueOnce({
      data: { mensagem: '2 operações importadas com sucesso!', totalImportadas: 2 },
    })

    fireEvent.click(screen.getByTestId('btn-confirmar-importacao'))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/investimentos/portfolio/ativos/lote/confirmar',
        {
          itens: [
            itemPronto({ linha: 2, ticker: 'FICT3', operacao: 'COMPRA', data: '2026-03-01' }),
            itemPronto({ linha: 6, ticker: 'FICT3', operacao: 'VENDA', data: '2026-03-05' }),
          ],
          eventosCorporativos: [
            { linha: 4, ticker: 'FICT3', operacao: 'DESDOBRAMENTO', data: '2026-03-03', fator: 2 },
          ],
        }
      )
    })
  })

  it('deve exibir a mensagem especifica de erro 422 do backend, nao um erro generico', async () => {
    api.post.mockResolvedValueOnce(previewComEventoPendenteDeFator())

    render(<ImportacaoLoteInvestimentosModal open={true} onClose={vi.fn()} />)

    const input = document.querySelector('input[type="file"]')
    fireEvent.change(input, { target: { files: [createMockFile()] } })
    fireEvent.click(screen.getByText('Analisar Arquivo'))

    await waitFor(() => {
      expect(screen.getByTestId('input-fator-evento-4')).toBeInTheDocument()
    })

    const fatorInput = screen.getByTestId('input-fator-evento-4').querySelector('input')
    fireEvent.change(fatorInput, { target: { value: '0.5' } })

    await waitFor(() => {
      expect(screen.getByTestId('btn-confirmar-importacao')).not.toBeDisabled()
    })

    const mensagemEspecifica = 'O evento de Desdobramento para FICT3 em 2026-03-03 (linha 4) tem uma venda '
      + 'subsequente no mesmo lote e precisa do fator de ajuste antes de confirmar a importação.'
    api.post.mockRejectedValueOnce({
      response: { data: { message: mensagemEspecifica } },
    })

    fireEvent.click(screen.getByTestId('btn-confirmar-importacao'))

    await waitFor(() => {
      expect(screen.getByText(mensagemEspecifica)).toBeInTheDocument()
    })
    expect(screen.queryByText('Erro ao importar os ativos.')).not.toBeInTheDocument()
  })
})
