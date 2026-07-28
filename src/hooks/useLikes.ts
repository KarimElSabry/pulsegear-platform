// src/hooks/useLikes.ts

'use client'

import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

export function useLikes(productId: number, productStatus?: string) {
  const [likes, setLikes]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked]     = useState(false)

  const storageKey = `liked_product_${productId}`
  const userKey    = 'user_identifier'
  const isSold     = productStatus === 'sold'

  const getUserIdentifier = () => {
    if (typeof window === 'undefined') return ''
    let id = localStorage.getItem(userKey)
    if (!id) {
      id = uuidv4()
      localStorage.setItem(userKey, id)
    }
    return id
  }

  useEffect(() => {
    const value = localStorage.getItem(storageKey)
    setLiked(value === 'true')
  }, [storageKey])

  useEffect(() => {
    if (!productId || isNaN(productId) || productId <= 0) {
      setLoading(false)
      return
    }

    const fetchLikes = async () => {
      try {
        const res = await fetch(`/api/products/likes?product_id=${productId}`)
        if (!res.ok) { setLoading(false); return }
        const data = await res.json()
        if (data.likes !== undefined) setLikes(data.likes)
      } catch (err) {
        console.error(`[useLikes] Failed to fetch:`, err)
      } finally {
        setLoading(false)
      }
    }

    fetchLikes()
    if (isSold) return
    const interval = setInterval(fetchLikes, 10000)
    return () => clearInterval(interval)
  }, [productId, isSold])

  const addLike = async () => {
    if (liked || isSold) return

    // ✅ Optimistic update
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

      const data = await res.json()

      if (res.ok || res.status === 409) {
        if (data.likes !== undefined) setLikes(data.likes)
        if (res.status === 409) {
          localStorage.setItem(storageKey, 'true')
        }
        return
      }

      // ❌ Rollback
      setLiked(false)
      setLikes((prev) => prev - 1)
      localStorage.removeItem(storageKey)

    } catch (err) {
      console.error(`[useLikes] Failed to add like:`, err)
      setLiked(false)
      setLikes((prev) => prev - 1)
      localStorage.removeItem(storageKey)
    }
  }

  return { likes, loading, addLike, liked, isSold }
}