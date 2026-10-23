// src/components/cart/TokenFinder.tsx

'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

/** The page address had no token: look for the one this browser saved when the order was placed. */
export default function TokenFinder({ code }: { code: string }) {
  const router = useRouter()
  const [missing, setMissing] = useState(false)
  useEffect(() => {
    let token: string | null = null
    try { token = localStorage.getItem(`pg_order_${code}`) } catch { /* ignore */ }
    if (token) router.replace(`/checkout/${code}?t=${token}`)
    else setMissing(true)
  }, [code, router])

  if (!missing) return <p className="text-zinc-400">Loading your order…</p>
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
      <p className="text-lg font-bold text-white">Open this page from the link you got after checkout</p>
      <p className="mt-1 text-zinc-400">Or follow your order with its ID and the last 4 digits of your phone number.</p>
      <Link href={`/track-order?code=${code}`} className="mt-4 inline-block rounded-full bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-500">Track order {code}</Link>
    </div>
  )
}
