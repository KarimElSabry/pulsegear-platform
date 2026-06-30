import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '@/services/productService'
import { revalidatePath } from 'next/cache'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    await ProductService.deleteProduct(id)

    // ✅ الحل هنا
    revalidatePath('/', 'layout')
    revalidatePath('/products')
    revalidatePath('/admin')

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}