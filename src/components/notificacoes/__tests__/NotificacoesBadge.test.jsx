import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock useNotificacoes hook
vi.mock('../../../hooks/useNotificacoes', () => ({
  useNotificacoes: vi.fn(),
}))

import NotificacoesBadge from '../NotificacoesBadge'
import { useNotificacoes } from '../../../hooks/useNotificacoes'

describe('NotificacoesBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const baseReturn = {
    naoLidas: 0,
    notificacoes: [],
    marcarComoLida: vi.fn(),
    metaAtingidaOpen: false,
    metaAtingidaMensagem: '',
    fecharMetaAtingida: vi.fn(),
  }

  it('exibe número correto de não lidas no badge', () => {
    useNotificacoes.mockReturnValue({ ...baseReturn, naoLidas: 5 })

    render(<NotificacoesBadge />)

    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('não exibe badge vermelho quando há 0 não lidas', () => {
    useNotificacoes.mockReturnValue(baseReturn)

    render(<NotificacoesBadge />)

    // Badge com 0 não deve renderizar texto "0"
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })
})
