import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ThemeProvider } from '@mui/material/styles'
import { MemoryRouter } from 'react-router-dom'
import { createAppTheme } from '../../../../theme'
import PanoramaFinanceiro from '../PanoramaFinanceiro'

const PROXIMA_ACAO = {
  titulo: 'Veja o resumo do mês',
  descricao: 'Entradas, despesas e o que sobrou.',
  rotulo: 'Abrir resumo do mês',
  to: '/resumo',
}

const renderPanorama = (modo, props = {}) => {
  const tema = createAppTheme(modo)
  const utils = render(
    <ThemeProvider theme={tema}>
      <MemoryRouter>
        <PanoramaFinanceiro
          patrimonioTotal={6769.05}
          saldoAtual={5759.35}
          totalInvestido={1009.7}
          proximaAcao={PROXIMA_ACAO}
          {...props}
        />
      </MemoryRouter>
    </ThemeProvider>
  )
  return { ...utils, tema }
}

// A CSS que o Emotion injeta no documento durante o render.
const cssInjetada = () =>
  Array.from(document.querySelectorAll('style'))
    .map((s) => s.textContent ?? '')
    .join('\n')

describe('PanoramaFinanceiro', () => {
  // A placa do panorama é escura NOS DOIS temas. O anel de foco global do
  // index.css usa --c-pri, que no tema claro é verde escuro (#285F50) e
  // praticamente some sobre a placa. O CTA principal da tela precisa do
  // acento do panorama, que é claro nos dois modos.
  it.each(['light', 'dark'])(
    'no tema %s, o foco do CTA usa o acento do panorama, não a primária do tema',
    (modo) => {
      const { tema } = renderPanorama(modo)
      const css = cssInjetada().toLowerCase()
      const acento = tema.palette.panorama.accent.toLowerCase()

      expect(css).toMatch(
        new RegExp(`focus-visible[^}]*outline[^}]*${acento.replace('#', '#')}`)
      )
    }
  )

  it('o CTA tem nome acessível e aponta para a rota informada', () => {
    renderPanorama('dark')
    const cta = screen.getByRole('link', { name: /abrir resumo do mês/i })
    expect(cta).toHaveAttribute('href', '/resumo')
  })

  it('fonte indisponível vira travessão, nunca R$ 0,00', () => {
    renderPanorama('dark', { totalInvestido: null, patrimonioTotal: null, parcial: true })
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText(/fonte indisponível/i)).toBeInTheDocument()
    expect(screen.queryByText('R$ 0,00')).not.toBeInTheDocument()
  })
})
