import { beforeEach, describe, expect, it } from 'vitest'
import { rateLimit, resetRateLimits } from '../rate-limit'

beforeEach(resetRateLimits)

describe('rateLimit', () => {
  it('allows the limit, blocks the next call, and frees up after the window', () => {
    for (let i = 0; i < 3; i++) expect(rateLimit('ip', 3, 1000, 0)).toBe(true)
    expect(rateLimit('ip', 3, 1000, 10)).toBe(false)
    expect(rateLimit('ip', 3, 1000, 1001)).toBe(true)
  })
  it('counts each key separately', () => {
    expect(rateLimit('a', 1, 1000, 0)).toBe(true)
    expect(rateLimit('a', 1, 1000, 1)).toBe(false)
    expect(rateLimit('b', 1, 1000, 1)).toBe(true)
  })
})
