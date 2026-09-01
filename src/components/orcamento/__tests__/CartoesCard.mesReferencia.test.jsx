import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { ThemeProvider } from '@mui/material/styles'
import theme from '../../../theme'
import CartoesCard from '../CartoesCard'
import { MesOrcamentoProvider, useMesOrcamento } from '../../../contexts/MesOrcamentoContext'
import { hojeLocal } from '../../../utils/dateUtils'

vi.mock('../../../services/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}))

import api from '../../../services/api'

const CARTAO = {
  id: 'c1', nome: 'Roxinho', bandeira: 'Master', faturaAberta: 260,
  limiteTotal: 1000, percentualLimite: 26, diaFechamento: 20, diaVencimento: 28,
}

const FATURA = {
  cartaoId: 'c1', nomeCartao: 'Roxinho',
  inicioCiclo: '2026-05-21', fechamento: '2026-06-20', vencimento: '2026-06-28',
  total: 260, itens: [], porCategoria: [],
}

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

const Navegador = () => {
  const { navegar } = useMesOrcamento()
  return <button onClick={() => navegar(-1)}>ir para mês passado</button>
}

const renderComNavegacao = () =>
  render(
    <ThemeProvider theme={theme}>
      <MesOrcamentoProvider>
        <Navegador />
        <CartoesCard />
      </MesOrcamentoProvider>
    </ThemeProvider>
  )

beforeEach(() => {
  vi.clearAllMocks()
  api.get.mockImplementation((url) => {
    if (url === '/cartoes') return Promise.resolve({ data: [CARTAO] })
    if (url.includes('/fatura')) return Promise.resolve({ data: FATURA })
    if (url.includes('/assinaturas')) return Promise.resolve({ data: null })
    return Promise.resolve({ data: {} })
  })
})

describe('CartoesCard — mês de referência não-atual', () => {
  it('busca a fatura do mês selecionado (não o mês corrente) após navegar', async () => {
    renderComNavegacao()

    fireEvent.click(screen.getByText('ir para mês passado'))
    fireEvent.click(await screen.findByLabelText('detalhes da fatura Roxinho'))

    // Mesmo relogio do contexto (America/Sao_Paulo), nao o fuso de quem roda o teste.
    const [anoHoje, mesHoje] = hojeLocal().split('-').map(Number)
    const mesPassado = mesHoje === 1 ? 12 : mesHoje - 1
    const anoPassado = mesHoje === 1 ? anoHoje - 1 : anoHoje

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(`/cartoes/c1/fatura?mes=${mesPassado}&ano=${anoPassado}`)
    })
    expect(screen.getByText(new RegExp(`${MESES[mesPassado - 1]}/${anoPassado}`))).toBeInTheDocument()
  })

  it('fecha o dialog de fatura aberto ao navegar de mês, para não exibir dados desatualizados', async () => {
    renderComNavegacao()

    fireEvent.click(await screen.findByLabelText('detalhes da fatura Roxinho'))
    await waitFor(() => expect(screen.getByText(/Fatura — Roxinho/)).toBeInTheDocument())

    fireEvent.click(screen.getByText('ir para mês passado'))

    await waitFor(() => expect(screen.queryByText(/Fatura — Roxinho/)).not.toBeInTheDocument())
  })
})
