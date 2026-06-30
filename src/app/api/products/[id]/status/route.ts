import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '@/services/productService'
import { revalidatePath } from 'next/cache'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params
    const id = parseInt(rawId)
    const { status } = await req.json()

    // ✅ Validate status
    if (!['available', 'sold', 'reserved'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    await ProductService.updateStatus(id, status)

    revalidatePath('/', 'layout')
    revalidatePath('/products')
    revalidatePath('/admin')

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}