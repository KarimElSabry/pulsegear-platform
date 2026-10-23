// src/components/cart/CartLink.tsx

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/components/cart/CartProvider'

/** The cart icon with the number of items, shown in the header on phone and desktop. */
export default function CartLink() {
  const { count, ready } = useCart()
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) return null
  return (
    <Link
      href="/cart"
      data-tour="cart"
      aria-label={count > 0 ? `Cart, ${count} item${count === 1 ? '' : 's'}` : 'Cart'}
      className="relative flex shrink-0 items-center rounded-full p-2 text-white transition hover:bg-zinc-800"
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.76L20 8H6.2" />
        <circle cx="9.5" cy="20" r="1.3" />
        <circle cx="17" cy="20" r="1.3" />
      </svg>
      {ready && count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  )
}
