// src/app/admin/deals/actions.ts

'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { DealStatus } from '@/types/deals'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function getStr(formData: FormData, key: string): string | null {
  const value = formData.get(key) as string | null
  return value && value.trim() !== '' ? value.trim() : null
}

function getFloat(formData: FormData, key: string): number | null {
  const value = formData.get(key) as string | null
  if (!value || value.trim() === '') return null
  const number = parseFloat(value)
  return Number.isNaN(number) ? null : number
}

function getInt(formData: FormData, key: string): number | null {
  const value = formData.get(key) as string | null
  if (!value || value.trim() === '') return null
  const number = parseInt(value, 10)
  return Number.isNaN(number) ? null : number
}

export async function getDeals() {
  const { data: deals, error } = await supabase
    .from('deals')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  if (!deals || deals.length === 0) {
    return []
  }

  const requestIds = deals.map((deal) => deal.product_request_id).filter(Boolean) as number[]

  let requestsMap: Record<number, any> = {}

  if (requestIds.length > 0) {
    const { data: requests, error: requestsError } = await supabase
      .from('product_requests')
      .select(`
        id,
        requested_product,
        budget,
        customer_name,
        phone,
        instagram
      `)
      .in('id', requestIds)

    if (requestsError) {
      throw new Error(requestsError.message)
    }

    requestsMap = Object.fromEntries((requests ?? []).map((request) => [request.id, request]))
  }

  return deals.map((deal) => ({
    ...deal,
    product_request: deal.product_request_id ? requestsMap[deal.product_request_id] ?? null : null,
  }))
}

export async function getOpenProductRequests() {
  const { data, error } = await supabase
    .from('product_requests')
    .select(`
      id,
      requested_product,
      customer_name,
      phone,
      instagram,
      budget,
      status,
      notes
    `)
    .in('status', ['new', 'contacted', 'deal_agreed'])
    .is('deal_id', null)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}

export async function createDeal(formData: FormData) {
  const productRequestId = getInt(formData, 'product_request_id')

  const payload = {
    product_request_id: productRequestId,
    customer_name: getStr(formData, 'customer_name'),
    phone: getStr(formData, 'phone'),
    customer_instagram: getStr(formData, 'customer_instagram'),
    status: getStr(formData, 'status') ?? 'deposit_pending',
    source_link: getStr(formData, 'source_link'),
    source_platform: getStr(formData, 'source_platform'),
    sale_channel: getStr(formData, 'sale_channel') ?? 'whatsapp',
    notes: getStr(formData, 'notes'),
    source_price_eur: getFloat(formData, 'source_price_eur'),
    shipping_eur: getFloat(formData, 'shipping_eur') ?? 0,
    exchange_rate: getFloat(formData, 'exchange_rate'),
    selling_price_egp: getFloat(formData, 'selling_price_egp'),
    deposit_amount_egp: getFloat(formData, 'deposit_amount_egp'),
    remaining_amount_egp: getFloat(formData, 'remaining_amount_egp'),
    commission_egp: getFloat(formData, 'commission_egp') ?? 0,
  }

  const { error } = await supabase.from('deals').insert(payload).select('id').single()

  if (error) {
    console.error('createDeal error:', error)
    throw new Error(error.message)
  }

  if (productRequestId) {
    const { error: requestError } = await supabase
      .from('product_requests')
      .update({
        status: 'deal_agreed',
        deal_id: null,
      })
      .eq('id', productRequestId)

    if (requestError) {
      console.warn('Failed to update product request after creating deal:', requestError.message)
    }
  }

  revalidateDealPaths()
}

export async function updateDeal(id: string, formData: FormData) {
  const productRequestId = getInt(formData, 'product_request_id')

  const payload = {
    product_request_id: productRequestId,
    customer_name: getStr(formData, 'customer_name'),
    phone: getStr(formData, 'phone'),
    customer_instagram: getStr(formData, 'customer_instagram'),
    status: getStr(formData, 'status') ?? 'deposit_pending',
    source_link: getStr(formData, 'source_link'),
    source_platform: getStr(formData, 'source_platform'),
    sale_channel: getStr(formData, 'sale_channel') ?? 'whatsapp',
    notes: getStr(formData, 'notes'),
    source_price_eur: getFloat(formData, 'source_price_eur'),
    shipping_eur: getFloat(formData, 'shipping_eur') ?? 0,
    exchange_rate: getFloat(formData, 'exchange_rate'),
    selling_price_egp: getFloat(formData, 'selling_price_egp'),
    deposit_amount_egp: getFloat(formData, 'deposit_amount_egp'),
    remaining_amount_egp: getFloat(formData, 'remaining_amount_egp'),
    commission_egp: getFloat(formData, 'commission_egp') ?? 0,
  }

  const { error } = await supabase.from('deals').update(payload).eq('id', id)

  if (error) {
    console.error('updateDeal error:', error)
    throw new Error(error.message)
  }

  if (productRequestId) {
    const { error: requestError } = await supabase
      .from('product_requests')
      .update({ status: 'deal_agreed' })
      .eq('id', productRequestId)

    if (requestError) {
      console.warn('Failed to update product request after updating deal:', requestError.message)
    }
  }

  await syncExistingSaleFromDeal(id)
  revalidateDealPaths()
}

export async function updateDealStatus(
  id: string,
  status: DealStatus,
  cancellationReason?: string
) {
  const extra: Record<string, string | null> = {}

  if (status === 'deposit_paid') {
    extra.deposit_paid_at = new Date().toISOString()
  }

  if (status === 'shipping') {
    extra.shipped_at = new Date().toISOString()
  }

  if (status === 'arrived_egypt') {
    extra.arrived_egypt_at = new Date().toISOString()
  }

  if (status === 'delivered') {
    extra.delivered_at = new Date().toISOString()
  }

  if (status === 'completed') {
    extra.remaining_paid_at = new Date().toISOString()
  }

  if (status === 'cancelled') {
    extra.cancellation_reason = cancellationReason?.trim() || null
  }

  const { data: deal, error: fetchError } = await supabase
    .from('deals')
    .select('id, product_request_id, status')
    .eq('id', id)
    .single()

  if (fetchError || !deal) {
    throw new Error(fetchError?.message ?? 'Deal not found')
  }

  const { data: updatedDeal, error: updateError } = await supabase
    .from('deals')
    .update({
      status,
      ...extra,
    })
    .eq('id', id)
    .select('id, status, cancellation_reason')
    .single()

  if (updateError) {
    console.error('updateDealStatus error:', updateError)
    throw new Error(updateError.message)
  }

  console.log('Deal status updated:', updatedDeal)

  if (deal.product_request_id) {
    let requestStatus: string | null = null

    if (status === 'completed') requestStatus = 'completed'
    if (status === 'cancelled') requestStatus = 'cancelled'
    if (status === 'delivered') requestStatus = 'deal_agreed'

    if (requestStatus) {
      const { error: requestError } = await supabase
        .from('product_requests')
        .update({ status: requestStatus })
        .eq('id', deal.product_request_id)

      if (requestError) {
        console.error('Product request status update failed:', requestError.message)
      }
    }
  }

  if (status === 'completed') {
    try {
      await syncDealToSales(id)
    } catch (err) {
      console.error('syncDealToSales failed:', err)
      throw err
    }
  }

  revalidateDealPaths()
}

async function syncDealToSales(dealId: string) {
  const { data: deal, error: dealError } = await supabase
    .from('deals')
    .select(`
      *,
      product_request:product_requests(
        id,
        requested_product,
        customer_name
      )
    `)
    .eq('id', dealId)
    .single()

  if (dealError || !deal) {
    console.error('syncDealToSales: could not fetch deal', {
      dealId,
      error: dealError,
    })
    throw new Error(dealError?.message ?? 'Deal not found')
  }

  const request = Array.isArray(deal.product_request)
    ? deal.product_request[0]
    : deal.product_request

  const productName =
    request?.requested_product?.trim() ||
    request?.customer_name?.trim() ||
    deal.customer_name?.trim() ||
    deal.notes?.trim() ||
    `Deal ${dealId}`

  const sourceEur = Number(deal.source_price_eur ?? 0)
  const shippingEur = Number(deal.shipping_eur ?? 0)
  const exchangeRate = Number(deal.exchange_rate ?? 0)
  const sellingPrice = Number(deal.selling_price_egp ?? 0)
  const commission = Number(deal.commission_egp ?? 0)

  const costEgp = (sourceEur + shippingEur) * exchangeRate
  const profitEgp = sellingPrice - costEgp - commission
  const profitMarginPct =
    sellingPrice > 0 ? Number(((profitEgp / sellingPrice) * 100).toFixed(2)) : 0

  const { data: existingSale, error: existingSaleError } = await supabase
    .from('sales')
    .select('id')
    .eq('deal_id', dealId)
    .maybeSingle()

  if (existingSaleError) {
    console.error('syncDealToSales: failed checking existing sale:', existingSaleError)
    throw new Error(existingSaleError.message)
  }

  const salePayload = {
    deal_id: dealId,
    product_name: productName,
    original_eur: sourceEur,
    shipping_eur: shippingEur,
    exchange_rate: exchangeRate,
    cost_egp: costEgp,
    selling_price_egp: sellingPrice,
    profit_egp: profitEgp,
    profit_margin_pct: profitMarginPct,
    commission_egp: commission,
    sale_channel: deal.sale_channel ?? 'whatsapp',
    sale_date: deal.remaining_paid_at
      ? deal.remaining_paid_at.split('T')[0]
      : new Date().toISOString().split('T')[0],
    source_platform: deal.source_platform ?? null,
    source_url: deal.source_link ?? null,
    notes: deal.notes ?? null,
    discount_code: null,
  }

  if (existingSale) {
    const { error: updateSaleError } = await supabase
      .from('sales')
      .update(salePayload)
      .eq('id', existingSale.id)

    if (updateSaleError) {
      console.error('syncDealToSales: failed updating existing sale:', updateSaleError)
      throw new Error(updateSaleError.message)
    }

    console.log('syncDealToSales: existing sale updated', {
      dealId,
      saleId: existingSale.id,
      productName,
    })

    return
  }

  const { error: insertError } = await supabase.from('sales').insert(salePayload)

  if (insertError) {
    console.error('syncDealToSales: insert failed', {
      dealId,
      productName,
      insertError,
    })
    throw new Error(insertError.message)
  }

  console.log('syncDealToSales: sale created', {
    dealId,
    productName,
  })
}

async function syncExistingSaleFromDeal(dealId: string) {
  const { data: existingSale, error: saleLookupError } = await supabase
    .from('sales')
    .select('id')
    .eq('deal_id', dealId)
    .maybeSingle()

  if (saleLookupError) {
    throw new Error(saleLookupError.message)
  }

  if (!existingSale) return

  await syncDealToSales(dealId)
}

export async function deleteDeal(id: string) {
  const { data: deal } = await supabase
    .from('deals')
    .select('id, product_request_id')
    .eq('id', id)
    .single()

  const { error: unlinkError } = await supabase
    .from('product_requests')
    .update({ deal_id: null })
    .eq('deal_id', id)

  if (unlinkError) {
    throw new Error(unlinkError.message)
  }

  const { error: saleDeleteError } = await supabase.from('sales').delete().eq('deal_id', id)

  if (saleDeleteError) {
    throw new Error(saleDeleteError.message)
  }

  const { error: dealDeleteError } = await supabase.from('deals').delete().eq('id', id)

  if (dealDeleteError) {
    throw new Error(dealDeleteError.message)
  }

  if (deal?.product_request_id) {
    const { error: requestResetError } = await supabase
      .from('product_requests')
      .update({ status: 'contacted' })
      .eq('id', deal.product_request_id)

    if (requestResetError) {
      console.warn('Failed to reset product request status:', requestResetError.message)
    }
  }

  revalidateDealPaths()
}

function revalidateDealPaths() {
  revalidatePath('/admin/deals')
  revalidatePath('/admin/requests')
  revalidatePath('/admin/sales')
  revalidatePath('/admin/analytics')
}