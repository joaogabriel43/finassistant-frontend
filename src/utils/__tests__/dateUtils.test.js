import { describe, it, expect, afterEach, vi } from 'vitest'
import { hojeLocal } from '../dateUtils'

describe('hojeLocal', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  // Regressão do bug real que derrubou o job E2E do CI em 2026-08-31T00:37Z:
  // o formulário nascia preenchido com a data UTC (31/08) enquanto o backend
  // valida @PastOrPresent contra a JVM em America/Sao_Paulo (ainda 30/08),
  // e respondia "Data da compra não pode ser futura".
  it('devolve a data de Sao Paulo, nao a de UTC, na janela 21h-24h BRT', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-31T00:37:00Z')) // 30/08 21:37 em BRT

    expect(hojeLocal()).toBe('2026-08-30')
  })

  it('coincide com UTC fora da janela de virada', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-30T22:31:00Z')) // 30/08 19:31 em BRT

    expect(hojeLocal()).toBe('2026-08-30')
  })

  it('devolve sempre o formato yyyy-MM-dd esperado pelo backend', () => {
    expect(hojeLocal()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
