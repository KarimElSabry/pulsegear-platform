// src/app/api/products/[id]/status/route.ts
// ✅ نسخة واحدة نظيفة — status فقط

import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '@/services/productService'
import { revalidatePath } from 'next/cache'

const VALID_STATUSES = ['available', 'sold', 'reserved', 'out_of_stock'] as const
type ValidStatus = typeof VALID_STATUSES[number]

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params
    const id = parseInt(rawId)

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }

    const { status } = await req.json()

    // ✅ Bug 4 Fixed: أضفنا out_of_stock للـ validation
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }

    await ProductService.updateStatus(id, status as ValidStatus)

    revalidatePath('/', 'layout')
    revalidatePath('/products')
    revalidatePath('/sold')
    revalidatePath(`/products/${rawId}`)
    revalidatePath('/admin')
    revalidatePath('/admin/products')

    return NextResponse.json({ success: true, status })
  } catch (error: any) {
    console.error('[PATCH /api/products/:id/status]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}