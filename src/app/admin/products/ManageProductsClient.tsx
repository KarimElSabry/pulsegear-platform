'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Product } from '@/types/product'
import { deleteProduct, updateProductStatus } from '@/app/admin/actions'

interface Props {
  products: Product[]
}

export default function ManageProductsClient({ products: initialProducts }: Props) {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>(initialProducts)

  const handleStatusChange = async (id: number, status: 'available' | 'sold') => {
    try {
      await updateProductStatus(id, status)
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status } : p))
      )
      router.refresh()
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      await deleteProduct(id)
      setProducts((prev) => prev.filter((p) => p.id !== id))
      router.refresh()
    } catch (error) {
      console.error('Failed to delete product:', error)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Products Management</h1>

      {products.length === 0 ? (
        <p className="text-gray-500">No products added</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-200 p-3 text-left">Product</th>
                <th className="border border-gray-200 p-3 text-left">Status</th>
                <th className="border border-gray-200 p-3 text-left">Price</th>
                <th className="border border-gray-200 p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 p-3">{product.title}</td>
                  <td className="border border-gray-200 p-3">
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        product.status === 'available'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {product.status === 'available' ? 'Available' : 'Sold'}
                    </span>
                  </td>
                  <td className="border border-gray-200 p-3">{product.price_egp} EGP</td>
                  <td className="border border-gray-200 p-3">
                    <div className="flex gap-2">
                      {product.status === 'available' ? (
                        <button
                          onClick={() => handleStatusChange(product.id!, 'sold')}
                          className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                        >
                          Mark as Sold
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(product.id!, 'available')}
                          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                        >
                          Mark as Available
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(product.id!)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}