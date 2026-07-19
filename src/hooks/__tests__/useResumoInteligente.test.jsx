import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

vi.mock('../../services/api', () => ({
  default: { get: vi.fn() },
}))

import useResumoInteligente from '../useResumoInteligente'
import api from '../../services/api'

describe('useResumoInteligente', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('gerar() chama GET /resumo-inteligente com mes/ano/modoDireto e popula o resumo', async () => {
    const dto = {
      mes: 7, ano: 2026, modoDireto: false, geradoComIa: true,
      narrativa: 'Seu mês foi positivo!',
      topInsights: [{ tipo: 'ALERTA', titulo: 'Alimentação subiu', texto: 't', porQue: 'q', relevancia: 90 }],
      outrosInsights: [],
      disclaimer: 'Informativo.',
    }
    api.get.mockResolvedValueOnce({ data: dto })

    const { result } = renderHook(() => useResumoInteligente())

    let retorno
    await act(async () => {
      retorno = await result.current.gerar(7, 2026, false)
    })

    expect(api.get).toHaveBeenCalledWith('/resumo-inteligente', {
      params: { mes: 7, ano: 2026, modoDireto: false },
    })
    expect(retorno).toEqual(dto)
    expect(result.current.resumo).toEqual(dto)
    expect(result.current.error).toBeNull()
  })

  it('repassa modoDireto=true ao backend', async () => {
    api.get.mockResolvedValueOnce({ data: { topInsights: [], outrosInsights: [] } })

    const { result } = renderHook(() => useResumoInteligente())
    await act(async () => {
      await result.current.gerar(3, 2026, true)
    })

    expect(api.get).toHaveBeenCalledWith('/resumo-inteligente', {
      params: { mes: 3, ano: 2026, modoDireto: true },
    })
  })

  it('em erro define mensagem e zera o resumo', async () => {
    api.get.mockRejectedValueOnce({ response: { data: { mensagem: 'Falhou' } } })

    const { result } = renderHook(() => useResumoInteligente())
    await act(async () => {
      await result.current.gerar(7, 2026, false)
    })

    await waitFor(() => expect(result.current.error).toBe('Falhou'))
    expect(result.current.resumo).toBeNull()
  })
})
