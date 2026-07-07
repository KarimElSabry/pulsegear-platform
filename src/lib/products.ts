// src/lib/products.ts

import { createServerClient } from './supabase'
import { Product, ProductImage } from '../types/product'

export const ProductService = {

  // ✅ جيب كل المنتجات
  async getAll(): Promise<Product[]> {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('products')
      .select(`*, images:product_images(*)`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // ✅ جيب منتجات بفلتر 🆕
  async getProducts(filters?: { status?: 'available' | 'sold' | 'reserved' }): Promise<Product[]> {
    const supabase = createServerClient()

    let query = supabase
      .from('products')
      .select(`*, images:product_images(*)`)
      .order('sold_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  },

  // ✅ جيب منتج واحد بالـ slug
  async getBySlug(slug: string): Promise<Product | null> {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('products')
      .select(`*, images:product_images(*)`)
      .eq('slug', slug)
      .single()

    if (error) return null
    return data
  },

  // ✅ أضف منتج جديد
  async create(product: Omit<Product, 'id' | 'created_at'>, imageUrls: string[]): Promise<Product> {
    const supabase = createServerClient()

    // 1️⃣ اعمل الـ slug
    const slug = product.slug || slugify(product.title)

    // 2️⃣ احفظ المنتج
    const { data, error } = await supabase
      .from('products')
      .insert({ ...product, slug })
      .select()
      .single()

    if (error) {
      console.error('❌ INSERT ERROR:', JSON.stringify(error, null, 2))
      throw error
    }

    // 3️⃣ احفظ الصور
    if (imageUrls.length > 0) {
      const images: Omit<ProductImage, 'id'>[] = imageUrls.map((url, index) => ({
        product_id: data.id,
        image_url: url,
        is_primary: index === 0,
        display_order: index,
      }))

      const { error: imgError } = await supabase
        .from('product_images')
        .insert(images)

      if (imgError) {
        console.error('❌ IMAGE INSERT ERROR:', JSON.stringify(imgError, null, 2))
        throw imgError
      }
    }

    return data
  },

  // ✅ غير status المنتج
  async updateStatus(id: number, status: 'available' | 'sold' | 'reserved'): Promise<void> {
    const supabase = createServerClient()
    const { error } = await supabase
      .from('products')
      .update({ status })
      .eq('id', id)

    if (error) throw error
  },

  // ✅ احذف منتج
  async delete(id: number): Promise<void> {
    const supabase = createServerClient()
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}

// ✅ Helper - عمل slug من الـ title
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}