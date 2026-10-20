// src/lib/rate-limit.ts
// Small in-memory limiter (fixed window) for public endpoints. It is per server instance, so it slows guessing
// down rather than stopping it completely; the real protection is that order IDs are long and random.

const hits = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
  if (hits.size > 5000) for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k)
  const entry = hits.get(key)
  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  entry.count += 1
  return entry.count <= limit
}

/** For tests. */
export function resetRateLimits() { hits.clear() }
