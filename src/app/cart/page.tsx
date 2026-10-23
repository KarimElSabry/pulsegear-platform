// src/app/cart/page.tsx

import type { Metadata } from 'next'
import CartClient from './CartClient'

export const metadata: Metadata = { title: 'Your cart | Pulse Gear Egypt', robots: { index: false } }

export default function CartPage() {
  return (
    <div className="container-x py-10 md:py-14">
      <h1 className="text-3xl font-black uppercase tracking-tight text-white md:text-4xl">Your cart</h1>
      <CartClient />
    </div>
  )
}
