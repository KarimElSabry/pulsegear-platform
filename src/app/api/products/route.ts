import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '@/services/productService'

export async function GET() {
  try {
    const products = await ProductService.getProducts()
    return NextResponse.json(products)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}