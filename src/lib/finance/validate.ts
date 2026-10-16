// src/lib/finance/validate.ts
// Server-side validation for admin financial forms. The browser is never trusted for amounts or enums.

import { isDateString } from './range'

export class ValidationError extends Error {}

type Source = { get(name: string): FormDataEntryValue | null }

const MAX_MONEY = 100_000_000

export function requiredText(f: Source, key: string, max = 200): string {
  const v = typeof f.get(key) === 'string' ? (f.get(key) as string).trim() : ''
  if (!v) throw new ValidationError(`${key.replace(/_/g, ' ')} is required`)
  return v.slice(0, max)
}

export function optionalText(f: Source, key: string, max = 500): string | null {
  const v = typeof f.get(key) === 'string' ? (f.get(key) as string).trim() : ''
  return v ? v.slice(0, max) : null
}

export function money(f: Source, key: string, opts: { min?: number; required?: boolean } = {}): number | null {
  const raw = typeof f.get(key) === 'string' ? (f.get(key) as string).trim().replace(/,/g, '') : ''
  if (raw === '') {
    if (opts.required) throw new ValidationError(`${key.replace(/_/g, ' ')} is required`)
    return null
  }
  const n = Number(raw)
  if (!Number.isFinite(n)) throw new ValidationError(`${key.replace(/_/g, ' ')} must be a number`)
  if (n < (opts.min ?? 0)) throw new ValidationError(`${key.replace(/_/g, ' ')} must be at least ${opts.min ?? 0}`)
  if (n > MAX_MONEY) throw new ValidationError(`${key.replace(/_/g, ' ')} is too large`)
  return Math.round(n * 100) / 100
}

export function integer(f: Source, key: string, opts: { min?: number; required?: boolean } = {}): number | null {
  const n = money(f, key, opts)
  if (n === null) return null
  if (!Number.isInteger(n)) throw new ValidationError(`${key.replace(/_/g, ' ')} must be a whole number`)
  return n
}

export function date(f: Source, key: string, fallback?: string): string {
  const raw = typeof f.get(key) === 'string' ? (f.get(key) as string).trim() : ''
  if (!raw && fallback) return fallback
  if (!isDateString(raw)) throw new ValidationError(`${key.replace(/_/g, ' ')} must be a valid date (YYYY-MM-DD)`)
  return raw
}

export function oneOf<T extends string>(f: Source, key: string, allowed: readonly T[], opts: { optional?: boolean } = {}): T | null {
  const raw = typeof f.get(key) === 'string' ? (f.get(key) as string).trim() : ''
  if (!raw) {
    if (opts.optional) return null
    throw new ValidationError(`${key.replace(/_/g, ' ')} is required`)
  }
  if (!allowed.includes(raw as T)) throw new ValidationError(`${key.replace(/_/g, ' ')} has an unsupported value`)
  return raw as T
}

export function uuid(f: Source, key: string): string {
  const v = requiredText(f, key, 64)
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)) throw new ValidationError(`${key.replace(/_/g, ' ')} is not a valid id`)
  return v
}

export function checkbox(f: Source, key: string): boolean {
  const v = f.get(key)
  return v === 'on' || v === 'true' || v === '1'
}
