import { ProductService } from '@/services/productService'
import type { Product } from '@/types/product'
import ManageProductsClient from './ManageProductsClient'

export default async function ManageProductsPage() {
  const products = await ProductService.getProducts()
  return <ManageProductsClient products={products} />
}