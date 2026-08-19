import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
  },
}))

import { useStatusPage } from '../useStatusPage'
import api from '../../services/api'

const setVisibility = (value) => {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => value,
  })
}

// waitFor do Testing Library faz polling com setTimeout REAL — incompativel com
// vi.useFakeTimers() (o tempo nunca avanca sozinho e o teste trava ate o timeout
// de 5s do Vitest). Em vez disso, flush explicito das microtasks pendentes via
// advanceTimersByTimeAsync(0), que processa a fila de promises sem mexer no relogio.
const flush = () => act(async () => {
  await vi.advanceTimersByTimeAsync(0)
})

describe('useStatusPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    setVisibility('visible')
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('busca o status imediatamente ao montar', async () => {
    api.get.mockResolvedValue({ data: [{ nome: 'Database', status: 'OPERACIONAL' }] })

    renderHook(() => useStatusPage())
    await flush()

    expect(api.get).toHaveBeenCalledWith('/status')
  })

  it('continua fazendo polling a cada 30s quando a aba esta visivel', async () => {
    api.get.mockResolvedValue({ data: [] })

    renderHook(() => useStatusPage())
    await flush()
    expect(api.get).toHaveBeenCalledTimes(1)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30000)
    })
    expect(api.get).toHaveBeenCalledTimes(2)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30000)
    })
    expect(api.get).toHaveBeenCalledTimes(3)
  })

  it('pausa o polling quando a aba fica em background', async () => {
    api.get.mockResolvedValue({ data: [] })

    renderHook(() => useStatusPage())
    await flush()
    expect(api.get).toHaveBeenCalledTimes(1)

    setVisibility('hidden')
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(120000)
    })

    // Nenhuma chamada nova enquanto a aba estiver oculta, mesmo apos 2min.
    expect(api.get).toHaveBeenCalledTimes(1)
  })

  it('retoma o polling e refaz um fetch imediato quando a aba volta a ficar visivel', async () => {
    api.get.mockResolvedValue({ data: [] })

    renderHook(() => useStatusPage())
    await flush()
    expect(api.get).toHaveBeenCalledTimes(1)

    setVisibility('hidden')
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })
    expect(api.get).toHaveBeenCalledTimes(1)

    setVisibility('visible')
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })
    await flush()

    expect(api.get).toHaveBeenCalledTimes(2)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30000)
    })
    expect(api.get).toHaveBeenCalledTimes(3)
  })

  it('nao inicia o intervalo se a aba ja monta em background', async () => {
    setVisibility('hidden')
    api.get.mockResolvedValue({ data: [] })

    renderHook(() => useStatusPage())
    await flush()
    expect(api.get).toHaveBeenCalledTimes(1)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(60000)
    })

    expect(api.get).toHaveBeenCalledTimes(1)
  })
})
