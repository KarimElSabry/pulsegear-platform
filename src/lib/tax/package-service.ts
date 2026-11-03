// src/lib/tax/package-service.ts
// Server only: gathers everything the Steuerberater package needs.

import type { SupabaseClient } from '@supabase/supabase-js'
import { depositFor } from '@/lib/payment-details'
import { loadMatches, loadStatements } from './bank-service'
import { buildPackage, type PackageInput, type SaleLite } from './package'
import { loadLedger, loadSettings } from './service'
import type { ZipFile } from '../zip'

type Row = Record<string, unknown>
const num = (v: unknown) => { const n = Number(v); return Number.isFinite(n) ? n : 0 }

export async function loadSales(db: SupabaseClient, ledgerById: Map<string, { date: string; amount: number }>, matches: { kind: string; status: string; egpTxId: string; checkoutId: string | null; dealId: string | null }[]): Promise<SaleLite[]> {
  const out: SaleLite[] = []
  const { data: orders } = await db.from('checkout_orders').select('id, code, customer_name, total_egp, created_at, status').order('created_at', { ascending: true })
  const ids = ((orders ?? []) as Row[]).map((o) => String(o.id))
  const items = ids.length ? (await db.from('checkout_items').select('checkout_id, title, color_name, quantity').in('checkout_id', ids)).data ?? [] : []
  const receipts = ids.length ? (await db.from('payment_receipts').select('checkout_id, status').in('checkout_id', ids)).data ?? [] : []
  const deals = (await db.from('deals').select('id, status, delivered_at, selling_price_egp, deposit_amount_egp, customer_name, created_at, checkout_id, order_code, item_title').neq('status', 'cancelled')).data ?? []
  const bank = (checkoutId: string | null, dealId: string | null) => {
    const m = matches.find((x) => x.kind === 'payment' && x.status === 'confirmed' && ((checkoutId && x.checkoutId === checkoutId) || (dealId && x.dealId === dealId)))
    const t = m ? ledgerById.get(m.egpTxId) : undefined
    return t ? { date: t.date, amount: t.amount } : null
  }
  for (const o of (orders ?? []) as Row[]) {
    if (o.status === 'rejected' || o.status === 'expired' || o.status === 'cancelled') continue
    const mine = (deals as Row[]).filter((d) => d.checkout_id === o.id)
    const rec = (receipts as Row[]).filter((r) => r.checkout_id === o.id).map((r) => String(r.status))
    const b = bank(String(o.id), null)
    out.push({
      source: 'website', code: String(o.code), date: String(o.created_at).slice(0, 10), customer: String(o.customer_name),
      items: (items as Row[]).filter((i) => i.checkout_id === o.id).map((i) => `${i.title}${i.color_name ? ` (${i.color_name})` : ''} x${i.quantity}`).join(' + '),
      totalEgp: num(o.total_egp), depositEgp: depositFor(num(o.total_egp)),
      depositStatus: b ? 'Bankeingang bestaetigt' : rec.includes('verified') ? 'Beleg geprueft' : rec.includes('submitted') ? 'Beleg eingereicht' : 'offen',
      bankDate: b?.date ?? null, bankAmount: b?.amount ?? null,
      status: mine.length ? [...new Set(mine.map((d) => String(d.status)))].join('/') : String(o.status),
      deliveredAt: mine.map((d) => d.delivered_at as string | null).filter(Boolean).sort().at(-1)?.slice(0, 10) ?? null, checkoutId: String(o.id), dealId: null,
    })
  }
  for (const d of deals as Row[]) {
    if (d.checkout_id) continue
    const b = bank(null, String(d.id))
    out.push({
      source: 'manual', code: String(d.order_code ?? ''), date: String(d.created_at).slice(0, 10), customer: String(d.customer_name ?? ''), items: String(d.item_title ?? ''),
      totalEgp: num(d.selling_price_egp), depositEgp: num(d.deposit_amount_egp), depositStatus: b ? 'Bankeingang bestaetigt' : d.status === 'deposit_pending' ? 'offen' : 'als bezahlt markiert',
      bankDate: b?.date ?? null, bankAmount: b?.amount ?? null, status: String(d.status), deliveredAt: (d.delivered_at as string | null)?.slice(0, 10) ?? null, checkoutId: null, dealId: String(d.id),
    })
  }
  return out
}

export async function buildYearPackage(db: SupabaseClient, year: number, now = new Date()): Promise<{ ok: true; files: ZipFile[] } | { ok: false }> {
  const [ledger, settings] = [await loadLedger(db), await loadSettings(db)]
  if (!ledger.ok || !settings.ready) return { ok: false }
  const [statements, matches] = [await loadStatements(db), await loadMatches(db)]
  const sales = await loadSales(db, new Map(ledger.txs.map((t) => [t.id, t])), matches)
  const input: PackageInput = { year, generatedOn: now.toISOString().slice(0, 10), txs: ledger.txs, statements, matches, sales, settings: settings.settings }
  return { ok: true, files: buildPackage(input) }
}
