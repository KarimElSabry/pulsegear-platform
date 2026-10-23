// src/lib/variant-images.ts
// Which photos to show for the chosen color.

export type PhotoLite = { image_url: string; is_primary: boolean; display_order: number; variant_id?: number | null }

/**
 * No colors on the product: every photo, as before.
 * With colors: the photos tagged with the chosen color and the shared ones (no color tag).
 * If the chosen color has no photo of its own, the shared ones (or all, if none are shared) are shown
 * so the gallery is never empty.
 */
export function imagesForVariant<T extends PhotoLite>(images: T[], variantId: number | null, hasColors: boolean): T[] {
  const ordered = [...images].sort((a, b) => a.display_order - b.display_order)
  if (!hasColors) return ordered
  const own = ordered.filter((i) => i.variant_id != null && i.variant_id === variantId)
  const shared = ordered.filter((i) => i.variant_id == null)
  if (own.length > 0) return [...own, ...shared]
  return shared.length > 0 ? shared : ordered
}
