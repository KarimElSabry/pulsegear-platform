'use client'

import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

export function useLikes(productId: number) {
  const [likes, setLikes] = useState(0)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)

  const storageKey = `liked_product_${productId}`
  const userKey = 'user_identifier'

  const getUserIdentifier = () => {
    if (typeof window === 'undefined') return ''
    let id = localStorage.getItem(userKey)
    if (!id) {
      id = uuidv4()
      localStorage.setItem(userKey, id)
    }
    return id
  }

  // ✅ Read localStorage after component mounts
  useEffect(() => {
    const value = localStorage.getItem(storageKey)
    setLiked(value === 'true')
  }, [storageKey])

  // ✅ Polling every 10 seconds
  useEffect(() => {
    if (!productId) return

    const fetchLikes = async () => {
      try {
        const res = await fetch(`/api/products/likes?product_id=${productId}`)
        const data = await res.json()
        setLikes(data.likes)
        setLoading(false)
      } catch (err) {
        console.error('Failed to fetch likes:', err)
        setLoading(false)
      }
    }

    fetchLikes()
    const interval = setInterval(fetchLikes, 10000)
    return () => clearInterval(interval)
  }, [productId])

  const addLike = async () => {
    if (liked) return

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

      if (data.likes !== undefined) {
        setLikes(data.likes)
      }
    } catch (err) {
      console.error('Failed to add like:', err)
      setLiked(false)
      setLikes((prev) => prev - 1)
      localStorage.removeItem(storageKey)
    }
  }

  return { likes, loading, addLike, liked }
}