import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MesOrcamentoProvider, useMesOrcamento } from '../MesOrcamentoContext'

const hoje = new Date()
const mesAtual = hoje.getMonth() + 1
const anoAtual = hoje.getFullYear()

const pad = (n) => String(n).padStart(2, '0')

const ultimoDiaDoMes = (mes, ano) => new Date(ano, mes, 0).getDate()

const Consumidor = () => {
  const {
    mes, ano, isMesAtual, navegar, irParaMesAtual,
    primeiroDiaMes, ultimoDiaMes, podeAvancar, podeVoltar,
  } = useMesOrcamento()

  return (
    <div>
      <span data-testid="mes">{mes}</span>
      <span data-testid="ano">{ano}</span>
      <span data-testid="is-mes-atual">{String(isMesAtual)}</span>
      <span data-testid="primeiro-dia">{primeiroDiaMes}</span>
      <span data-testid="ultimo-dia">{ultimoDiaMes}</span>
      <span data-testid="pode-avancar">{String(podeAvancar)}</span>
      <span data-testid="pode-voltar">{String(podeVoltar)}</span>
      <button onClick={() => navegar(-1)}>voltar</button>
      <button onClick={() => navegar(1)}>avançar</button>
      <button onClick={irParaMesAtual}>ir para hoje</button>
    </div>
  )
}

const renderComProvider = () =>
  render(
    <MesOrcamentoProvider>
      <Consumidor />
    </MesOrcamentoProvider>
  )

describe('MesOrcamentoContext', () => {
  it('inicia no mês/ano atuais com isMesAtual=true', () => {
    renderComProvider()

    expect(screen.getByTestId('mes').textContent).toBe(String(mesAtual))
    expect(screen.getByTestId('ano').textContent).toBe(String(anoAtual))
    expect(screen.getByTestId('is-mes-atual').textContent).toBe('true')
  })

  it('calcula primeiroDiaMes e ultimoDiaMes corretamente para o mês atual', () => {
    renderComProvider()

    expect(screen.getByTestId('primeiro-dia').textContent).toBe(`${anoAtual}-${pad(mesAtual)}-01`)
    expect(screen.getByTestId('ultimo-dia').textContent).toBe(
      `${anoAtual}-${pad(mesAtual)}-${pad(ultimoDiaDoMes(mesAtual, anoAtual))}`
    )
  })

  it('navegar(-1) volta um mês e marca isMesAtual=false', () => {
    renderComProvider()

    fireEvent.click(screen.getByText('voltar'))

    const mesEsperado = mesAtual === 1 ? 12 : mesAtual - 1
    const anoEsperado = mesAtual === 1 ? anoAtual - 1 : anoAtual

    expect(screen.getByTestId('mes').textContent).toBe(String(mesEsperado))
    expect(screen.getByTestId('ano').textContent).toBe(String(anoEsperado))
    expect(screen.getByTestId('is-mes-atual').textContent).toBe('false')
  })

  it('navegar(1) avança um mês e marca isMesAtual=false', () => {
    renderComProvider()

    fireEvent.click(screen.getByText('avançar'))

    const mesEsperado = mesAtual === 12 ? 1 : mesAtual + 1
    const anoEsperado = mesAtual === 12 ? anoAtual + 1 : anoAtual

    expect(screen.getByTestId('mes').textContent).toBe(String(mesEsperado))
    expect(screen.getByTestId('ano').textContent).toBe(String(anoEsperado))
    expect(screen.getByTestId('is-mes-atual').textContent).toBe('false')
  })

  it('irParaMesAtual retorna ao mês/ano correntes após navegação', () => {
    renderComProvider()

    fireEvent.click(screen.getByText('voltar'))
    fireEvent.click(screen.getByText('voltar'))
    fireEvent.click(screen.getByText('ir para hoje'))

    expect(screen.getByTestId('mes').textContent).toBe(String(mesAtual))
    expect(screen.getByTestId('ano').textContent).toBe(String(anoAtual))
    expect(screen.getByTestId('is-mes-atual').textContent).toBe('true')
  })

  it('bloqueia avanço além do limite de 2 meses no futuro', () => {
    renderComProvider()

    fireEvent.click(screen.getByText('avançar'))
    fireEvent.click(screen.getByText('avançar'))
    expect(screen.getByTestId('pode-avancar').textContent).toBe('false')

    // Uma terceira tentativa não deve mudar o estado (navegar ignora o clique)
    fireEvent.click(screen.getByText('avançar'))
    const mesEsperado = ((mesAtual - 1 + 2) % 12) + 1
    expect(screen.getByTestId('mes').textContent).toBe(String(mesEsperado))
  })

  it('bloqueia retorno além do limite de 24 meses no passado', () => {
    renderComProvider()

    for (let i = 0; i < 24; i += 1) {
      fireEvent.click(screen.getByText('voltar'))
    }
    expect(screen.getByTestId('pode-voltar').textContent).toBe('false')

    const totalMesesEsperado = anoAtual * 12 + (mesAtual - 1) - 24
    const anoEsperado = Math.floor(totalMesesEsperado / 12)
    const mesEsperado = (totalMesesEsperado % 12) + 1

    // Uma tentativa extra de voltar não deve mudar o estado
    fireEvent.click(screen.getByText('voltar'))
    expect(screen.getByTestId('mes').textContent).toBe(String(mesEsperado))
    expect(screen.getByTestId('ano').textContent).toBe(String(anoEsperado))
  })
})
