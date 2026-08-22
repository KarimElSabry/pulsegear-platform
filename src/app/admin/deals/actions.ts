// app/admin/deals/actions.ts

'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { DealStatus } from '@/types/deals'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ─── Get All Deals ────────────────────────────────────────────────────────────
export async function getDeals() {
  const { data: deals, error } = await supabase
    .from('deals')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  if (!deals || deals.length === 0) return []

  const requestIds = deals
    .map((d) => d.product_request_id)
    .filter(Boolean) as number[]

  let requestsMap: Record<number, any> = {}

  if (requestIds.length > 0) {
    const { data: requests, error: reqError } = await supabase
      .from('product_requests')
      .select('id, requested_product, budget, customer_name, phone, instagram')
      .in('id', requestIds)

    if (reqError) throw new Error(reqError.message)

    requestsMap = Object.fromEntries(
      (requests ?? []).map((r) => [r.id, r])
    )
  }

  return deals.map((deal) => ({
    ...deal,
    product_request: deal.product_request_id
      ? requestsMap[deal.product_request_id] ?? null
      : null,
  }))
}

// ─── Get Open Product Requests ────────────────────────────────────────────────
export async function getOpenProductRequests() {
  const { data, error } = await supabase
    .from('product_requests')
    .select('id, requested_product, customer_name, phone, instagram, budget, status, notes')
    .in('status', ['new', 'contacted', 'deal_agreed'])
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

// ─── Create Deal ──────────────────────────────────────────────────────────────
export async function createDeal(formData: FormData) {
  // ✅ Safe parse helpers
  const getStr   = (key: string) => (formData.get(key) as string | null) || null
  const getFloat = (key: string) => {
    const v = formData.get(key) as string | null
    return v && v.trim() !== '' ? parseFloat(v) : null
  }
  const getInt = (key: string) => {
    const v = formData.get(key) as string | null
    return v && v.trim() !== '' ? parseInt(v) : null
  }

  const { error } = await supabase.from('deals').insert({
    product_request_id:   getInt('product_request_id'),

    customer_name:        getStr('customer_name'),
    phone:                getStr('phone'),
    customer_instagram:   getStr('customer_instagram'),

    status:               getStr('status')       ?? 'deposit_pending',
    source_link:          getStr('source_link'),
    source_platform:      getStr('source_platform'),
    sale_channel:         getStr('sale_channel') ?? 'whatsapp',
    notes:                getStr('notes'),

    source_price_eur:     getFloat('source_price_eur'),
    exchange_rate:        getFloat('exchange_rate'),
    selling_price_egp:    getFloat('selling_price_egp'),
    deposit_amount_egp:   getFloat('deposit_amount_egp'),
    remaining_amount_egp: getFloat('remaining_amount_egp'),
    commission_egp:       getFloat('commission_egp') ?? 0,
  })

  if (error) {
    console.error('createDeal error:', error)
    throw new Error(error.message)
  }

  revalidatePath('/admin/deals')
  revalidatePath('/admin/sales')
  revalidatePath('/admin/analytics')
}

// ─── Update Deal ──────────────────────────────────────────────────────────────
export async function updateDeal(id: string, formData: FormData) {
  // ✅ Safe parse helpers
  const getStr   = (key: string) => (formData.get(key) as string | null) || null
  const getFloat = (key: string) => {
    const v = formData.get(key) as string | null
    return v && v.trim() !== '' ? parseFloat(v) : null
  }
  const getInt = (key: string) => {
    const v = formData.get(key) as string | null
    return v && v.trim() !== '' ? parseInt(v) : null
  }

  const updatePayload = {
    product_request_id:   getInt('product_request_id'),

    customer_name:        getStr('customer_name'),
    phone:                getStr('phone'),
    customer_instagram:   getStr('customer_instagram'),

    status:               getStr('status')       ?? 'deposit_pending',
    source_link:          getStr('source_link'),
    source_platform:      getStr('source_platform'),
    sale_channel:         getStr('sale_channel') ?? 'whatsapp',
    notes:                getStr('notes'),

    source_price_eur:     getFloat('source_price_eur'),
    exchange_rate:        getFloat('exchange_rate'),
    selling_price_egp:    getFloat('selling_price_egp'),
    deposit_amount_egp:   getFloat('deposit_amount_egp'),
    remaining_amount_egp: getFloat('remaining_amount_egp'),
    commission_egp:       getFloat('commission_egp') ?? 0,
  }

  console.log('updateDeal payload:', updatePayload)

  const { error } = await supabase
    .from('deals')
    .update(updatePayload)
    .eq('id', id)

  if (error) {
    console.error('updateDeal error:', error)
    throw new Error(error.message)
  }

  revalidatePath('/admin/deals')
  revalidatePath('/admin/sales')
  revalidatePath('/admin/analytics')
}

// ─── Update Deal Status Only ──────────────────────────────────────────────────
export async function updateDealStatus(id: string, status: DealStatus) {
  const extra: Record<string, string> = {}

  if (status === 'deposit_paid')   extra.deposit_paid_at   = new Date().toISOString()
  if (status === 'shipping')       extra.shipped_at        = new Date().toISOString()
  if (status === 'arrived_egypt')  extra.arrived_egypt_at  = new Date().toISOString()
  if (status === 'delivered')      extra.delivered_at      = new Date().toISOString()
  if (status === 'completed')      extra.remaining_paid_at = new Date().toISOString()

  const { error } = await supabase
    .from('deals')
    .update({ status, ...extra })
    .eq('id', id)

  if (error) throw new Error(error.message)

  if (status === 'completed') {
    await syncDealToSales(id)
  }

  revalidatePath('/admin/deals')
  revalidatePath('/admin/sales')
  revalidatePath('/admin/analytics')
}

// ─── Sync Completed Deal → Sales ──────────────────────────────────────────────
async function syncDealToSales(dealId: string) {
  const { data: deal, error: dealError } = await supabase
    .from('deals')
    .select(`
      *,
      product_request:product_requests (
        requested_product
      )
    `)
    .eq('id', dealId)
    .single()

  if (dealError || !deal) {
    console.error('syncDealToSales: could not fetch deal', dealError)
    return
  }

  const { data: existing } = await supabase
    .from('sales')
    .select('id')
    .eq('deal_id', dealId)
    .maybeSingle()

  if (existing) {
    console.log('syncDealToSales: already synced, skipping')
    return
  }

  const productName =
    deal.product_request?.requested_product ??
    deal.customer_name                       ??
    'Unknown Product'

  const sourceEur  = deal.source_price_eur  ?? 0
  const rate       = deal.exchange_rate      ?? 0
  const costEgp    = sourceEur * rate
  const sellingEgp = deal.selling_price_egp  ?? 0
  const commission = deal.commission_egp     ?? 0
  const profitEgp  = sellingEgp - costEgp - commission
  const marginPct  = sellingEgp > 0
    ? parseFloat(((profitEgp / sellingEgp) * 100).toFixed(2))
    : 0

  const { error: insertError } = await supabase.from('sales').insert({
    deal_id:           dealId,
    product_name:      productName,
    original_eur:      sourceEur,
    shipping_eur:      0,
    exchange_rate:     rate,
    cost_egp:          costEgp,
    selling_price_egp: sellingEgp,
    profit_egp:        profitEgp,
    profit_margin_pct: marginPct,
    commission_egp:    commission,
    sale_channel:      deal.sale_channel    ?? 'whatsapp',
    sale_date:         new Date().toISOString().split('T')[0],
    source_platform:   deal.source_platform ?? null,
    source_url:        deal.source_link     ?? null,
    notes:             deal.notes           ?? null,
    discount_code:     null,
  })

  if (insertError) {
    console.error('syncDealToSales: insert failed', insertError)
  } else {
    console.log('syncDealToSales: ✅ synced deal', dealId, 'to sales')
  }
}

// ─── Delete Deal ──────────────────────────────────────────────────────────────
export async function deleteDeal(id: string) {
  await supabase
    .from('sales')
    .delete()
    .eq('deal_id', id)

  const { error } = await supabase
    .from('deals')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/deals')
  revalidatePath('/admin/sales')
  revalidatePath('/admin/analytics')
}