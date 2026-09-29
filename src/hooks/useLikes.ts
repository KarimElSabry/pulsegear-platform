// src/hooks/useLikes.ts
//
// Like counts are cached for a minute, shared by all cards, and no longer refetched on every
// window focus. Cards that mount in the same moment are collected and fetched together.

'use client'

import { useCallback, useEffect, useSyncExternalStore } from 'react'
import { v4 as uuidv4 } from 'uuid'

const TTL_MS = 60_000
const counts = new Map<number, number>()
const fetchedAt = new Map<number, number>()
const listeners = new Map<number, Set<() => void>>()
const queue = new Set<number>()
let timer: ReturnType<typeof setTimeout> | null = null

function notify(id: number) {
  listeners.get(id)?.forEach((l) => l())
}

function setCount(id: number, n: number) {
  counts.set(id, n)
  fetchedAt.set(id, Date.now())
  notify(id)
}

// Works with either version of /api/products/likes:
//  - new route: one request for the whole page (?product_ids=1,2,3)
//  - old route (or any server that refuses the batch, e.g. HTTP 400/404/405): one request per
//    product (?product_id=1), a few at a time. Failures are silent; a card just shows 0.
let batchSupported = true
const CONCURRENCY = 6

async function fetchBatch(ids: number[]): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(`/api/products/likes?product_ids=${ids.join(',')}`, { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    return data && typeof data.likes === 'object' && data.likes !== null ? data.likes : null
  } catch {
    return null
  }
}

async function fetchOne(id: number): Promise<number | null> {
  try {
    const res = await fetch(`/api/products/likes?product_id=${id}`, { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    return typeof data?.likes === 'number' ? data.likes : null
  } catch {
    return null
  }
}

async function flush() {
  timer = null
  const ids = [...queue]
  queue.clear()
  if (ids.length === 0) return

  if (batchSupported) {
    const likes = await fetchBatch(ids)
    if (likes) {
      for (const id of ids) setCount(id, Number(likes[id] ?? 0))
      return
    }
    batchSupported = false // this server cannot do batches: use single requests from now on
  }

  let next = 0
  const workers = Array.from({ length: Math.min(CONCURRENCY, ids.length) }, async () => {
    while (next < ids.length) {
      const id = ids[next++]
      const n = await fetchOne(id)
      setCount(id, n ?? counts.get(id) ?? 0)
    }
  })
  await Promise.all(workers)
}

function request(id: number) {
  const at = fetchedAt.get(id)
  if (at && Date.now() - at < TTL_MS) return
  queue.add(id)
  if (!timer) timer = setTimeout(flush, 40)
}

// "I already liked this" lives in localStorage; this tiny store lets components re-render when it changes.
const likedListeners = new Set<() => void>()
function subscribeLiked(cb: () => void) {
  likedListeners.add(cb)
  window.addEventListener('storage', cb)
  return () => {
    likedListeners.delete(cb)
    window.removeEventListener('storage', cb)
  }
}
const notifyLiked = () => likedListeners.forEach((l) => l())

function subscribeTo(id: number, cb: () => void) {
  let set = listeners.get(id)
  if (!set) listeners.set(id, (set = new Set()))
  set.add(cb)
  return () => {
    set.delete(cb)
  }
}

export function useLikes(productId: number, productStatus?: string) {
  const valid = Number.isInteger(productId) && productId > 0
  const storageKey = `liked_product_${productId}`
  const userKey = 'user_identifier'
  const isSold = productStatus === 'sold'

  const subscribe = useCallback((cb: () => void) => subscribeTo(productId, cb), [productId])
  const count = useSyncExternalStore(
    subscribe,
    () => counts.get(productId),
    () => undefined
  )

  useEffect(() => {
    if (valid) request(productId)
  }, [valid, productId])

  const liked = useSyncExternalStore(
    subscribeLiked,
    () => localStorage.getItem(storageKey) === 'true',
    () => false
  )

  const getUserIdentifier = () => {
    let id = localStorage.getItem(userKey)
    if (!id) {
      id = uuidv4()
      localStorage.setItem(userKey, id)
    }
    return id
  }

  const addLike = async () => {
    if (liked || isSold || !valid) return

    setCount(productId, (counts.get(productId) ?? 0) + 1)
    localStorage.setItem(storageKey, 'true')
    notifyLiked()

    try {
      const res = await fetch('/api/products/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, user_identifier: getUserIdentifier() }),
      })
      const data = await res.json()

      if (res.ok || res.status === 409) {
        if (typeof data.likes === 'number') setCount(productId, data.likes)
        if (res.status === 409) {
          localStorage.setItem(storageKey, 'true')
          notifyLiked()
        }
        return
      }
      throw new Error(`HTTP ${res.status}`)
    } catch (err) {
      console.error('[useLikes] Failed to add like:', err)
      setCount(productId, Math.max(0, (counts.get(productId) ?? 1) - 1))
      localStorage.removeItem(storageKey)
      notifyLiked()
    }
  }

  const refreshLikes = useCallback(() => {
    if (!valid) return
    fetchedAt.delete(productId)
    request(productId)
  }, [valid, productId])

  return {
    likes: count ?? 0,
    loading: valid ? count === undefined : false,
    addLike,
    liked,
    isSold,
    refreshLikes,
  }
}
