// src/app/admin/deals/actions.ts

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
      .select('id, requested_product, budget, customer_name, phone, customer_instagram') // ✅
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

// ─── Get Open Product Requests (for linking) ──────────────────────────────────
export async function getOpenProductRequests() {
  const { data, error } = await supabase
    .from('product_requests')
    .select('id, requested_product, customer_name, phone, customer_instagram, budget, status, notes') // ✅
    .in('status', ['new', 'contacted', 'deal_agreed'])
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

// ─── Create Deal ──────────────────────────────────────────────────────────────
export async function createDeal(formData: FormData) {
  const { error } = await supabase.from('deals').insert({
    product_request_id: formData.get('product_request_id')
      ? Number(formData.get('product_request_id'))
      : null,

    customer_name:      formData.get('customer_name')      || null,
    customer_phone:     formData.get('phone')     || null,
    customer_instagram: formData.get('customer_instagram') || null,

    status:             formData.get('status')             || 'deposit_pending',

    source_link:        formData.get('source_link')        || null,
    source_platform:    formData.get('source_platform')    || null,
    source_price_eur:   formData.get('source_price_eur')
      ? parseFloat(formData.get('source_price_eur') as string)
      : null,

    exchange_rate:      formData.get('exchange_rate')
      ? parseFloat(formData.get('exchange_rate') as string)
      : null,

    selling_price_egp:  formData.get('selling_price_egp')
      ? parseFloat(formData.get('selling_price_egp') as string)
      : null,

    deposit_amount_egp: formData.get('deposit_amount_egp')
      ? parseFloat(formData.get('deposit_amount_egp') as string)
      : null,

    remaining_amount_egp: formData.get('remaining_amount_egp')
      ? parseFloat(formData.get('remaining_amount_egp') as string)
      : null,

    commission_egp:     formData.get('commission_egp')
      ? parseFloat(formData.get('commission_egp') as string)
      : 0,

    sale_channel:       formData.get('sale_channel')       || 'whatsapp',
    notes:              formData.get('notes')              || null,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin/deals')
}

// ─── Update Deal ──────────────────────────────────────────────────────────────
export async function updateDeal(id: string, formData: FormData) {
  const { error } = await supabase
    .from('deals')
    .update({
      customer_name:      formData.get('customer_name')      || null,
      customer_phone:     formData.get('phone')     || null,
      customer_instagram: formData.get('customer_instagram') || null,

      status:             formData.get('status'),

      source_link:        formData.get('source_link')        || null,
      source_platform:    formData.get('source_platform')    || null,
      source_price_eur:   formData.get('source_price_eur')
        ? parseFloat(formData.get('source_price_eur') as string)
        : null,

      exchange_rate:      formData.get('exchange_rate')
        ? parseFloat(formData.get('exchange_rate') as string)
        : null,

      selling_price_egp:  formData.get('selling_price_egp')
        ? parseFloat(formData.get('selling_price_egp') as string)
        : null,

      deposit_amount_egp: formData.get('deposit_amount_egp')
        ? parseFloat(formData.get('deposit_amount_egp') as string)
        : null,

      remaining_amount_egp: formData.get('remaining_amount_egp')
        ? parseFloat(formData.get('remaining_amount_egp') as string)
        : null,

      commission_egp:     formData.get('commission_egp')
        ? parseFloat(formData.get('commission_egp') as string)
        : 0,

      sale_channel:       formData.get('sale_channel')       || 'whatsapp',
      notes:              formData.get('notes')              || null,
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/deals')
}

// ─── Update Deal Status Only ──────────────────────────────────────────────────
export async function updateDealStatus(id: string, status: DealStatus) {
  const extra: Record<string, string> = {}

  if (status === 'deposit_paid')     extra.deposit_paid_at   = new Date().toISOString()
  if (status === 'shipping')         extra.shipped_at        = new Date().toISOString()
  if (status === 'arrived_egypt')    extra.arrived_egypt_at  = new Date().toISOString()
  if (status === 'delivered')        extra.delivered_at      = new Date().toISOString()
  if (status === 'completed')        extra.remaining_paid_at = new Date().toISOString()

  const { error } = await supabase
    .from('deals')
    .update({ status, ...extra })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/deals')
}

// ─── Delete Deal ──────────────────────────────────────────────────────────────
export async function deleteDeal(id: string) {
  const { error } = await supabase
    .from('deals')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/deals')
}