import { describe, it, expect } from 'vitest'
import { commissionForCode } from '../deal-codes'

describe('commissionForCode', () => {
  it('takes the code percentage of the selling price', () => {
    expect(commissionForCode(5000, 10)).toBe(500)
    expect(commissionForCode(3333, 10)).toBe(333.3)
    expect(commissionForCode(1999, 7.5)).toBe(149.93)
  })
  it('is 0 for missing or invalid input', () => {
    expect(commissionForCode(0, 10)).toBe(0)
    expect(commissionForCode(5000, 0)).toBe(0)
    expect(commissionForCode(NaN, 10)).toBe(0)
    expect(commissionForCode(-5, 10)).toBe(0)
  })
})
