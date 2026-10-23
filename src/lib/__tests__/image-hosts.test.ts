import { readFileSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'vitest'
import { OPTIMIZED_HOST_SUFFIXES, isOptimizable } from '../image-hosts'

describe('isOptimizable', () => {
  it('resizes our storage, Vinted photos and files in /public', () => {
    expect(isOptimizable('https://sxamyuyxnccrwgksrqhz.supabase.co/storage/v1/object/public/product-images/a.jpg')).toBe(true)
    expect(isOptimizable('https://images1.vinted.net/t/a.jpeg')).toBe(true)
    expect(isOptimizable('/hero/hero-1.webp')).toBe(true)
  })
  it('leaves other sites alone, so a new photo host can never crash a page', () => {
    for (const u of ['https://m.media-amazon.com/images/I/a.jpg', 'https://res.garmin.com/a.png', 'https://www.polar.com/a.jpg', 'https://i.ebayimg.com/a.jpg', 'https://cdn.shopify.com/a.jpg']) {
      expect(isOptimizable(u)).toBe(false)
    }
  })
  it('does not trust look-alike hosts or garbage', () => {
    expect(isOptimizable('https://evilvinted.net/a.jpg')).toBe(false)
    expect(isOptimizable('https://supabase.co.evil.com/a.jpg')).toBe(false)
    expect(isOptimizable('not a url')).toBe(false)
  })
  it('matches images.remotePatterns in next.config.ts', () => {
    const config = readFileSync(join(__dirname, '..', '..', '..', 'next.config.ts'), 'utf8')
    for (const s of OPTIMIZED_HOST_SUFFIXES) expect(config).toContain(`'**.${s}'`)
  })
})
