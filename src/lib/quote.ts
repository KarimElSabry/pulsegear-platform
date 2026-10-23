// src/lib/quote.ts
// The shape of a priced cart and the wording of its problems. Pure, so the browser can use it too.

import type { Totals } from '@/lib/checkout-core'

export type LineProblem = 'ok' | 'gone' | 'choose_color' | 'color_gone' | 'sold' | 'reserved' | 'out_of_stock'

export type QuoteLine = {
  productId: number
  variantId: number | null
  slug: string | null
  title: string
  colorName: string | null
  imageUrl: string | null
  unitPriceEgp: number
  quantity: number
  maxQuantity: number
  note: string
  discountEnabled: boolean
  oneOff: boolean
  unitsLeft: number | null
  problem: LineProblem
}

export type QuoteResult = {
  lines: QuoteLine[]
  buyable: boolean
  discountCode: string | null
  discountPercent: number
  discountError: string | null
  totals: Totals
}

const PROBLEM_TEXT: Record<Exclude<LineProblem, 'ok'>, string> = {
  gone: 'is no longer for sale',
  choose_color: 'needs a color to be chosen',
  color_gone: 'is not available in that color any more',
  sold: 'was just sold',
  reserved: 'is being held for another customer',
  out_of_stock: 'is out of stock',
}
export const problemText = (l: QuoteLine) => (l.problem === 'ok' ? '' : `${l.title} ${PROBLEM_TEXT[l.problem]}`)

