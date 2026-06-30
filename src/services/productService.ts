import { createServerClient } from '@/lib/supabase'
import type {
  Product,
  ProductFilters,
  PaginatedProducts
} from '@/types/product'

export class ProductService {
  private static getClient() {
    return createServerClient()
  }

  // ✅ Fetch All Products
  static async getProducts(filters?: ProductFilters): Promise<Product[]> {
    const supabase = this.getClient()

    let query = supabase
      .from('products')
      .select(`
        *,
        images:product_images(*)
      `)
      .order('created_at', { ascending: false })

    if (filters?.brand) {
      query = query.ilike('brand', filters.brand)
    }

    if (filters?.category) {
      query = query.ilike('category', filters.category)
    }

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.featured !== undefined) {
      query = query.eq('featured', filters.featured)
    }

    if (filters?.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      )
    }

    const { data, error } = await query

    if (error) {
      console.error('[ProductService] getProducts error:', error.message)
      return []
    }

    return data as Product[]
  }

  // ✅ Fetch Single Product by Slug
  static async getProductBySlug(slug: string): Promise<Product | null> {
    const supabase = this.getClient()

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        images:product_images(*)
      `)
      .eq('slug', slug)
      .single()

    if (error) {
      console.error('[ProductService] getProductBySlug error:', error.message)
      return null
    }

    return data as Product
  }

  // ✅ Featured Products
  static async getFeaturedProducts(): Promise<Product[]> {
    return this.getProducts({ featured: true, status: 'available' })
  }

  // ✅ Filter by Brand
  static async getProductsByBrand(brand: string): Promise<Product[]> {
    return this.getProducts({ brand, status: 'available' })
  }

  // ✅ Filter by Category
  static async getProductsByCategory(category: string): Promise<Product[]> {
    return this.getProducts({ category, status: 'available' })
  }

  // ✅ Search
  static async searchProducts(query: string): Promise<Product[]> {
    return this.getProducts({ search: query, status: 'available' })
  }

  // ✅ Get All Brands
  static async getBrands(): Promise<string[]> {
    const supabase = this.getClient()

    const { data, error } = await supabase
      .from('products')
      .select('brand')
      .not('brand', 'is', null)

    if (error) {
      console.error('[ProductService] getBrands error:', error.message)
      return []
    }

    const brands = [...new Set(data.map((p) => p.brand as string))]
    return brands.sort()
  }

  // ✅ Get All Categories
  static async getCategories(): Promise<string[]> {
    const supabase = this.getClient()

    const { data, error } = await supabase
      .from('products')
      .select('category')
      .not('category', 'is', null)

    if (error) {
      console.error('[ProductService] getCategories error:', error.message)
      return []
    }

    const categories = [...new Set(data.map((p) => p.category as string))]
    return categories.sort()
  }

  // ✅ Paginated Products
  static async getPaginatedProducts(
    filters?: ProductFilters
  ): Promise<PaginatedProducts> {
    const supabase = this.getClient()
    const page = filters?.page ?? 1
    const limit = filters?.limit ?? 12
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
      .from('products')
      .select(`
        *,
        images:product_images(*),
        count()
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (filters?.brand) query = query.ilike('brand', filters.brand)
    if (filters?.category) query = query.ilike('category', filters.category)
    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.featured !== undefined)
      query = query.eq('featured', filters.featured)
    if (filters?.search)
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      )

    const { data, error, count } = await query

    if (error) {
      console.error('[ProductService] getPaginatedProducts error:', error.message)
      return { data: [], total: 0, page, limit, hasMore: false }
    }

    const total = count ?? 0

    return {
      data: data as Product[],
      total,
      page,
      limit,
      hasMore: to < total - 1
    }
  }

  // ✅ Create Product
  static async createProduct(
    product: Omit<Product, 'id' | 'created_at'>,
    imageUrls: string[]
  ): Promise<Product | null> {
    const supabase = this.getClient()

    // ✅ Generate unique slug
    const slug = await generateUniqueSlug(supabase, product.title)

    const { data, error } = await supabase
      .from('products')
      .insert({ ...product, slug })
      .select()
      .single()

    if (error) {
      console.error('❌ INSERT ERROR CODE:', error.code)
      console.error('❌ INSERT ERROR MSG:', error.message)
      console.error('❌ INSERT ERROR DETAILS:', error.details)
      console.error('❌ INSERT ERROR HINT:', error.hint)
      throw error
    }

    if (imageUrls.length > 0) {
      const images = imageUrls.map((url, index) => ({
        product_id: data.id,
        image_url: url,
        is_primary: index === 0,
        display_order: index,
      }))

      const { error: imgError } = await supabase
        .from('product_images')
        .insert(images)

      if (imgError) {
        console.error('❌ IMAGE INSERT ERROR CODE:', imgError.code)
        console.error('❌ IMAGE INSERT ERROR MSG:', imgError.message)
        console.error('❌ IMAGE INSERT ERROR DETAILS:', imgError.details)
        console.error('❌ IMAGE INSERT ERROR HINT:', imgError.hint)
        throw imgError
      }
    }

    return data as Product
  }

  // ✅ Update Status
  static async updateStatus(
    id: number,
    status: 'available' | 'sold'
  ): Promise<void> {
    const supabase = this.getClient()
    const { error } = await supabase
      .from('products')
      .update({ status, sold_at: status === 'sold' ? new Date().toISOString() : null, })
      .eq('id', id)

    if (error) {
      console.error('[ProductService] updateStatus error:', error.message)
      throw error
    }
  }

  // ✅ Delete Product
  static async deleteProduct(id: number): Promise<void> {
    const supabase = this.getClient()
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[ProductService] deleteProduct error:', error.message)
      throw error
    }
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// ✅ Slugify
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}

// ✅ Generate Unique Slug - بيتحقق من الـ DB ولو في تكرار بيضيف رقم
async function generateUniqueSlug(supabase: any, title: string): Promise<string> {
  const baseSlug = slugify(title)

  const { data } = await supabase
    .from('products')
    .select('slug')
    .ilike('slug', `${baseSlug}%`)

  if (!data || data.length === 0) {
    return baseSlug // ✅ مفيش تكرار
  }

  const existingSlugs = data.map((p: any) => p.slug)

  // ✅ لو الـ baseSlug نفسه مش موجود، رجعه
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug
  }

  // ✅ ابحث عن أول رقم متاح
  let counter = 1
  let newSlug = `${baseSlug}-${counter}`

  while (existingSlugs.includes(newSlug)) {
    counter++
    newSlug = `${baseSlug}-${counter}`
  }

  return newSlug
}