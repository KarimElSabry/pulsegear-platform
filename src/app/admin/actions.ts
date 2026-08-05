// src/app/admin/actions.ts

'use server'

import { revalidatePath } from 'next/cache'
import { ProductService } from '@/services/productService'
import { createClient } from '@supabase/supabase-js'
import type { ProductCondition, ProductStatus } from '@/types/product'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface SyncResult {
  checked: number
  sold: number
  errors: number
  results: Array<{
    id: number
    title: string
    sold: boolean
    priceChanged: boolean
    newPrice: number | null
    error?: string
  }>
}

export async function deleteProduct(id: number): Promise<void> {
  await ProductService.deleteProduct(id)
  revalidatePath('/admin/products')
}

export async function updateProductStatus(
  id: number,
  status: ProductStatus
): Promise<void> {
  await ProductService.updateStatus(id, status)
  revalidatePath('/admin/products')
  revalidatePath('/products')
  revalidatePath('/sold')
  revalidatePath(`/products/${id}`)
  revalidatePath('/', 'layout')
}

export async function triggerVintedSync(): Promise<SyncResult> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!appUrl) throw new Error('NEXT_PUBLIC_APP_URL is not defined')

  const res = await fetch(`${appUrl}/api/check-vinted-status`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
    cache: 'no-store',
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error ?? `Request failed with status ${res.status}`)
  }

  revalidatePath('/admin/products')
  return res.json()
}

export async function addProduct(formData: FormData): Promise<void> {
  const imagesRaw = formData.get('images') as string
  const imageUrls = imagesRaw
    ? imagesRaw.split('\n').map((url) => url.trim()).filter(Boolean)
    : []

  const sourceUrl = (formData.get('source_url') as string) || undefined

  const validConditions: ProductCondition[] = [
    'New with tags',
    'New without tags',
    'Very good',
    'Good',
    'Satisfactory',
  ]

  const conditionRaw = formData.get('condition') as string
  const condition = validConditions.includes(conditionRaw as ProductCondition)
    ? (conditionRaw as ProductCondition)
    : undefined

  const isReservable = formData.get('is_reservable') === 'true'
  const vintedId     = (formData.get('vinted_id') as string) || undefined

  await ProductService.createProduct(
    {
      title:          formData.get('title') as string,
      description:    (formData.get('description') as string) || undefined,
      price_egp:      parseFloat(formData.get('price') as string),
      original_price: formData.get('original_price')
                        ? parseFloat(formData.get('original_price') as string)
                        : undefined,
      brand:          (formData.get('brand') as string) || undefined,
      size:           (formData.get('size') as string) || undefined,
      condition,
      category:       (formData.get('category') as string) || undefined,
      source:         sourceUrl?.includes('vinted') ? 'vinted' : 'manual',
      source_url:     sourceUrl,
      status:         'available',
      is_reservable:  isReservable,
      vinted_id:      vintedId,
    },
    imageUrls
  )

  revalidatePath('/admin')
  revalidatePath('/admin/products')
}

// ─── ✅ Add Sale ──────────────────────────────────────────────────────────────

export async function addSale(formData: FormData): Promise<void> {
  const originalEur    = parseFloat(formData.get('original_eur')     as string)
  const shippingEur    = parseFloat(formData.get('shipping_eur')      as string) || 0
  const exchangeRate   = parseFloat(formData.get('exchange_rate')     as string)
  const sellingPrice   = parseFloat(formData.get('selling_price_egp') as string)

  const costEgp         = (originalEur + shippingEur) * exchangeRate
  const profitEgp       = sellingPrice - costEgp
  const profitMarginPct = costEgp > 0 ? (profitEgp / costEgp) * 100 : 0

  const { error } = await supabase.from('sales').insert({
    product_name:      formData.get('product_name'),
    original_eur:      originalEur,
    shipping_eur:      shippingEur,
    exchange_rate:     exchangeRate,
    cost_egp:          Math.round(costEgp         * 100) / 100,
    selling_price_egp: sellingPrice,
    profit_egp:        Math.round(profitEgp       * 100) / 100,
    profit_margin_pct: Math.round(profitMarginPct * 100) / 100,
    sale_channel:      formData.get('sale_channel'),
    sale_date:         formData.get('sale_date'),
    notes:             formData.get('notes') || null,
  })

  if (error) throw new Error(error.message)

  revalidatePath('/admin')
  revalidatePath('/admin/analytics')
  revalidatePath('/admin/sales')
}