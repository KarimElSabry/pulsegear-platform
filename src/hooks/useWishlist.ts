// src/hooks/useWishlist.ts

'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Product } from '@/types/product'
import { createBrowserSupabaseClient } from '@/lib/supabase'

const WISHLIST_KEY = 'pulsegear_wishlist'

function readLocalWishlist(): number[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = localStorage.getItem(WISHLIST_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id) && id > 0)
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

export function useWishlist() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])

  const [wishlistIds, setWishlistIds] = useState<number[]>([])
  const [wishlist, setWishlist] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const mergeAttemptedRef = useRef(false)

  const fetchProductsByIds = useCallback(async (ids: number[]) => {
    if (ids.length === 0) {
      setWishlist([])
      return
    }

    try {
      const params = new URLSearchParams()
      ids.forEach((id) => params.append('ids', String(id)))

      const res = await fetch(`/api/products?${params.toString()}`, {
        cache: 'no-store',
      })

      if (!res.ok) {
        setWishlist([])
        return
      }

      const data = await res.json()
      const products = Array.isArray(data) ? data : data?.data ?? []

      const ordered = ids
        .map((id) => products.find((p: Product) => Number(p.id) === id))
        .filter(Boolean)

      setWishlist(ordered)
    } catch (err) {
      console.error('Failed to fetch wishlist products:', err)
      setWishlist([])
    }
  }, [])

  const loadAuthenticatedWishlistIds = useCallback(async () => {
    const { data, error } = await supabase
      .from('wishlist_items')
      .select('product_id')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to load authenticated wishlist:', error.message)
      return []
    }

    return uniqueIds((data ?? []).map((item) => Number(item.product_id)))
  }, [supabase])

  const syncLocalWishlistToDatabase = useCallback(
    async (localIds: number[]) => {
      if (localIds.length === 0) return

      const rows = localIds.map((productId) => ({ product_id: productId }))

      const { error } = await supabase
        .from('wishlist_items')
        .upsert(rows, {
          onConflict: 'user_id,product_id',
          ignoreDuplicates: false,
        })

      if (error) {
        console.error('Failed to merge guest wishlist into database:', error.message)
      }
    },
    [supabase]
  )

  const refreshWishlist = useCallback(async () => {
    setLoading(true)

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.error('Failed to get auth user:', userError.message)
      }

      const loggedIn = !!user
      setIsAuthenticated(loggedIn)

      if (!loggedIn) {
        const localIds = uniqueIds(readLocalWishlist())
        setWishlistIds(localIds)
        await fetchProductsByIds(localIds)
        return
      }

      const localIds = uniqueIds(readLocalWishlist())
      const dbIds = await loadAuthenticatedWishlistIds()

      if (!mergeAttemptedRef.current) {
        mergeAttemptedRef.current = true

        const mergedIds = uniqueIds([...dbIds, ...localIds])

        if (localIds.length > 0) {
          await syncLocalWishlistToDatabase(localIds)
          writeLocalWishlist([])
        }

        setWishlistIds(mergedIds)
        await fetchProductsByIds(mergedIds)
        return
      }

      setWishlistIds(dbIds)
      await fetchProductsByIds(dbIds)
    } finally {
      setLoading(false)
      setAuthLoading(false)
    }
  }, [supabase, fetchProductsByIds, loadAuthenticatedWishlistIds, syncLocalWishlistToDatabase])

  useEffect(() => {
    refreshWishlist()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      mergeAttemptedRef.current = false
      refreshWishlist()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, refreshWishlist])

  useEffect(() => {
    if (authLoading) return
    if (isAuthenticated) return

    writeLocalWishlist(wishlistIds)
  }, [wishlistIds, authLoading, isAuthenticated])

  const isLoved = useCallback(
    (id: number) => {
      return wishlistIds.includes(id)
    },
    [wishlistIds]
  )

  const toggleLove = useCallback(
    async (product: Product) => {
      const productId = Number(product.id)
      if (!Number.isInteger(productId) || productId <= 0) return

      const currentlyLoved = wishlistIds.includes(productId)

      if (!isAuthenticated) {
        setWishlistIds((prev) =>
          currentlyLoved ? prev.filter((id) => id !== productId) : uniqueIds([...prev, productId])
        )
        return
      }

      const previousIds = wishlistIds

      const optimisticIds = currentlyLoved
        ? previousIds.filter((id) => id !== productId)
        : uniqueIds([...previousIds, productId])

      setWishlistIds(optimisticIds)
      await fetchProductsByIds(optimisticIds)

      try {
        if (currentlyLoved) {
          const { error } = await supabase
            .from('wishlist_items')
            .delete()
            .eq('product_id', productId)

          if (error) throw error
        } else {
          const { error } = await supabase
            .from('wishlist_items')
            .upsert(
              [{ product_id: productId }],
              { onConflict: 'user_id,product_id', ignoreDuplicates: false }
            )

          if (error) throw error
        }
      } catch (err) {
        console.error('Failed to update wishlist:', err)
        setWishlistIds(previousIds)
        await fetchProductsByIds(previousIds)
      }
    },
    [wishlistIds, isAuthenticated, supabase, fetchProductsByIds]
  )

  return {
    wishlist,
    wishlistIds,
    isLoved,
    toggleLove,
    loading,
    isAuthenticated,
    refreshWishlist,
  }
}