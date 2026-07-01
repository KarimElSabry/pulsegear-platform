import { useState, useEffect } from 'react'

export function useLikes(productId: number) {
  const [likes, setLikes] = useState(0)
  const [loading, setLoading] = useState(true)

  // ✅ جيب الـ liked من localStorage عشان يفضل بعد الـ Refresh
  const storageKey = `liked_product_${productId}`
  const [liked, setLiked] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(storageKey) === 'true'
  })

  useEffect(() => {
    if (!productId) return
    fetch(`/api/likes?product_id=${productId}`)
      .then((res) => res.json())
      .then((data) => {
        setLikes(data.likes)
        setLoading(false)
      })
  }, [productId])

  const addLike = async () => {
    if (liked) return
    setLiked(true)
    setLikes((prev) => prev + 1)

    // ✅ احفظ في localStorage عشان يفضل بعد الـ Refresh
    localStorage.setItem(storageKey, 'true')

    await fetch('/api/likes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId }),
    })
  }

  return { likes, loading, addLike, liked }
}