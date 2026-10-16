// src/app/admin/analytics/finance-actions.ts
// Server actions for financial records. Every action: admin check first, server-side validation, no client totals.

'use server'

import { revalidatePath } from 'next/cache'
import { assertAdmin } from '@/lib/admin-auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { parseSpendCsv, validateSpend } from '@/lib/finance/spend'
import { recordServerEvent } from '@/lib/tracking/server'
import {
  ValidationError, checkbox, date, integer, money, oneOf, optionalText, requiredText, uuid,
} from '@/lib/finance/validate'
import { todayCairo } from '@/lib/finance/range'
import { syncMetaSpend } from '@/lib/meta/sync'

export interface ActionResult { ok: boolean; message: string }

const ok = (message: string): ActionResult => ({ ok: true, message })

const SALE_STATUSES = ['pending', 'completed', 'cancelled', 'failed_delivery'] as const
const DELIVERY = ['pending', 'shipped', 'delivered', 'failed', 'returned'] as const
const PAYMENT = ['cod', 'prepaid', 'deposit', 'other'] as const
const ORDER_COST_CATEGORIES = ['outbound_shipping', 'return_shipping', 'packaging', 'payment_fee', 'failed_delivery', 'other_variable'] as const
const EXPENSE_CATEGORIES = ['rent', 'salaries', 'software', 'tools', 'accounting', 'transport', 'other', 'tax', 'interest'] as const
const MAX_CSV_BYTES = 1_000_000
const MAX_CSV_ROWS = 5000

function revalidateFinance() {
  for (const p of ['/admin/analytics', '/admin/analytics/sales-performance', '/admin/analytics/reports', '/admin/analytics/finance', '/admin/analytics/ad-spend']) {
    revalidatePath(p)
  }
}

async function guarded(fn: () => Promise<ActionResult>): Promise<ActionResult> {
  try {
    await assertAdmin()
    return await fn()
  } catch (err) {
    if (err instanceof ValidationError) return { ok: false, message: err.message }
    if (err instanceof Error && err.message === 'UNAUTHORIZED') return { ok: false, message: 'Your admin session expired. Log in again.' }
    console.error('[finance-actions]', err instanceof Error ? err.message : err)
    return { ok: false, message: 'Could not save. Check the migration has been applied and try again.' }
  }
}

type Db = ReturnType<typeof createAdminSupabaseClient>

async function saleOrThrow(db: Db, id: string) {
  const { data, error } = await db.from('sales').select('*').eq('id', id).single()
  if (error || !data) throw new ValidationError('Sale not found')
  return data as Record<string, unknown>
}

/**
 * After the items of an order change, keep the old sales columns consistent so the legacy analytics
 * and the new reports tell the same story: price = items - discount, cost = items' cost snapshots.
 */
async function syncLegacyTotals(db: Db, saleId: string) {
  const { data: items } = await db.from('sale_items').select('quantity, unit_price_egp, unit_cost_egp_snapshot').eq('sale_id', saleId)
  const sale = await saleOrThrow(db, saleId)
  if (!items || items.length === 0) return
  const gross = items.reduce((a, i) => a + Number(i.unit_price_egp) * Number(i.quantity), 0)
  const net = Math.round((gross - Number(sale.discount_egp ?? 0)) * 100) / 100
  const patch: Record<string, number> = { selling_price_egp: net }
  if (items.every((i) => i.unit_cost_egp_snapshot !== null)) {
    const cost = Math.round(items.reduce((a, i) => a + Number(i.unit_cost_egp_snapshot) * Number(i.quantity), 0) * 100) / 100
    patch.cost_egp = cost
    patch.profit_egp = Math.round((net - cost - Number(sale.commission_egp ?? 0)) * 100) / 100
  }
  const { error } = await db.from('sales').update(patch).eq('id', saleId)
  if (error) throw error
}

// ─── Sale details: status, delivery, payment, discount, shipping revenue, cash ───────────────────
export async function saveSaleDetails(_prev: ActionResult | null, f: FormData): Promise<ActionResult> {
  return guarded(async () => {
    const db = createAdminSupabaseClient()
    const id = uuid(f, 'sale_id')
    const before = await saleOrThrow(db, id)

    const status = oneOf(f, 'status', SALE_STATUSES)!
    const delivery = oneOf(f, 'delivery_status', DELIVERY, { optional: true })
    const payment = oneOf(f, 'payment_method', PAYMENT, { optional: true })
    const cash = money(f, 'cash_collected_egp')
    const patch = {
      status,
      delivery_status: delivery,
      payment_method: payment,
      order_ref: optionalText(f, 'order_ref', 60),
      discount_egp: money(f, 'discount_egp') ?? 0,
      shipping_revenue_egp: money(f, 'shipping_revenue_egp') ?? 0,
      cash_collected_egp: cash,
      cash_collected_at: cash !== null && cash > 0 && before.cash_collected_at == null ? new Date().toISOString() : before.cash_collected_at ?? null,
    }
    const { error } = await db.from('sales').update(patch).eq('id', id)
    if (error) throw error
    await syncLegacyTotals(db, id)

    if (status === 'completed' && before.status !== 'completed') await recordServerEvent({ event: 'sale_completed', saleId: id })
    if (delivery === 'delivered' && before.delivery_status !== 'delivered') await recordServerEvent({ event: 'order_delivered', saleId: id })
    if (cash !== null && cash > 0 && !(Number(before.cash_collected_egp ?? 0) > 0)) await recordServerEvent({ event: 'payment_confirmed', saleId: id })

    revalidateFinance()
    return ok('Sale details saved.')
  })
}

// ─── Items (multi-product orders) with a frozen cost snapshot ────────────────────────────────────
export async function addSaleItem(_prev: ActionResult | null, f: FormData): Promise<ActionResult> {
  return guarded(async () => {
    const db = createAdminSupabaseClient()
    const saleId = uuid(f, 'sale_id')
    const sale = await saleOrThrow(db, saleId)
    const productId = integer(f, 'product_id', { min: 1 })
    let name = optionalText(f, 'product_name', 200)
    let cost = money(f, 'unit_cost_egp')

    if (productId !== null) {
      const { data: product } = await db.from('products').select('title, cost_egp').eq('id', productId).maybeSingle()
      if (!product) throw new ValidationError(`Product #${productId} does not exist`)
      name = name ?? product.title
      // snapshot: copy the product's current cost now, so later cost changes never rewrite this sale
      if (cost === null && product.cost_egp !== null) cost = Number(product.cost_egp)
    }
    if (!name) throw new ValidationError('product name or product id is required')

    // An order made before this feature has its single product only on the sale row. Turn that into a real line
    // first, otherwise adding a second product would silently replace it.
    const { count } = await db.from('sale_items').select('id', { count: 'exact', head: true }).eq('sale_id', saleId)
    if ((count ?? 0) === 0) {
      const legacyCost = Number(sale.cost_egp ?? 0)
      const { error: legacyErr } = await db.from('sale_items').insert({
        sale_id: saleId,
        product_id: sale.product_id ?? null,
        product_name: String(sale.product_name ?? 'Unknown product'),
        quantity: 1,
        unit_price_egp: Number(sale.selling_price_egp ?? 0) + Number(sale.discount_egp ?? 0),
        unit_cost_egp_snapshot: legacyCost > 0 ? legacyCost : null,
      })
      if (legacyErr) throw legacyErr
    }

    const { error } = await db.from('sale_items').insert({
      sale_id: saleId,
      product_id: productId,
      product_name: name,
      quantity: integer(f, 'quantity', { min: 1, required: true })!,
      unit_price_egp: money(f, 'unit_price_egp', { required: true })!,
      unit_cost_egp_snapshot: cost,
    })
    if (error) throw error
    await syncLegacyTotals(db, saleId)
    revalidateFinance()
    return ok('Item added. The order price and cost were recalculated from its items.')
  })
}

export async function addOrderCost(_prev: ActionResult | null, f: FormData): Promise<ActionResult> {
  return guarded(async () => {
    const db = createAdminSupabaseClient()
    const saleId = uuid(f, 'sale_id')
    await saleOrThrow(db, saleId)
    const { error } = await db.from('order_costs').insert({
      sale_id: saleId,
      category: oneOf(f, 'category', ORDER_COST_CATEGORIES)!,
      amount_egp: money(f, 'amount_egp', { required: true })!,
      incurred_at: date(f, 'incurred_at', todayCairo()),
      note: optionalText(f, 'note', 300),
    })
    if (error) throw error
    revalidateFinance()
    return ok('Order cost added.')
  })
}

export async function addRefund(_prev: ActionResult | null, f: FormData): Promise<ActionResult> {
  return guarded(async () => {
    const db = createAdminSupabaseClient()
    const saleId = uuid(f, 'sale_id')
    const sale = await saleOrThrow(db, saleId)
    const amount = money(f, 'amount_egp', { required: true, min: 0.01 })!

    const { data: items } = await db.from('sale_items').select('quantity, unit_price_egp').eq('sale_id', saleId)
    const gross = items && items.length > 0
      ? items.reduce((a, i) => a + Number(i.unit_price_egp) * Number(i.quantity), 0) - Number(sale.discount_egp ?? 0)
      : Number(sale.selling_price_egp ?? 0)
    const { data: existing } = await db.from('refunds').select('amount_egp').eq('sale_id', saleId)
    const already = (existing ?? []).reduce((a, r) => a + Number(r.amount_egp), 0)
    if (already + amount > gross + 0.005) {
      throw new ValidationError(`Refunds would total ${(already + amount).toFixed(2)} EGP, more than the order value ${gross.toFixed(2)} EGP`)
    }

    const itemId = optionalText(f, 'sale_item_id', 64)
    if (itemId) uuid(new Map([['sale_item_id', itemId]]) as unknown as FormData, 'sale_item_id')
    const { error } = await db.from('refunds').insert({
      sale_id: saleId,
      sale_item_id: itemId,
      amount_egp: amount,
      returned_quantity: integer(f, 'returned_quantity', { min: 0 }) ?? 0,
      restocked: checkbox(f, 'restocked'),
      reason: optionalText(f, 'reason', 300),
      refunded_at: date(f, 'refunded_at', todayCairo()),
    })
    if (error) throw error
    await recordServerEvent({ event: 'refund_issued', saleId, detail: `${amount} EGP` })
    revalidateFinance()
    return ok('Refund recorded.')
  })
}

export async function addOperatingExpense(_prev: ActionResult | null, f: FormData): Promise<ActionResult> {
  return guarded(async () => {
    const { error } = await createAdminSupabaseClient().from('operating_expenses').insert({
      category: oneOf(f, 'category', EXPENSE_CATEGORIES)!,
      amount_egp: money(f, 'amount_egp', { required: true })!,
      expense_date: date(f, 'expense_date', todayCairo()),
      note: optionalText(f, 'note', 300),
    })
    if (error) throw error
    revalidateFinance()
    return ok('Expense recorded.')
  })
}

export async function setProductCost(_prev: ActionResult | null, f: FormData): Promise<ActionResult> {
  return guarded(async () => {
    const id = integer(f, 'product_id', { min: 1, required: true })!
    const { data, error } = await createAdminSupabaseClient()
      .from('products').update({ cost_egp: money(f, 'cost_egp', { required: true })! }).eq('id', id).select('id')
    if (error) throw error
    if (!data || data.length === 0) throw new ValidationError(`Product #${id} does not exist`)
    revalidateFinance()
    return ok('Product cost saved. Past sales keep the cost they were recorded with.')
  })
}

// ─── Attribution: explicit evidence only ─────────────────────────────────────────────────────────
export async function saveAttribution(_prev: ActionResult | null, f: FormData): Promise<ActionResult> {
  return guarded(async () => {
    const db = createAdminSupabaseClient()
    const saleId = uuid(f, 'sale_id')
    await saleOrThrow(db, saleId)
    const status = oneOf(f, 'status', ['attributed', 'unknown'] as const)!

    if (status === 'unknown') {
      const { error } = await db.from('sales_attribution').upsert({
        sale_id: saleId, status: 'unknown', model: 'unknown', evidence: null, utm_source: null, utm_medium: null,
        utm_campaign: null, utm_content: null, first_touch_source: null, last_non_direct_source: null,
        closing_channel: optionalText(f, 'closing_channel', 60), updated_at: new Date().toISOString(),
      })
      if (error) throw error
      revalidateFinance()
      return ok('Marked as unknown attribution.')
    }

    let utmSource = optionalText(f, 'utm_source', 120)
    let utmMedium = optionalText(f, 'utm_medium', 120)
    let utmCampaign = optionalText(f, 'utm_campaign', 120)
    let utmContent = optionalText(f, 'utm_content', 120)
    let first = optionalText(f, 'first_touch_source', 120)
    let last = optionalText(f, 'last_non_direct_source', 120)
    let model: 'last_non_direct' | 'manual' = 'manual'
    let evidence = optionalText(f, 'evidence', 400)

    // Evidence from the record the sale came from (the most recent tracked event for that reservation/request)
    const refType = optionalText(f, 'ref_type', 30)
    const refId = optionalText(f, 'ref_id', 30)
    if (refType && refId) {
      const { data: tp } = await db.from('marketing_touchpoints').select('*').eq('ref_type', refType).eq('ref_id', refId)
        .order('occurred_at', { ascending: false }).limit(1).maybeSingle()
      if (!tp || (!tp.utm_source && !tp.utm_campaign)) {
        throw new ValidationError(`No tracked source was recorded for ${refType} #${refId}. Leave it unknown or enter the source with written evidence.`)
      }
      utmSource = utmSource ?? tp.utm_source; utmMedium = utmMedium ?? tp.utm_medium
      utmCampaign = utmCampaign ?? tp.utm_campaign; utmContent = utmContent ?? tp.utm_content
      first = first ?? tp.first_touch_source; last = last ?? tp.last_non_direct_source
      evidence = evidence ?? `Tracked UTM on ${refType} #${refId} (touchpoint ${tp.id})`
      model = 'last_non_direct'
    }

    if (!utmSource && !utmCampaign) throw new ValidationError('Enter a source or campaign, or mark the sale as unknown')
    if (!evidence) throw new ValidationError('Written evidence is required to attribute a sale (e.g. "customer said they saw the Reel")')

    const { error } = await db.from('sales_attribution').upsert({
      sale_id: saleId, status: 'attributed', model, evidence, utm_source: utmSource, utm_medium: utmMedium,
      utm_campaign: utmCampaign, utm_content: utmContent, first_touch_source: first, last_non_direct_source: last,
      closing_channel: optionalText(f, 'closing_channel', 60), updated_at: new Date().toISOString(),
    })
    if (error) throw error
    revalidateFinance()
    return ok('Attribution saved.')
  })
}

// ─── Advertising spend ───────────────────────────────────────────────────────────────────────────
export async function addSpend(_prev: ActionResult | null, f: FormData): Promise<ActionResult> {
  return guarded(async () => {
    const v = validateSpend({
      platform: requiredText(f, 'platform', 80), campaign: requiredText(f, 'campaign', 120), date: date(f, 'spend_date'),
      currency: optionalText(f, 'currency', 3) ?? 'EGP', amount: money(f, 'amount', { required: true })!,
      fxRateToEgp: money(f, 'fx_rate_to_egp', { min: 0.000001 }),
    }, 'manual')
    if (!v.ok) throw new ValidationError(v.error)

    const { data, error } = await createAdminSupabaseClient()
      .from('marketing_spend').upsert(v.row, { onConflict: 'source_hash', ignoreDuplicates: true }).select('id')
    if (error) throw error
    revalidateFinance()
    return data && data.length > 0 ? ok('Spend recorded.') : { ok: false, message: 'That exact spend (platform, campaign, date, amount) is already recorded.' }
  })
}

export async function importSpendCsv(_prev: ActionResult | null, f: FormData): Promise<ActionResult> {
  return guarded(async () => {
    const file = f.get('file')
    let text = ''
    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_CSV_BYTES) throw new ValidationError('CSV is larger than 1 MB')
      text = await file.text()
    } else {
      text = optionalText(f, 'csv_text', MAX_CSV_BYTES) ?? ''
    }
    if (!text.trim()) throw new ValidationError('Choose a CSV file or paste CSV text')

    const parsed = parseSpendCsv(text)
    if (parsed.valid.length > MAX_CSV_ROWS) throw new ValidationError(`Too many rows (max ${MAX_CSV_ROWS})`)

    let inserted = 0
    if (parsed.valid.length > 0) {
      const db = createAdminSupabaseClient()
      for (let i = 0; i < parsed.valid.length; i += 500) {
        const { data, error } = await db.from('marketing_spend')
          .upsert(parsed.valid.slice(i, i + 500), { onConflict: 'source_hash', ignoreDuplicates: true }).select('id')
        if (error) throw error
        inserted += data?.length ?? 0
      }
    }
    const alreadyThere = parsed.valid.length - inserted
    revalidateFinance()

    const parts = [`${inserted} new row(s) imported`]
    if (alreadyThere > 0) parts.push(`${alreadyThere} already existed (skipped)`)
    if (parsed.duplicatesInFile > 0) parts.push(`${parsed.duplicatesInFile} repeated in the file (skipped)`)
    if (parsed.rejected.length > 0) {
      parts.push(`${parsed.rejected.length} rejected: ` + parsed.rejected.slice(0, 5).map((r) => `line ${r.line} ${r.error}`).join('; '))
    }
    return { ok: parsed.rejected.length === 0 || inserted > 0, message: parts.join(' · ') }
  })
}

export async function syncMetaNow(_prev: ActionResult | null, f: FormData): Promise<ActionResult> {
  return guarded(async () => {
    const days = integer(f, 'days', { min: 1 }) ?? 7
    const r = await syncMetaSpend(createAdminSupabaseClient(), { days })
    if (r.ok) revalidateFinance()
    // 'not configured' is shown as a notice, not as a green success
    return { ok: r.ok && r.configured, message: r.message }
  })
}
