import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ThemeProvider } from '@mui/material/styles'
import theme from '../../../theme'
import DashboardSkeleton from '../DashboardSkeleton'

const renderSkeleton = () =>
  render(
    <ThemeProvider theme={theme}>
      <DashboardSkeleton />
    </ThemeProvider>
  )

describe('DashboardSkeleton', () => {
  // 1. Contrato de teste herdado — não pode sumir na reestruturação.
  it('preserva o seletor data-testid="skeleton"', () => {
    renderSkeleton()
    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThanOrEqual(1)
  })

  // 2. Acessibilidade: o carregamento precisa ser anunciado, não apenas visual.
  it('anuncia o carregamento a leitores de tela', () => {
    renderSkeleton()
    const status = screen.getByRole('status', { name: /carregando/i })
    expect(status).toBeInTheDocument()
    expect(status).toHaveAttribute('aria-busy', 'true')
  })

  // 3. Geometria: o esqueleto reserva a MESMA hierarquia da tela final —
  // um panorama dominante, não três cartões iguais no topo.
  it('reserva um panorama dominante no topo, antes das demais seções', () => {
    renderSkeleton()
    const panorama = screen.getByTestId('skeleton-panorama')
    expect(panorama).toBeInTheDocument()

    const blocos = screen.getAllByTestId(/^skeleton-(panorama|secao)/)
    // O panorama é o primeiro bloco depois do cabeçalho.
    expect(blocos[0]).toBe(panorama)
  })

  // 4. Geometria: as seções seguintes existem na ordem aprovada, para que a
  // troca de skeleton por conteúdo real não desloque a página.
  it('reserva as seções na ordem da tela final', () => {
    renderSkeleton()
    const ordem = screen
      .getAllByTestId(/^skeleton-secao-/)
      .map((el) => el.getAttribute('data-testid'))

    expect(ordem).toEqual([
      'skeleton-secao-evolucao',
      'skeleton-secao-composicao',
      'skeleton-secao-transacoes',
      'skeleton-secao-proventos',
    ])
  })
})
