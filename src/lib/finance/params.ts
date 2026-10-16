// src/lib/finance/params.ts
// Parses and validates dashboard / report / export query strings. Anything invalid falls back to a safe default.

import { addDays, isDateString, monthStart, todayCairo } from './range'
import type { DeliveryStatus, Filters, SaleStatus } from './types'

export type SearchParams = Record<string, string | string[] | undefined>

const SALE_STATUSES: SaleStatus[] = ['pending', 'completed', 'cancelled', 'failed_delivery']
const DELIVERY: DeliveryStatus[] = ['pending', 'shipped', 'delivered', 'failed', 'returned']
export const MAX_RANGE_DAYS = 800

export const PRESETS = ['this_month', 'last_7', 'last_30', 'last_90', 'this_year', 'custom'] as const
export type Preset = (typeof PRESETS)[number]

const first = (v: string | string[] | undefined): string | undefined => (Array.isArray(v) ? v[0] : v)
const text = (v: string | string[] | undefined, n = 100): string | undefined => {
  const s = first(v)?.trim()
  return s ? s.slice(0, n) : undefined
}

export function presetRange(preset: Preset, today: string): { from: string; to: string } {
  switch (preset) {
    case 'last_7': return { from: addDays(today, -6), to: today }
    case 'last_30': return { from: addDays(today, -29), to: today }
    case 'last_90': return { from: addDays(today, -89), to: today }
    case 'this_year': return { from: today.slice(0, 4) + '-01-01', to: today }
    default: return { from: monthStart(today), to: today }
  }
}

export interface ParsedParams {
  filters: Filters
  preset: Preset
  compare: boolean
}

export function parseParams(sp: SearchParams, today = todayCairo()): ParsedParams {
  const requested = first(sp.preset)
  const preset: Preset = (PRESETS as readonly string[]).includes(requested ?? '') ? (requested as Preset) : 'this_month'

  let { from, to } = presetRange(preset === 'custom' ? 'this_month' : preset, today)
  const f = first(sp.from)
  const t = first(sp.to)
  if (preset === 'custom' || (!requested && (f || t))) {
    if (isDateString(f)) from = f
    if (isDateString(t)) to = t
  }
  if (from > to) [from, to] = [to, from]
  const span = (Date.parse(to + 'T00:00:00Z') - Date.parse(from + 'T00:00:00Z')) / 86400000
  if (span > MAX_RANGE_DAYS) from = addDays(to, -MAX_RANGE_DAYS)

  const orderStatus = first(sp.orderStatus)
  const deliveryStatus = first(sp.deliveryStatus)

  return {
    preset: !requested && (f || t) ? 'custom' : preset,
    compare: first(sp.compare) !== '0',
    filters: {
      from,
      to,
      channel: text(sp.channel, 40),
      source: text(sp.source, 80),
      campaign: text(sp.campaign, 120),
      product: text(sp.product, 120),
      orderStatus: SALE_STATUSES.includes(orderStatus as SaleStatus) ? (orderStatus as SaleStatus) : undefined,
      deliveryStatus: DELIVERY.includes(deliveryStatus as DeliveryStatus) ? (deliveryStatus as DeliveryStatus) : undefined,
      costCategory: text(sp.costCategory, 40),
    },
  }
}

/** Query string that reproduces the same filters (used by the "trace" and export links). */
export function filtersToQuery(f: Filters, extra: Record<string, string> = {}): string {
  const q = new URLSearchParams({ preset: 'custom', from: f.from, to: f.to, ...extra })
  for (const k of ['channel', 'source', 'campaign', 'product', 'orderStatus', 'deliveryStatus', 'costCategory'] as const) {
    const v = f[k]
    if (v) q.set(k, v)
  }
  return q.toString()
}
