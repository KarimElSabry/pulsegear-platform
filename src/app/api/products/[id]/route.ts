import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('products')
      .update(body)
      .eq('id', Number(id))
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('[PATCH /api/products/:id]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}