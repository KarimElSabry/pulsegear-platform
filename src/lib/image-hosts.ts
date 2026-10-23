// src/lib/image-hosts.ts
// Product photos come from several places. Next.js can only resize photos from the hosts listed in next.config.ts
// (images.remotePatterns); any other host makes the whole page fail. So photos from our own storage and Vinted are
// resized and cached (small WebP files, little Supabase traffic), and photos from any other site are shown as they are.
// KEEP THIS LIST IN SYNC with images.remotePatterns in next.config.ts (a test checks it).

export const OPTIMIZED_HOST_SUFFIXES = ['vinted.net', 'vinted.com', 'supabase.co'] as const

export function isOptimizable(src: string | null | undefined): boolean {
  if (!src) return true
  if (src.startsWith('/')) return true // files in /public
  try {
    const host = new URL(src).hostname.toLowerCase()
    return OPTIMIZED_HOST_SUFFIXES.some((s) => host === s || host.endsWith(`.${s}`))
  } catch {
    return false
  }
}
