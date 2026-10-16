// src/lib/finance/range.ts

const DAY_MS = 24 * 60 * 60 * 1000

export function isDateString(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const ms = Date.parse(value + 'T00:00:00Z')
  // round-trip so impossible dates such as 2026-02-30 (which Date.parse rolls over) are rejected
  return !Number.isNaN(ms) && new Date(ms).toISOString().slice(0, 10) === value
}

function toMs(date: string): number {
  return Date.parse(date + 'T00:00:00Z')
}

function fromMs(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10)
}

export function addDays(date: string, days: number): string {
  return fromMs(toMs(date) + days * DAY_MS)
}

export function daysInRange(from: string, to: string): number {
  return Math.round((toMs(to) - toMs(from)) / DAY_MS) + 1
}

export function inRange(date: string, from: string, to: string): boolean {
  return date >= from && date <= to
}

/** The period of equal length that ends the day before `from`. */
export function previousRange(from: string, to: string): { from: string; to: string } {
  const length = daysInRange(from, to)
  return { from: addDays(from, -length), to: addDays(from, -1) }
}

export function eachDay(from: string, to: string): string[] {
  const out: string[] = []
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d)
  return out
}

/** Today in Cairo time (the business operates there; the server may not). */
export function todayCairo(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo' }).format(now)
}

/** First day of the month of `date`. */
export function monthStart(date: string): string {
  return date.slice(0, 8) + '01'
}
