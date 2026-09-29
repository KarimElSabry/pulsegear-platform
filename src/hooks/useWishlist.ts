// src/hooks/useWishlist.ts
//
// One shared wishlist store per page. Before, every ProductCard created its own copy of this
// hook (own auth check, own wishlist fetch, own auth listener), so a page with 100 cards made
// hundreds of requests and logged "Auth session missing" once per card. Now all cards read the
// same module-level state and the work happens once.

'use client'

import { useCallback, useEffect, useSyncExternalStore } from 'react'
import type { Product } from '@/types/product'
import { createBrowserSupabaseClient } from '@/lib/supabase'

const WISHLIST_KEY = 'pulsegear_wishlist'

function readLocalWishlist(): number[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(WISHLIST_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0)
  } catch {
    return []
  }
}

function writeLocalWishlist(ids: number[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids))
}

function uniqueIds(ids: number[]) {
  return [...new Set(ids.filter((id) => Number.isInteger(id) && id > 0))]
}

/* ── Store ─────────────────────────────────────────────────── */

type State = {
  wishlistIds: number[]
  wishlist: Product[]
  loading: boolean
  authLoading: boolean
  isAuthenticated: boolean
}

const INITIAL: State = { wishlistIds: [], wishlist: [], loading: true, authLoading: true, isAuthenticated: false }
let state: State = INITIAL
const listeners = new Set<() => void>()

let client: ReturnType<typeof createBrowserSupabaseClient> | null = null
const supabase = () => (client ??= createBrowserSupabaseClient())

function setState(patch: Partial<State>) {
  state = { ...state, ...patch }
  // Guests keep their wishlist in localStorage; signed-in users keep it in the database.
  if (!state.authLoading && !state.isAuthenticated) writeLocalWishlist(state.wishlistIds)
  listeners.forEach((l) => l())
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

async function loadProducts(ids: number[]) {
  if (ids.length === 0) {
    setState({ wishlist: [] })
    return
  }
  try {
    const params = new URLSearchParams()
    ids.forEach((id) => params.append('ids', String(id)))
    const res = await fetch(`/api/products?${params.toString()}`, { cache: 'no-store' })
    if (!res.ok) {
      setState({ wishlist: [] })
      return
    }
    const data = await res.json()
    const products: Product[] = Array.isArray(data) ? data : data?.data ?? []
    const ordered = ids
      .map((id) => products.find((p) => Number(p.id) === id))
      .filter((p): p is Product => Boolean(p))
    setState({ wishlist: ordered })
  } catch (err) {
    console.error('Failed to fetch wishlist products:', err)
    setState({ wishlist: [] })
  }
}

async function loadAuthenticatedIds(): Promise<number[]> {
  const { data, error } = await supabase()
    .from('wishlist_items')
    .select('product_id')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('Failed to load authenticated wishlist:', error.message)
    return []
  }
  return uniqueIds((data ?? []).map((item) => Number(item.product_id)))
}

async function mergeGuestIntoDatabase(localIds: number[], userId: string) {
  if (localIds.length === 0) return
  const rows = localIds.map((productId) => ({ user_id: userId, product_id: productId }))
  const { error } = await supabase()
    .from('wishlist_items')
    .upsert(rows, { onConflict: 'user_id,product_id', ignoreDuplicates: false })
  if (error) console.error('Failed to merge guest wishlist into database:', error.message)
}

let mergeAttempted = false
let inflight: Promise<void> | null = null
let rerun = false

async function doRefresh() {
  setState({ loading: true })
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase().auth.getUser()

    // A visitor who is not logged in is normal, not an error.
    if (userError && userError.name !== 'AuthSessionMissingError' && !/session missing/i.test(userError.message)) {
      console.error('Failed to get auth user:', userError.message)
    }

    const localIds = uniqueIds(readLocalWishlist())

    if (!user) {
      setState({ isAuthenticated: false, wishlistIds: localIds })
      await loadProducts(localIds)
      return
    }

    setState({ isAuthenticated: true })
    const dbIds = await loadAuthenticatedIds()

    if (!mergeAttempted) {
      mergeAttempted = true
      const merged = uniqueIds([...dbIds, ...localIds])
      if (localIds.length > 0) {
        await mergeGuestIntoDatabase(localIds, user.id)
        writeLocalWishlist([])
      }
      setState({ wishlistIds: merged })
      await loadProducts(merged)
      return
    }

    setState({ wishlistIds: dbIds })
    await loadProducts(dbIds)
  } finally {
    setState({ loading: false, authLoading: false })
  }
}

/** Runs one refresh at a time; a request that arrives mid-run triggers exactly one more run. */
function refresh(): Promise<void> {
  if (inflight) {
    rerun = true
    return inflight
  }
  inflight = (async () => {
    do {
      rerun = false
      await doRefresh()
    } while (rerun)
  })().finally(() => {
    inflight = null
  })
  return inflight
}

let started = false
function start() {
  if (started || typeof window === 'undefined') return
  started = true
  void refresh()
  supabase().auth.onAuthStateChange((event) => {
    if (event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') return
    mergeAttempted = false
    void refresh()
  })
}

async function toggleLove(product: Product) {
  const productId = Number(product.id)
  if (!Number.isInteger(productId) || productId <= 0) return

  const currentlyLoved = state.wishlistIds.includes(productId)
  const previousIds = state.wishlistIds
  const nextIds = currentlyLoved ? previousIds.filter((id) => id !== productId) : uniqueIds([...previousIds, productId])

  setState({ wishlistIds: nextIds })

  if (!state.isAuthenticated) {
    await loadProducts(nextIds)
    return
  }

  await loadProducts(nextIds)

  try {
    const { data: userData } = await supabase().auth.getUser()
    const userId = userData.user?.id
    if (!userId) throw new Error('Not signed in')

    if (currentlyLoved) {
      const { error } = await supabase()
        .from('wishlist_items')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId)
      if (error) throw error
    } else {
      const { error } = await supabase()
        .from('wishlist_items')
        .upsert([{ user_id: userId, product_id: productId }], {
          onConflict: 'user_id,product_id',
          ignoreDuplicates: false,
        })
      if (error) throw error
    }
  } catch (err) {
    console.error('Failed to update wishlist:', err)
    setState({ wishlistIds: previousIds })
    await loadProducts(previousIds)
  }
}

/* ── Hook ──────────────────────────────────────────────────── */

export function useWishlist() {
  useEffect(() => {
    start()
  }, [])

  const s = useSyncExternalStore(subscribe, () => state, () => INITIAL)

  const isLoved = useCallback((id: number) => s.wishlistIds.includes(id), [s.wishlistIds])

  return {
    wishlist: s.wishlist,
    wishlistIds: s.wishlistIds,
    isLoved,
    toggleLove,
    loading: s.loading,
    isAuthenticated: s.isAuthenticated,
    refreshWishlist: refresh,
  }
}
