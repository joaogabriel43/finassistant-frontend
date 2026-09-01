import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import { describe, it, expect } from 'vitest'
import theme from '../../../theme'
import SeletorMesOrcamento from '../SeletorMesOrcamento'
import { MesOrcamentoProvider } from '../../../contexts/MesOrcamentoContext'
import { hojeLocal } from '../../../utils/dateUtils'

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

// Mesmo relogio do MesOrcamentoContext (America/Sao_Paulo). Derivar de
// `new Date()` leria o fuso de quem roda o teste — em CI (UTC) isso
// divergiria do contexto entre 21h e 23h59 BRT.
const [anoAtual, mesAtual] = hojeLocal().split('-').map(Number)

const labelMesAtual = `${MESES[mesAtual - 1]} ${anoAtual}`

const renderSeletor = () =>
  render(
    <ThemeProvider theme={theme}>
      <MesOrcamentoProvider>
        <SeletorMesOrcamento />
      </MesOrcamentoProvider>
    </ThemeProvider>
  )

describe('SeletorMesOrcamento', () => {
  it('exibe o mês/ano atual e o chip "Mês atual" por padrão, sem botão de voltar', () => {
    renderSeletor()

    expect(screen.getByTestId('seletor-mes-orcamento-label').textContent).toBe(labelMesAtual)
    expect(screen.getByText('Mês atual')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /voltar para hoje/i })).not.toBeInTheDocument()
  })

  it('ao clicar em "mês anterior", atualiza o label e mostra o chip "Fora do mês atual"', () => {
    renderSeletor()

    fireEvent.click(screen.getByRole('button', { name: /mês anterior/i }))

    const mesEsperado = mesAtual === 1 ? 12 : mesAtual - 1
    const anoEsperado = mesAtual === 1 ? anoAtual - 1 : anoAtual

    expect(screen.getByTestId('seletor-mes-orcamento-label').textContent)
      .toBe(`${MESES[mesEsperado - 1]} ${anoEsperado}`)
    expect(screen.getByText('Fora do mês atual')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /voltar para hoje/i })).toBeInTheDocument()
  })

  it('"Voltar para hoje" retorna ao mês atual e some novamente', () => {
    renderSeletor()

    fireEvent.click(screen.getByRole('button', { name: /próximo mês/i }))
    fireEvent.click(screen.getByRole('button', { name: /voltar para hoje/i }))

    expect(screen.getByTestId('seletor-mes-orcamento-label').textContent).toBe(labelMesAtual)
    expect(screen.getByText('Mês atual')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /voltar para hoje/i })).not.toBeInTheDocument()
  })

  it('desabilita "próximo mês" ao atingir o limite de 2 meses no futuro', () => {
    renderSeletor()

    const proximo = screen.getByRole('button', { name: /próximo mês/i })
    fireEvent.click(proximo)
    fireEvent.click(proximo)

    expect(proximo).toBeDisabled()
  })

  it('desabilita "mês anterior" ao atingir o limite de 24 meses no passado', () => {
    renderSeletor()

    const anterior = screen.getByRole('button', { name: /mês anterior/i })
    for (let i = 0; i < 24; i += 1) {
      fireEvent.click(anterior)
    }

    expect(anterior).toBeDisabled()
  })
})
