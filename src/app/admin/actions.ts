// src/app/admin/actions.ts

'use server'

import { revalidatePath } from 'next/cache'
import { ProductService } from '@/services/productService'
import type { ProductCondition } from '@/types/product'

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Delete Product ───────────────────────────────────────────────────────────

export async function deleteProduct(id: number): Promise<void> {
  await ProductService.deleteProduct(id)
  revalidatePath('/admin/products')
}

// ─── Update Product Status ────────────────────────────────────────────────────

export async function updateProductStatus(
  id: number,
  status: 'available' | 'sold' | 'reserved'
): Promise<void> {
  await ProductService.updateStatus(id, status)

  // ✅ Revalidate everything that shows product status
  revalidatePath('/admin/products')
  revalidatePath('/products')
  revalidatePath('/sold')
  revalidatePath(`/products/${id}`)
  revalidatePath('/', 'layout') // ✅ يشمل كل الـ nested pages
}

// ─── Trigger Vinted Sync ──────────────────────────────────────────────────────

export async function triggerVintedSync(): Promise<SyncResult> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  if (!appUrl) {
    throw new Error('NEXT_PUBLIC_APP_URL is not defined in environment variables')
  }

  const res = await fetch(`${appUrl}/api/check-vinted-status`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.CRON_SECRET}`,
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error ?? `Request failed with status ${res.status}`)
  }

  revalidatePath('/admin/products')

  return res.json()
}

// ─── Add Product ──────────────────────────────────────────────────────────────

export async function addProduct(formData: FormData): Promise<void> {
  const imagesRaw = formData.get('images') as string
  const imageUrls = imagesRaw
    ? imagesRaw
        .split('\n')
        .map((url) => url.trim())
        .filter(Boolean)
    : []

  const sourceUrl = (formData.get('source_url') as string) || undefined

  const conditionMap: Record<string, ProductCondition> = {
    new_with_tags:    'New with tags',
    new_without_tags: 'New without tags',
    very_good:        'Very good',
    good:             'Good',
    satisfactory:     'Satisfactory',
  }

  const conditionRaw = formData.get('condition') as string
  const condition = conditionMap[conditionRaw]

  // ✅ اقرأ is_reservable من الـ form
  const isReservable = formData.get('is_reservable') === 'true'

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
      is_reservable:  isReservable,   // ✅ بيتبعت للـ DB
    },
    imageUrls
  )

  revalidatePath('/admin')
  revalidatePath('/admin/products')
}