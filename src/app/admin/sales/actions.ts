// app/admin/sales/actions.ts

'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ─── Add Sale ────────────────────────────────────────────────────────────────
export async function addSale(formData: FormData) {
  const originalEur     = parseFloat(formData.get('original_eur')      as string) || 0
  const shippingEur     = parseFloat(formData.get('shipping_eur')      as string) || 0
  const exchangeRate    = parseFloat(formData.get('exchange_rate')     as string) || 0
  const sellingPriceEgp = parseFloat(formData.get('selling_price_egp') as string) || 0
  const commissionEgp   = parseFloat(formData.get('commission_egp')    as string) || 0
  const marginPct       = parseFloat(formData.get('profit_margin_pct') as string) || 0
  const discountCode    = (formData.get('discount_code') as string) || null

  const costEgp   = (originalEur + shippingEur) * exchangeRate
  const profitEgp = sellingPriceEgp - costEgp - commissionEgp

  const { error } = await supabase.from('sales').insert({
    product_name:      formData.get('product_name'),
    original_eur:      originalEur,
    shipping_eur:      shippingEur,
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
    notes:             formData.get('notes') || null,
    discount_code:     discountCode,
  })

  if (error) throw new Error(error.message)

  if (discountCode) {
    await supabase.rpc('increment_discount_usage', { code_value: discountCode })
  }

  revalidatePath('/admin/analytics')
  revalidatePath('/admin/sales')
}

// ─── Update Sale ─────────────────────────────────────────────────────────────
export async function updateSale(id: string, formData: FormData) {
  const originalEur     = parseFloat(formData.get('original_eur')      as string) || 0
  const shippingEur     = parseFloat(formData.get('shipping_eur')      as string) || 0
  const exchangeRate    = parseFloat(formData.get('exchange_rate')     as string) || 0
  const sellingPriceEgp = parseFloat(formData.get('selling_price_egp') as string) || 0
  const commissionEgp   = parseFloat(formData.get('commission_egp')    as string) || 0
  const marginPct       = parseFloat(formData.get('profit_margin_pct') as string) || 0

  // ✅ FIX 1 — read discount_code, empty string → null
  const rawCode      = formData.get('discount_code') as string | null
  const discountCode = rawCode && rawCode.trim() !== '' ? rawCode.trim() : null

  const costEgp   = (originalEur + shippingEur) * exchangeRate
  const profitEgp = sellingPriceEgp - costEgp - commissionEgp

  // ✅ FIX 2 — fetch old code before updating to adjust usage_count
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
      exchange_rate:     exchangeRate,
      cost_egp:          costEgp,
      selling_price_egp: sellingPriceEgp,
      profit_egp:        profitEgp,
      profit_margin_pct: marginPct,
      commission_egp:    commissionEgp,
      sale_channel:      formData.get('sale_channel'),
      sale_date:         formData.get('sale_date'),
      notes:             formData.get('notes') || null,
      discount_code:     discountCode,           // ✅ FIX 3 — was missing!
    })
    .eq('id', id)

  if (error) throw new Error(error.message)

  // ✅ FIX 4 — adjust usage_count only if code actually changed
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
  // ✅ FIX 5 — decrement usage_count when deleting a sale that had a code
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
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .order('sale_date', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

// ─── Get Discount Codes ───────────────────────────────────────────────────────
export async function getDiscountCodes() {
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
  const { error } = await supabase
    .from('discount_codes')
    .update({ usage_count: newCount })
    .eq('code', code)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/analytics')
}