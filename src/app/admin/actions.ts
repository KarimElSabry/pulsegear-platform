'use server'

import { ProductService } from '@/services/productService'
import { revalidatePath } from 'next/cache'

export async function addProduct(formData: FormData) {
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const price_egp = parseInt(formData.get('price') as string)
  const brand = formData.get('brand') as string
  const category = formData.get('category') as string
  const source_url = formData.get('source_url') as string
  const imagesRaw = formData.get('images') as string

  const conditionRaw = formData.get('condition') as string

  const conditionMap: Record<string, 'New with tags' | 'New without tags' | 'Very good' | 'Good' | 'Satisfactory'> = {
    'new_with_tags': 'New with tags',
    'new_without_tags': 'New without tags',
    'very_good': 'Very good',
    'good': 'Good',
    'satisfactory': 'Satisfactory',
    'New with tags': 'New with tags',
    'New without tags': 'New without tags',
    'Very good': 'Very good',
    'Good': 'Good',
    'Satisfactory': 'Satisfactory',
  }

  const condition = conditionMap[conditionRaw] ?? conditionRaw as 'New with tags' | 'New without tags' | 'Very good' | 'Good' | 'Satisfactory'

  const imageUrls = imagesRaw
    ? imagesRaw.split('\n').map((url) => url.trim()).filter((url) => url.length > 0)
    : []

  try {
    const result = await ProductService.createProduct(
      {
        title,
        description,
        price_egp,
        brand,
        condition,
        category,
        source_url,
        source: 'manual',
        status: 'available',
        slug: '',
        featured: false,
      },
      imageUrls
    )

    if (!result) {
      throw new Error('Failed to create product')
    }

    revalidatePath('/admin')
    revalidatePath('/products')

  } catch (err: any) {
    console.error('❌ Supabase Error:', JSON.stringify(err, null, 2))
    throw err
  }
}

export async function deleteProduct(id: number): Promise<void> {
  // 🔍 Debugging - هنشيلهم بعدين
  console.log('🔑 Service Key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
  console.log('🔑 Service Key prefix:', process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 20))

  try {
    await ProductService.deleteProduct(id)

    revalidatePath('/', 'layout')
    revalidatePath('/products')
    revalidatePath('/admin')

  } catch (err: any) {
    console.error('❌ Delete Error:', err.message)
    throw err
  }
}

export async function updateProductStatus(
  id: number,
  status: 'available' | 'sold'
): Promise<void> {
  try {
    await ProductService.updateStatus(id, status)

    revalidatePath('/', 'layout')
    revalidatePath('/products')
    revalidatePath('/admin')

  } catch (err: any) {
    console.error('❌ Update Status Error:', err.message)
    throw err
  }
}