import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// ← RED: NfceScannerModal.jsx não existe ainda — import falha na compilação
import NfceScannerModal from './NfceScannerModal'

vi.mock('../../services/api', () => ({
  default: {
    post: vi.fn(),
  },
}))

import api from '../../services/api'

// ── Fixtures ─────────────────────────────────────────────────────────────────

const URL_VALIDA = 'https://www.nfce.fazenda.sp.gov.br/consulta?p=35230612345678000195650010000000011123456785'

const MOCK_NFCE_DTO = {
  estabelecimento: 'SUPERMERCADO PAULISTA LTDA',
  dataEmissao: '2025-12-20',
  valorTotal: 87.60,
  chaveAcesso: '35230612345678000195650010000000011123456785',
  itens: [
    {
      descricao: 'ARROZ TIPO 1 5KG',
      quantidade: 2,
      valorUnitario: 15.90,
      valorTotal: 31.80,
      categoria: 'Alimentação',
    },
    {
      descricao: 'DETERGENTE LIMPOL 500ML',
      quantidade: 1,
      valorUnitario: 4.50,
      valorTotal: 4.50,
      categoria: 'Limpeza',
    },
  ],
}

const MOCK_TRANSACOES_IMPORTADAS = [
  { id: 'tx-1', descricao: 'ARROZ TIPO 1 5KG', valor: 31.80 },
  { id: 'tx-2', descricao: 'DETERGENTE LIMPOL 500ML', valor: 4.50 },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderModal(props = {}) {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onSuccess: vi.fn(),
    ...props,
  }
  return render(<NfceScannerModal {...defaultProps} />)
}

// ── Testes ───────────────────────────────────────────────────────────────────

describe('NfceScannerModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── STEP 1 — Input de URL ─────────────────────────────────────────────────

  it('Step 1: renderiza campo de URL com label correto', () => {
    renderModal()
    // Campo deve ter label "URL da Nota Fiscal Eletrônica" (ou similar)
    expect(
      screen.getByLabelText(/URL da Nota Fiscal/i)
    ).toBeInTheDocument()
  })

  it('Step 1: placeholder correto no campo de URL', () => {
    renderModal()
    const input = screen.getByPlaceholderText(/Cole a URL da NF-e/i)
    expect(input).toBeInTheDocument()
  })

  it('Step 1: botão "Analisar" desabilitado quando campo URL está vazio', () => {
    renderModal()
    const btn = screen.getByRole('button', { name: /analisar/i })
    expect(btn).toBeDisabled()
  })

  it('Step 1: botão "Analisar" habilitado após preencher URL', () => {
    renderModal()
    const input = screen.getByLabelText(/URL da Nota Fiscal/i)
    fireEvent.change(input, { target: { value: URL_VALIDA } })

    const btn = screen.getByRole('button', { name: /analisar/i })
    expect(btn).not.toBeDisabled()
  })

  it('Step 1: erro de URL inválida exibe mensagem de erro', async () => {
    api.post.mockRejectedValueOnce({
      response: {
        status: 400,
        data: { erro: 'NF-e Inválida', mensagem: 'URL não reconhecida como endpoint SEFAZ' },
      },
    })

    renderModal()
    const input = screen.getByLabelText(/URL da Nota Fiscal/i)
    fireEvent.change(input, { target: { value: 'https://site-invalido.com/nfce' } })
    fireEvent.click(screen.getByRole('button', { name: /analisar/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
    expect(screen.getByText(/URL não reconhecida|inválida/i)).toBeInTheDocument()
  })

  // ── STEP 2 — Preview dos itens ────────────────────────────────────────────

  it('Step 2: após POST /preview com sucesso, exibe nome do estabelecimento', async () => {
    api.post.mockResolvedValueOnce({ data: MOCK_NFCE_DTO })

    renderModal()
    const input = screen.getByLabelText(/URL da Nota Fiscal/i)
    fireEvent.change(input, { target: { value: URL_VALIDA } })
    fireEvent.click(screen.getByRole('button', { name: /analisar/i }))

    await waitFor(() => {
      expect(screen.getByText('SUPERMERCADO PAULISTA LTDA')).toBeInTheDocument()
    })
  })

  it('Step 2: lista de itens com checkboxes é exibida', async () => {
    api.post.mockResolvedValueOnce({ data: MOCK_NFCE_DTO })

    renderModal()
    const input = screen.getByLabelText(/URL da Nota Fiscal/i)
    fireEvent.change(input, { target: { value: URL_VALIDA } })
    fireEvent.click(screen.getByRole('button', { name: /analisar/i }))

    await waitFor(() => {
      expect(screen.getByText(/ARROZ TIPO 1 5KG/i)).toBeInTheDocument()
    })

    // Cada item deve ter um checkbox
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes.length).toBeGreaterThanOrEqual(MOCK_NFCE_DTO.itens.length)
  })

  it('Step 2: toggle "Importar como itens separados" está presente', async () => {
    api.post.mockResolvedValueOnce({ data: MOCK_NFCE_DTO })

    renderModal()
    const input = screen.getByLabelText(/URL da Nota Fiscal/i)
    fireEvent.change(input, { target: { value: URL_VALIDA } })
    fireEvent.click(screen.getByRole('button', { name: /analisar/i }))

    await waitFor(() => {
      expect(screen.getByText(/importar como itens separados/i)).toBeInTheDocument()
    })
  })

  it('Step 2: checkboxes funcionam — desmarcar item remove da seleção', async () => {
    api.post.mockResolvedValueOnce({ data: MOCK_NFCE_DTO })

    renderModal()
    const input = screen.getByLabelText(/URL da Nota Fiscal/i)
    fireEvent.change(input, { target: { value: URL_VALIDA } })
    fireEvent.click(screen.getByRole('button', { name: /analisar/i }))

    await waitFor(() => {
      expect(screen.getByText(/ARROZ TIPO 1 5KG/i)).toBeInTheDocument()
    })

    const checkboxes = screen.getAllByRole('checkbox')
    // Clicar no primeiro checkbox (desmarca o item)
    fireEvent.click(checkboxes[0])

    // Contador de itens selecionados deve diminuir ou botão Importar desabilitar
    // A exibição exata depende da implementação — pelo menos não deve causar erro
    expect(checkboxes[0]).not.toBeChecked()
  })

  // ── STEP 3 — Sucesso ──────────────────────────────────────────────────────

  it('Step 3: após POST /importar com sucesso, exibe mensagem de confirmação', async () => {
    // POST /preview → retorna NfceDTO
    api.post.mockResolvedValueOnce({ data: MOCK_NFCE_DTO })
    // POST /importar → retorna lista de transações
    api.post.mockResolvedValueOnce({ data: MOCK_TRANSACOES_IMPORTADAS })

    renderModal()
    // Step 1 → Step 2
    const input = screen.getByLabelText(/URL da Nota Fiscal/i)
    fireEvent.change(input, { target: { value: URL_VALIDA } })
    fireEvent.click(screen.getByRole('button', { name: /analisar/i }))

    await waitFor(() => {
      expect(screen.getByText('SUPERMERCADO PAULISTA LTDA')).toBeInTheDocument()
    })

    // Step 2 → Step 3
    fireEvent.click(screen.getByRole('button', { name: /importar/i }))

    await waitFor(() => {
      // Step 3 deve mostrar mensagem de sucesso
      expect(
        screen.getByText(/transaç(ão|ões) importada|sucesso/i)
      ).toBeInTheDocument()
    })
  })

  // ── Integração com OrcamentoPage ──────────────────────────────────────────

  it('modal é controlado por prop "open" — fecha quando open=false', async () => {
    const { rerender } = renderModal({ open: true })

    // Com open=true: campo de URL deve estar visível
    expect(screen.getByLabelText(/URL da Nota Fiscal/i)).toBeInTheDocument()

    // Fechar modal — rerender com open=false
    rerender(
      <NfceScannerModal open={false} onClose={vi.fn()} onSuccess={vi.fn()} />
    )

    // MUI Dialog usa animação de saída (Fade 300ms) — waitFor aguarda desmontagem
    await waitFor(() => {
      expect(screen.queryByLabelText(/URL da Nota Fiscal/i)).not.toBeInTheDocument()
    }, { timeout: 1000 })
  })
})
