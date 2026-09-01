// src/app/api/products/[id]/images/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

// ── GET — fetch images for a product ─────────────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', Number(id))
    .order('display_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// ── POST — add new image ──────────────────────────────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { image_url } = await req.json()
  const supabase = createServerClient()

  if (!image_url) {
    return NextResponse.json({ error: 'image_url is required' }, { status: 400 })
  }

  // Get current max display_order
  const { data: existing } = await supabase
    .from('product_images')
    .select('display_order')
    .eq('product_id', Number(id))
    .order('display_order', { ascending: false })
    .limit(1)

  const nextOrder = existing && existing.length > 0
    ? (existing[0].display_order + 1)
    : 0

  // Check if this is the first image — make it primary
  const { count } = await supabase
    .from('product_images')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', Number(id))

  const { data, error } = await supabase
    .from('product_images')
    .insert({
      product_id:    Number(id),
      image_url,
      is_primary:    (count ?? 0) === 0,
      display_order: nextOrder,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath(`/products/${id}`)
  revalidatePath('/admin/products')
  return NextResponse.json(data, { status: 201 })
}

// ── PATCH — update images (reorder + set primary) ─────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { images } = await req.json()
  // images = [{ id, display_order, is_primary }]
  const supabase = createServerClient()

  const updates = images.map((img: { id: number; display_order: number; is_primary: boolean }) =>
    supabase
      .from('product_images')
      .update({ display_order: img.display_order, is_primary: img.is_primary })
      .eq('id', img.id)
      .eq('product_id', Number(id))
  )

  await Promise.all(updates)

  revalidatePath(`/products/${id}`)
  revalidatePath('/admin/products')
  return NextResponse.json({ success: true })
}

// ── DELETE — remove image ─────────────────────────────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { image_id } = await req.json()
  const supabase = createServerClient()

  // Check if deleting the primary image
  const { data: img } = await supabase
    .from('product_images')
    .select('is_primary')
    .eq('id', image_id)
    .single()

  const { error } = await supabase
    .from('product_images')
    .delete()
    .eq('id', image_id)
    .eq('product_id', Number(id))

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // If deleted image was primary — promote next image
  if (img?.is_primary) {
    const { data: remaining } = await supabase
      .from('product_images')
      .select('id')
      .eq('product_id', Number(id))
      .order('display_order', { ascending: true })
      .limit(1)

    if (remaining && remaining.length > 0) {
      await supabase
        .from('product_images')
        .update({ is_primary: true })
        .eq('id', remaining[0].id)
    }
  }

  revalidatePath(`/products/${id}`)
  revalidatePath('/admin/products')
  return NextResponse.json({ success: true })
}