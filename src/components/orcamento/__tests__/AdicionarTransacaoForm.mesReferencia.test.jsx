import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { ThemeProvider } from '@mui/material/styles'
import theme from '../../../theme'
import AdicionarTransacaoForm from '../AdicionarTransacaoForm'
import { MesOrcamentoProvider, useMesOrcamento } from '../../../contexts/MesOrcamentoContext'

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-123' } }),
}))

vi.mock('../../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

vi.mock('react-select/creatable', () => ({
  default: ({ onChange, placeholder }) => (
    <input
      data-testid="categoria-select"
      placeholder={placeholder}
      onChange={(e) => onChange({ value: e.target.value, label: e.target.value })}
    />
  ),
}))

import api from '../../../services/api'
import { hojeLocal } from '../../../utils/dateUtils'

// Mesmo relogio do componente (America/Sao_Paulo). `new Date().toISOString()`
// devolveria a data em UTC e quebraria estes testes entre 21h e 23h59 BRT —
// exatamente o bug de fuso que e8e535b corrigiu no codigo de producao.
const hoje = () => hojeLocal()

const pad = (n) => String(n).padStart(2, '0')

// Ultimo dia do mes anterior ao de hoje, derivado da mesma referencia de fuso.
const ultimoDiaDoMesPassado = () => {
  const [ano, mes] = hoje().split('-').map(Number)
  const anoPassado = mes === 1 ? ano - 1 : ano
  const mesPassado = mes === 1 ? 12 : mes - 1
  const ultimoDia = new Date(anoPassado, mesPassado, 0).getDate()
  return `${anoPassado}-${pad(mesPassado)}-${pad(ultimoDia)}`
}

// Componente auxiliar de teste — expõe navegar() do contexto real para
// simular o usuário trocando o mês de referência pelo SeletorMesOrcamento,
// sem precisar renderizar o seletor visual em si.
const Navegador = () => {
  const { navegar } = useMesOrcamento()
  return (
    <>
      <button onClick={() => navegar(-1)}>ir para mês passado</button>
      <button onClick={() => navegar(1)}>ir para mês futuro</button>
    </>
  )
}

// O componente le tokens customizados (palette.lines / palette.surfaces) via
// selectStyles(theme) — sem ThemeProvider o tema default do MUI nao tem
// `palette.lines` e a renderizacao estoura. Mesmo padrao do teste irmao
// CartoesCard.mesReferencia.test.jsx.
const renderComNavegacao = () =>
  render(
    <ThemeProvider theme={theme}>
      <MesOrcamentoProvider>
        <Navegador />
        <AdicionarTransacaoForm />
      </MesOrcamentoProvider>
    </ThemeProvider>
  )

const preencherCamposBase = async () => {
  fireEvent.change(screen.getByLabelText(/Valor/i), { target: { value: '100' } })
  fireEvent.change(screen.getByTestId('categoria-select'), {
    target: { value: 'alimentacao' },
  })
  fireEvent.change(screen.getByLabelText(/Descrição/i), {
    target: { value: 'almoço' },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  api.get.mockResolvedValue({ data: [] })
  api.post.mockResolvedValue({ data: {} })
})

describe('AdicionarTransacaoForm — mês de referência não-atual', () => {
  it('ao navegar para um mês passado, pré-preenche a data com o último dia daquele mês e mostra aviso', () => {
    renderComNavegacao()

    fireEvent.click(screen.getByText('ir para mês passado'))

    const dataEsperada = ultimoDiaDoMesPassado()

    const campoData = document.querySelector('input[type="date"]')
    expect(campoData.value).toBe(dataEsperada)
    expect(screen.getByText(/Adicionando a/i)).toBeInTheDocument()
  })

  it('envia a data pré-preenchida do mês passado no payload ao submeter sem alterar a data', async () => {
    renderComNavegacao()

    fireEvent.click(screen.getByText('ir para mês passado'))
    await preencherCamposBase()

    fireEvent.click(screen.getByRole('button', { name: /adicionar/i }))

    const dataEsperada = ultimoDiaDoMesPassado()

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/orcamento/transacao/user-123',
        expect.objectContaining({ data: dataEsperada })
      )
    })
  })

  it('ao navegar para um mês futuro, a data continua igual a hoje e mostra aviso de que não aceita data futura', () => {
    renderComNavegacao()

    fireEvent.click(screen.getByText('ir para mês futuro'))

    const campoData = document.querySelector('input[type="date"]')
    expect(campoData.value).toBe(hoje())
    expect(screen.getByText(/não aceita transações com data futura/i)).toBeInTheDocument()
  })

  it('envia a data de hoje no payload mesmo estando num mês futuro selecionado', async () => {
    renderComNavegacao()

    fireEvent.click(screen.getByText('ir para mês futuro'))
    await preencherCamposBase()

    fireEvent.click(screen.getByRole('button', { name: /adicionar/i }))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/orcamento/transacao/user-123',
        expect.objectContaining({ data: hoje() })
      )
    })
  })
})
