// app/admin/sales/actions.ts

'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { assertAdmin } from '@/lib/admin-auth'
import { recordServerEvent } from '@/lib/tracking/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Shared by add/update: profit and margin are always computed here, never taken from the browser.
// Margin keeps the historical definition (profit / cost) so old and new rows stay comparable;
// the financial reports recompute true margins from revenue and do not read this column.
const cleanText = (v: FormDataEntryValue | null, max: number): string | null => {
  const t = typeof v === 'string' ? v.trim().slice(0, max) : ''
  return t || null
}

function computeFigures(formData: FormData) {
  const originalEur     = parseFloat(formData.get('original_eur')      as string) || 0
  const shippingEur     = parseFloat(formData.get('shipping_eur')      as string) || 0
  const egyptShippingEgp = parseFloat(formData.get('egypt_shipping_egp') as string) || 0
  const exchangeRate    = parseFloat(formData.get('exchange_rate')     as string) || 0
  const sellingPriceEgp = parseFloat(formData.get('selling_price_egp') as string) || 0
  const commissionEgp   = parseFloat(formData.get('commission_egp')    as string) || 0

  if (originalEur + shippingEur > 0 && exchangeRate <= 0) {
    // a blank rate used to make cost 0 and profit equal to the whole price
    throw new Error('Exchange rate is required when a EUR cost is entered')
  }
  if (sellingPriceEgp < 0 || commissionEgp < 0 || originalEur < 0 || shippingEur < 0 || egyptShippingEgp < 0) {
    throw new Error('Amounts cannot be negative')
  }

  const round = (n: number) => Math.round(n * 100) / 100
  const costEgp   = round((originalEur + shippingEur) * exchangeRate + egyptShippingEgp)
  const profitEgp = round(sellingPriceEgp - costEgp - commissionEgp)
  const marginPct = costEgp > 0 ? round((profitEgp / costEgp) * 100) : 0
  return { originalEur, shippingEur, egyptShippingEgp, exchangeRate, sellingPriceEgp, commissionEgp, costEgp, profitEgp, marginPct }
}

// ─── Add Sale ────────────────────────────────────────────────────────────────
export async function addSale(formData: FormData) {
  await assertAdmin()
  const { originalEur, shippingEur, egyptShippingEgp, exchangeRate, sellingPriceEgp, commissionEgp, costEgp, profitEgp, marginPct } = computeFigures(formData)
  const discountCode    = (formData.get('discount_code') as string) || null

  const { data: created, error } = await supabase.from('sales').insert({
    // ✅ deal_id is null for manually added sales
    deal_id:           null,
    product_name:      formData.get('product_name'),
    original_eur:      originalEur,
    shipping_eur:      shippingEur,
    egypt_shipping_egp: egyptShippingEgp,
    exchange_rate:     exchangeRate,
    cost_egp:          costEgp,
    selling_price_egp: sellingPriceEgp,
    profit_egp:        profitEgp,
    profit_margin_pct: marginPct,
    commission_egp:    commissionEgp,
    sale_channel:      formData.get('sale_channel'),
    sale_date:         formData.get('sale_date'),
    source_platform:   formData.get('source_platform'),
    source_url:        formData.get('source_url') || null,
    notes:             formData.get('notes')       || null,
    discount_code:     discountCode,
    customer_name:     cleanText(formData.get('customer_name'), 120),
    customer_phone:    cleanText(formData.get('customer_phone'), 30),
  }).select('id').single()

  if (error) throw new Error(error.message)

  if (discountCode) {
    await supabase.rpc('increment_discount_usage', { code_value: discountCode })
  }

  if (created?.id) {
    await recordServerEvent({ event: 'order_created', saleId: created.id })
    await recordServerEvent({ event: 'sale_completed', saleId: created.id })
  }

  revalidatePath('/admin/analytics')
  revalidatePath('/admin/sales')
}

// ─── Update Sale ─────────────────────────────────────────────────────────────
export async function updateSale(id: string, formData: FormData) {
  await assertAdmin()
  // a form that does not send the Egypt shipping must keep the stored value, never reset it to 0
  if (!formData.has('egypt_shipping_egp')) {
    const { data: stored } = await supabase.from('sales').select('egypt_shipping_egp').eq('id', id).maybeSingle()
    formData.set('egypt_shipping_egp', String(stored?.egypt_shipping_egp ?? 0))
  }
  const { originalEur, shippingEur, egyptShippingEgp, exchangeRate, sellingPriceEgp, commissionEgp, costEgp, profitEgp, marginPct } = computeFigures(formData)

  const rawCode      = formData.get('discount_code') as string | null
  const discountCode = rawCode && rawCode.trim() !== '' ? rawCode.trim() : null

  // fetch old code before updating to adjust usage_count
  const { data: existingSale } = await supabase
    .from('sales')
    .select('discount_code')
    .eq('id', id)
    .single()

  const oldCode = existingSale?.discount_code ?? null

  const { error } = await supabase
    .from('sales')
    .update({
      product_name:      formData.get('product_name'),
      original_eur:      originalEur,
      shipping_eur:      shippingEur,
    egypt_shipping_egp: egyptShippingEgp,
      exchange_rate:     exchangeRate,
      cost_egp:          costEgp,
      selling_price_egp: sellingPriceEgp,
      profit_egp:        profitEgp,
      profit_margin_pct: marginPct,
      commission_egp:    commissionEgp,
      sale_channel:      formData.get('sale_channel'),
      sale_date:         formData.get('sale_date'),
      // only overwrite when the form actually sends them (the analytics edit form does not)
      ...(formData.has('source_platform') ? { source_platform: formData.get('source_platform') } : {}),
      ...(formData.has('source_url') ? { source_url: formData.get('source_url') || null } : {}),
      notes:             formData.get('notes') || null,
      discount_code:     discountCode,
      // only touch the buyer when the form sends it (the analytics edit form does not)
      ...(formData.has('customer_name') ? { customer_name: cleanText(formData.get('customer_name'), 120) } : {}),
      ...(formData.has('customer_phone') ? { customer_phone: cleanText(formData.get('customer_phone'), 30) } : {}),
      // ✅ NOTE — we never overwrite deal_id on update
      // deal_id stays whatever it was set to originally
    })
    .eq('id', id)

  if (error) throw new Error(error.message)

  // adjust usage_count only if code actually changed
  if (oldCode !== discountCode) {
    if (oldCode) {
      await supabase.rpc('decrement_discount_usage', { code_value: oldCode })
    }
    if (discountCode) {
      await supabase.rpc('increment_discount_usage', { code_value: discountCode })
    }
  }

  revalidatePath('/admin/analytics')
  revalidatePath('/admin/sales')
}

// ─── Delete Sale ─────────────────────────────────────────────────────────────
export async function deleteSale(id: string) {
  await assertAdmin()
  // decrement usage_count when deleting a sale that had a code
  const { data: sale } = await supabase
    .from('sales')
    .select('discount_code')
    .eq('id', id)
    .single()

  if (sale?.discount_code) {
    await supabase.rpc('decrement_discount_usage', { code_value: sale.discount_code })
  }

  const { error } = await supabase.from('sales').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/sales')
  revalidatePath('/admin/analytics')
}

// ─── Get All Sales ────────────────────────────────────────────────────────────
export async function getSales() {
  await assertAdmin()
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .order('sale_date', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

// ─── Get Discount Codes ───────────────────────────────────────────────────────
export async function getDiscountCodes() {
  await assertAdmin()
  const { data, error } = await supabase
    .from('discount_codes')
    .select('code, discount_percent')
    .eq('is_active', true)
    .order('code')

  if (error) throw new Error(error.message)
  return data ?? []
}

// ─── Update Discount Code Usage Count ────────────────────────────────────────
export async function updateDiscountUsage(code: string, newCount: number) {
  await assertAdmin()
  const { error } = await supabase
    .from('discount_codes')
    .update({ usage_count: newCount })
    .eq('code', code)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/analytics')
}