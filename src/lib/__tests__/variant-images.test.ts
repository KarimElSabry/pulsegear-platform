import { describe, expect, it } from 'vitest'
import { imagesForVariant } from '../variant-images'

const img = (url: string, order: number, variant: number | null = null, primary = false) => ({ image_url: url, is_primary: primary, display_order: order, variant_id: variant })
const all = [img('shared', 0), img('black1', 1, 1, true), img('red1', 2, 2), img('black2', 3, 1)]

describe('imagesForVariant', () => {
  it('shows everything when there are no colors', () => {
    expect(imagesForVariant(all, null, false).map((i) => i.image_url)).toEqual(['shared', 'black1', 'red1', 'black2'])
  })
  it('shows the color photos first, then shared ones', () => {
    expect(imagesForVariant(all, 1, true).map((i) => i.image_url)).toEqual(['black1', 'black2', 'shared'])
  })
  it('falls back to shared photos when the color has none', () => {
    expect(imagesForVariant(all, 3, true).map((i) => i.image_url)).toEqual(['shared'])
  })
  it('falls back to all photos when nothing is shared', () => {
    const only = [img('a', 0, 1), img('b', 1, 2)]
    expect(imagesForVariant(only, 5, true)).toHaveLength(2)
  })
})
