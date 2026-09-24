// src/app/admin/products/page.tsx

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ProductService } from '@/services/productService'
import ManageProductsClient from './ManageProductsClient'

export default async function ManageProductsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value

  if (token !== process.env.ADMIN_SECRET) {
    redirect('/admin-login')
  }

  const products = await ProductService.getProducts()

  return <ManageProductsClient products={products} />
}