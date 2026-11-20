// src/lib/variant-images.ts
// Which photos to show for the chosen color.

export type PhotoLite = { image_url: string; is_primary: boolean; display_order: number; variant_id?: number | null }

/**
 * No colors on the product: every photo, as before.
 * With colors: the photos tagged with the chosen color and the shared ones (no color tag).
 * Pass several ids when one color comes in several sizes: a photo tagged with any of them belongs to that color.
 * If the chosen color has no photo of its own, the shared ones (or all, if none are shared) are shown
 * so the gallery is never empty.
 */
export function imagesForVariant<T extends PhotoLite>(images: T[], variantId: number | number[] | null, hasColors: boolean): T[] {
  const ordered = [...images].sort((a, b) => a.display_order - b.display_order)
  if (!hasColors) return ordered
  const ids = Array.isArray(variantId) ? variantId : variantId === null ? [] : [variantId]
  const own = ordered.filter((i) => i.variant_id != null && ids.includes(i.variant_id))
  const shared = ordered.filter((i) => i.variant_id == null)
  if (own.length > 0) return [...own, ...shared]
  return shared.length > 0 ? shared : ordered
}

type OptionLite = { id: number; name: string; size_name?: string | null }

/**
 * The ids of the options that share the photos of the selected one.
 * A color that comes in several sizes shares its photos between those sizes.
 * An option without a color name (only a size, e.g. "42mm") is its own group: it must not
 * share photos with the other size-only options.
 */
export function sameColorIds(variants: OptionLite[], selected: OptionLite | null | undefined): number[] | null {
  if (!selected) return null
  const name = selected.name.trim().toLowerCase()
  if (!name) return [selected.id]
  return variants.filter((v) => v.name.trim().toLowerCase() === name).map((v) => v.id)
}

export type PhotoGroup = { id: number; label: string; ids: number[] }

/**
 * What you can pick under a photo in the admin: one entry per color (with its sizes written next to it),
 * and one entry per size-only option. `id` is the option a photo is tagged with.
 */
export function photoGroups(variants: OptionLite[]): PhotoGroup[] {
  const groups: PhotoGroup[] = []
  const byName = new Map<string, PhotoGroup & { sizes: string[]; name: string }>()
  for (const v of variants) {
    const name = v.name.trim()
    const size = (v.size_name ?? '').trim()
    if (!name) {
      groups.push({ id: v.id, label: size || `Option ${v.id}`, ids: [v.id] })
      continue
    }
    const key = name.toLowerCase()
    let g = byName.get(key)
    if (!g) {
      g = { id: v.id, label: name, ids: [], sizes: [], name }
      byName.set(key, g)
      groups.push(g)
    }
    g.ids.push(v.id)
    if (size && !g.sizes.includes(size)) g.sizes.push(size)
    g.label = g.sizes.length ? `${g.name} (${g.sizes.join(', ')})` : g.name
  }
  return groups.map(({ id, label, ids }) => ({ id, label, ids }))
}
