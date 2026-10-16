// src/lib/finance/money.ts

export function round2(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.round((n + Number.EPSILON) * 100) / 100
}

export function sum(values: number[]): number {
  return round2(values.reduce((a, b) => a + b, 0))
}

/** Division that returns null (not 0, not Infinity) when the result would be meaningless. */
export function ratio(numerator: number, denominator: number): number | null {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) return null
  return numerator / denominator
}

/**
 * Splits `total` across `weights` so the parts add up to exactly `total` (to 2 decimals).
 * The last non-zero weight absorbs the rounding remainder.
 */
export function allocate(total: number, weights: number[]): number[] {
  const weightSum = weights.reduce((a, b) => a + b, 0)
  if (weights.length === 0) return []
  if (weightSum <= 0) return weights.map(() => 0)

  const out = weights.map((w) => round2((total * w) / weightSum))
  let lastNonZero = -1
  weights.forEach((w, i) => { if (w > 0) lastNonZero = i })
  const drift = round2(total - out.reduce((a, b) => a + b, 0))
  if (drift !== 0 && lastNonZero >= 0) out[lastNonZero] = round2(out[lastNonZero] + drift)
  return out
}
