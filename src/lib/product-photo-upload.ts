// src/lib/product-photo-upload.ts
// Upload a photo from the admin's computer to the `product-images` bucket (browser side).
// The server (admin only) hands out a one-time upload token, the browser sends the file straight to Supabase Storage.

export const PHOTO_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'avif'] as const
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024

/** A message if the file cannot be uploaded, otherwise null. */
export function checkPhotoFile(file: { name: string; size: number }): string | null {
  const ext = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : ''
  if (!(PHOTO_EXTENSIONS as readonly string[]).includes(ext)) {
    return `"${file.name}": only ${PHOTO_EXTENSIONS.join(', ')} photos are supported (iPhone HEIC photos: export as JPG first).`
  }
  if (file.size > MAX_PHOTO_BYTES) return `"${file.name}" is bigger than 10 MB. Make it smaller and try again.`
  return null
}

type StorageClient = {
  storage: { from: (bucket: string) => { uploadToSignedUrl: (path: string, token: string, file: File, opts: { contentType: string }) => Promise<{ error: { message: string } | null }> } }
}

export async function uploadProductPhoto(storage: StorageClient, file: File): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
  const bad = checkPhotoFile(file)
  if (bad) return { ok: false, message: bad }
  try {
    const sign = await fetch('/api/admin/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name }),
    })
    if (!sign.ok) {
      const body = await sign.json().catch(() => null)
      return { ok: false, message: `"${file.name}": ${body?.error ?? 'could not start the upload'}` }
    }
    const { path, token, contentType, publicUrl } = await sign.json()
    const { error } = await storage.storage.from('product-images').uploadToSignedUrl(path, token, file, { contentType })
    if (error) return { ok: false, message: `"${file.name}": ${error.message}` }
    if (!publicUrl) return { ok: false, message: `"${file.name}": the upload worked but no link came back` }
    return { ok: true, url: publicUrl }
  } catch (e) {
    return { ok: false, message: `"${file.name}": ${e instanceof Error ? e.message : 'upload failed'}` }
  }
}
