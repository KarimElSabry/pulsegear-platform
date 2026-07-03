'use client'

import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

export function useLikes(productId: number, productStatus?: string) {
  const [likes, setLikes] = useState(0)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)

  const storageKey = `liked_product_${productId}`
  const userKey = 'user_identifier'

  const isSold = productStatus === 'sold'

  const getUserIdentifier = () => {
    if (typeof window === 'undefined') return ''
    let id = localStorage.getItem(userKey)
    if (!id) {
      id = uuidv4()
      localStorage.setItem(userKey, id)
    }
    return id
  }

  // ✅ Read localStorage after mount
  useEffect(() => {
    const value = localStorage.getItem(storageKey)
    setLiked(value === 'true')
  }, [storageKey])

  // ✅ Fetch likes — poll only if NOT sold
  useEffect(() => {
    // ✅ Guard 1 — productId لازم يكون number صحيح
    if (!productId || isNaN(productId) || productId <= 0) {
      setLoading(false)
      return
    }

    const fetchLikes = async () => {
      try {
        const res = await fetch(`/api/products/likes?product_id=${productId}`)

        // ✅ Guard 2 — تأكد إن الـ response JSON مش HTML
        const contentType = res.headers.get('content-type')
        if (!contentType?.includes('application/json')) {
          console.error(`[useLikes] Non-JSON response for product ${productId}`)
          setLoading(false)
          return
        }

        // ✅ Guard 3 — تأكد إن الـ response ok
        if (!res.ok) {
          console.error(`[useLikes] HTTP ${res.status} for product ${productId}`)
          setLoading(false)
          return
        }

        const data = await res.json()

        // ✅ Guard 4 — تأكد إن likes موجود في الـ response
        if (data.likes === undefined) {
          console.error(`[useLikes] No likes field in response for product ${productId}`)
          setLoading(false)
          return
        }

        setLikes(data.likes)
        setLoading(false)
      } catch (err) {
        console.error(`[useLikes] Failed to fetch likes for product ${productId}:`, err)
        setLoading(false)
      }
    }

    fetchLikes()

    // ✅ If sold — fetch once and stop, no polling needed
    if (isSold) return

    const interval = setInterval(fetchLikes, 10000)
    return () => clearInterval(interval)
  }, [productId, isSold])

  const addLike = async () => {
    if (liked) return
    if (isSold) return

    setLiked(true)
    setLikes((prev) => prev + 1)
    localStorage.setItem(storageKey, 'true')

    try {
      const res = await fetch('/api/products/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          user_identifier: getUserIdentifier(),
        }),
      })

      // ✅ Guard 2 — تأكد إن الـ response JSON مش HTML
      const contentType = res.headers.get('content-type')
      if (!contentType?.includes('application/json')) {
        console.error(`[useLikes] Non-JSON POST response for product ${productId}`)
        setLiked(false)
        setLikes((prev) => prev - 1)
        localStorage.removeItem(storageKey)
        return
      }

      const data = await res.json()

      if (data.likes !== undefined) {
        setLikes(data.likes)
      }

      // ✅ If backend rejected (403) — rollback optimistic update
      if (!res.ok) {
        setLiked(false)
        setLikes((prev) => prev - 1)
        localStorage.removeItem(storageKey)
      }

    } catch (err) {
      console.error(`[useLikes] Failed to add like for product ${productId}:`, err)
      setLiked(false)
      setLikes((prev) => prev - 1)
      localStorage.removeItem(storageKey)
    }
  }

  return { likes, loading, addLike, liked, isSold }
}