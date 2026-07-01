import { useState, useEffect } from 'react'

export function useLikes(productId: number) {
  const [likes, setLikes] = useState(0)
  const [loading, setLoading] = useState(true)

  const storageKey = `liked_product_${productId}`
  const [liked, setLiked] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(storageKey) === 'true'
  })

  // ✅ Polling كل 10 ثواني
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
      }
    }

    fetchLikes() // ← أول fetch فوراً
    const interval = setInterval(fetchLikes, 10000) // ← كل 10 ثواني

    return () => clearInterval(interval) // ← cleanup عند unmount
  }, [productId])

  const addLike = async () => {
    if (liked) return
    setLiked(true)
    setLikes((prev) => prev + 1)
    localStorage.setItem(storageKey, 'true')

    await fetch('/api/products/likes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId }),
    })
  }

  return { likes, loading, addLike, liked }
}