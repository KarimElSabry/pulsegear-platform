import { useEffect, useState } from 'react'

export function useLikes(productId: number) {
  const [likes, setLikes] = useState(0)
  const [loading, setLoading] = useState(true)

  // ✅ جيب الـ Likes من الـ API
  useEffect(() => {
    if (!productId) return

    fetch(`/api/likes?product_id=${productId}`)
      .then((res) => res.json())
      .then((data) => {
        setLikes(data.likes)
        setLoading(false)
      })
  }, [productId])

  // ✅ أضيف Like جديد
  const addLike = async () => {
    setLikes((prev) => prev + 1) // ✅ Optimistic Update — يتحدث فوراً
    
    await fetch('/api/likes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId }),
    })
  }

  return { likes, loading, addLike }
}