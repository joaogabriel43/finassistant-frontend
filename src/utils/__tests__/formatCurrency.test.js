import { describe, it, expect } from 'vitest'
import { formatCurrency } from '../formatCurrency'

describe('formatCurrency', () => {
  it('formata 1000 como R$ 1.000,00', () => {
    expect(formatCurrency(1000)).toBe('R$\u00a01.000,00')
  })

  it('formata 0 como R$ 0,00', () => {
    expect(formatCurrency(0)).toBe('R$\u00a00,00')
  })

  it('formata 1234567.89 como R$ 1.234.567,89', () => {
    expect(formatCurrency(1234567.89)).toBe('R$\u00a01.234.567,89')
  })
})
