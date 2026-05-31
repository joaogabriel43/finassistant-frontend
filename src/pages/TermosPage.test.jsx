import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// ← RED: TermosUsoPage e PoliticaPrivacidadePage não existem ainda
import TermosUsoPage from './TermosUsoPage'
import PoliticaPrivacidadePage from './PoliticaPrivacidadePage'

// Mock fetch para os arquivos markdown
beforeEach(() => {
  globalThis.fetch = vi.fn()
})

describe('Páginas Legais — Termos e Privacidade', () => {

  it('TermosUsoPage: renderiza título dos Termos de Uso', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('# Termos de Uso\n\nConteúdo dos termos.'),
    })

    render(<TermosUsoPage />)

    await waitFor(() => {
      expect(screen.getByText(/Termos de Uso/i)).toBeInTheDocument()
    })
  })

  it('TermosUsoPage: renderiza conteúdo do markdown após fetch', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('# Termos de Uso\n\nFortunAI é um assistente financeiro.'),
    })

    render(<TermosUsoPage />)

    await waitFor(() => {
      expect(screen.getByText(/assistente financeiro/i)).toBeInTheDocument()
    })
  })

  it('PoliticaPrivacidadePage: renderiza título da Política de Privacidade', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('# Política de Privacidade\n\nSeus dados são protegidos.'),
    })

    render(<PoliticaPrivacidadePage />)

    await waitFor(() => {
      expect(screen.getByText(/Política de Privacidade/i)).toBeInTheDocument()
    })
  })

  it('PoliticaPrivacidadePage: acessível sem login (rota pública)', () => {
    // Páginas legais não dependem de AuthContext — renderizam sem provedor de auth
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('# Política de Privacidade'),
    })

    // Não deve lançar erro ao renderizar sem contexto de autenticação
    expect(() => render(<PoliticaPrivacidadePage />)).not.toThrow()
  })
})
