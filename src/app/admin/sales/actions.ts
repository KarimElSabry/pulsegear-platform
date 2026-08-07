// src/admin/sales/actions.ts

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
  })

  if (error) throw new Error(error.message)
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

  const costEgp   = (originalEur + shippingEur) * exchangeRate
  const profitEgp = sellingPriceEgp - costEgp - commissionEgp

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
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/analytics')
  revalidatePath('/admin/sales')
}

// ─── Delete Sale ─────────────────────────────────────────────────────────────
export async function deleteSale(id: string) {
  const { error } = await supabase.from('sales').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/sales')
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