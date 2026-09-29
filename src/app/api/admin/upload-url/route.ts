// src/app/api/admin/upload-url/route.ts
// Admin only. Issues a short-lived signed upload token for the `product-images`
// bucket so the browser can upload a photo directly to Supabase Storage WITHOUT
// the bucket allowing anonymous writes. Lets us drop the public INSERT/UPDATE/
// DELETE storage policies (see supabase/migrations/..._02_lock_down_access.sql).

import { randomUUID } from 'crypto'
import { NextResponse, type NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { createAdminSupabaseClient } from '@/lib/supabase'

const BUCKET = 'product-images'
const ALLOWED: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
}

export async function POST(req: NextRequest) {
  const denied = requireAdmin(req)
  if (denied) return denied

  let body: { filename?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const name = typeof body.filename === 'string' ? body.filename : ''
  const ext = name.includes('.') ? name.split('.').pop()!.toLowerCase() : ''
  if (!ALLOWED[ext]) {
    return NextResponse.json(
      { error: `Unsupported file type. Allowed: ${Object.keys(ALLOWED).join(', ')}` },
      { status: 400 }
    )
  }

  const path = `${Date.now()}-${randomUUID()}.${ext}`
  const supabase = createAdminSupabaseClient()

  const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path)
  if (error || !data) {
    console.error('[admin/upload-url] error:', error?.message)
    return NextResponse.json({ error: 'Could not create upload URL' }, { status: 500 })
  }

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path)

  return NextResponse.json({
    path: data.path,
    token: data.token,
    contentType: ALLOWED[ext],
    publicUrl: pub.publicUrl,
  })
}
