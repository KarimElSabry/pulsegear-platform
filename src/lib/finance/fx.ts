// src/lib/finance/fx.ts
// EGP per 1 EUR. A manual rate always wins (so a milestone can lock the rate you trust); otherwise the live rate.

import { round2 } from './money'

export interface EurRate { rate: number | null; source: 'manual' | 'live' | null }

type FetchLike = (url: string, init?: RequestInit) => Promise<{ ok: boolean; json(): Promise<unknown> }>

export async function getEgpPerEur(override?: number | null, fetchImpl: FetchLike = fetch as unknown as FetchLike): Promise<EurRate> {
  if (typeof override === 'number' && override > 0) return { rate: override, source: 'manual' }
  try {
    const res = await fetchImpl('https://open.er-api.com/v6/latest/EUR', { next: { revalidate: 3600 } } as RequestInit)
    const body = (await res.json()) as { rates?: Record<string, number> }
    const egp = body.rates?.EGP
    // sanity range: a wildly wrong rate would silently distort every EUR figure
    if (res.ok && typeof egp === 'number' && egp > 1 && egp < 1000) return { rate: egp, source: 'live' }
  } catch { /* fall through */ }
  return { rate: null, source: null }
}

export function toEur(egp: number | null, rate: number | null): number | null {
  if (egp === null || rate === null || !(rate > 0)) return null
  return round2(egp / rate)
}
