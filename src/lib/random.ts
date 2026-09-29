// src/lib/random.ts
// Small deterministic helpers so "random per visit" stays stable while a visitor browses.
// seed === 0 means "no seed yet" (server render) and always returns the default order.

function mulberry32(a: number) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Seeded Fisher-Yates. seed 0 returns the list unchanged. */
export function seededShuffle<T>(items: readonly T[], seed: number, salt = ''): T[] {
  const out = [...items]
  if (!seed) return out
  const rand = mulberry32((seed ^ hash(salt)) >>> 0)
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Index of the item a visitor with this seed gets for this salt (stable within a session). */
export function seededIndex(length: number, seed: number, salt = ''): number {
  if (!seed || length <= 0) return 0
  return Math.floor(mulberry32((seed ^ hash(salt)) >>> 0)() * length)
}
