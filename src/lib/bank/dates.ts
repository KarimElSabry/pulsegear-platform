// src/lib/bank/dates.ts
// Dates and numbers as Egyptian bank statements write them.

const MONTHS: Record<string, string> = { JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06', JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12' }

const iso = (y: number, m: number, d: number): string | null => {
  const dt = new Date(Date.UTC(y, m - 1, d))
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null
  return dt.toISOString().slice(0, 10)
}
const year = (y: string) => (y.length === 2 ? 2000 + Number(y) : Number(y))

/** 30JUN26, 30-Jun-2026, 30 Jun 2026, 30/06/2026, 30-06-2026, 30.06.2026, 2026-06-30. Day first, as in Egypt. */
export function parseBankDate(raw: string): string | null {
  const s = raw.trim().replace(/\s+/g, ' ')
  let m = /^(\d{1,2})[\s\-/.]?([A-Za-z]{3})[A-Za-z]*[\s\-/.]?(\d{2}|\d{4})$/.exec(s)
  if (m && MONTHS[m[2].toUpperCase()]) return iso(year(m[3]), Number(MONTHS[m[2].toUpperCase()]), Number(m[1]))
  m = /^(\d{1,2})[\-/.](\d{1,2})[\-/.](\d{2}|\d{4})$/.exec(s)
  if (m) return iso(year(m[3]), Number(m[2]), Number(m[1]))
  m = /^(\d{4})[\-/.](\d{1,2})[\-/.](\d{1,2})(?:[ T].*)?$/.exec(s)
  if (m) return iso(Number(m[1]), Number(m[2]), Number(m[3]))
  return null
}

/** "1,234.50", "1.234,50", "(50.00)", "-50.00", "50.00 DR", "50.00 CR" -> signed number; CR positive, DR negative. null if not a number. */
export function parseAmount(raw: string): number | null {
  let s = raw.trim().replace(/[‎‏\s]/g, '')
  if (!s) return null
  let sign = 1
  if (/(DR|D)$/i.test(s) && /\d/.test(s)) { sign = -1; s = s.replace(/(DR|D)$/i, '') }
  else if (/(CR|C)$/i.test(s) && /\d/.test(s)) s = s.replace(/(CR|C)$/i, '')
  if (/^\(.*\)$/.test(s)) { sign = -1; s = s.slice(1, -1) }
  if (s.startsWith('-')) { sign = -sign; s = s.slice(1) } else if (s.startsWith('+')) s = s.slice(1)
  s = s.replace(/[^\d.,]/g, '')
  if (!/\d/.test(s)) return null
  const lastDot = s.lastIndexOf('.'), lastComma = s.lastIndexOf(',')
  if (lastComma > lastDot) s = s.replace(/\./g, '').replace(',', '.')   // 1.234,50
  else s = s.replace(/,/g, '')                                           // 1,234.50
  const n = Number(s)
  return Number.isFinite(n) ? Math.round(sign * n * 100) / 100 : null
}

/** 00201060074276, +201060074276, 201060074276, 01060074276 -> 01060074276. Anything else: null. */
export function normalizeEgPhone(raw: string | null | undefined): string | null {
  if (!raw) return null
  let d = raw.replace(/\D/g, '')
  if (d.startsWith('0020')) d = d.slice(4)
  else if (d.startsWith('20') && d.length === 12) d = d.slice(2)
  if (d.length === 10 && d.startsWith('1')) d = '0' + d
  return /^01[0125]\d{8}$/.test(d) ? d : null
}
