import { describe, expect, it } from 'vitest'
import { normalizeDigits } from '../digits'

describe('normalizeDigits', () => {
  it('converts Arabic-Indic and Persian digits', () => {
    expect(normalizeDigits('٠١٠١٢٣٤٥٦٧٨')).toBe('01012345678')
    expect(normalizeDigits('۱۲۳')).toBe('123')
  })
  it('handles Arabic decimal and thousands marks', () => {
    expect(normalizeDigits('١٢٣٫٥')).toBe('123.5')
    expect(normalizeDigits('١٬٥٠٠')).toBe('1500')
  })
  it('leaves normal text alone', () => {
    expect(normalizeDigits('Ahmed 12.5')).toBe('Ahmed 12.5')
  })
})
