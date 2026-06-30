import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '@/services/productService'
import { revalidatePath } from 'next/cache'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ← غيّرنا هنا
) {
  try {
    const { id: rawId } = await params // ← وهنا
    const id = parseInt(rawId)
    const { status } = await req.json()

    await ProductService.updateStatus(id, status)

    revalidatePath('/', 'layout')
    revalidatePath('/products')
    revalidatePath('/admin')

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}