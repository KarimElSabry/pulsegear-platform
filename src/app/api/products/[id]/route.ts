import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '@/services/productService'
import { revalidatePath } from 'next/cache'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params
    const id = parseInt(rawId)
    await ProductService.deleteProduct(id)

    revalidatePath('/', 'layout')
    revalidatePath('/products')
    revalidatePath('/admin')

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}