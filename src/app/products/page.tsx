import { Suspense } from 'react'
import { ProductService } from '@/services/productService'
import ProductsContent from './ProductsContent'

// ✅ Server Component - بيجيب الـ brands على الـ server
export default async function ProductsPage() {
  const brands = await ProductService.getBrands()

  return (
    <Suspense fallback={<div className="text-white text-center py-20">Loading...</div>}>
      <ProductsContent initialBrands={brands} />
    </Suspense>
  )
}