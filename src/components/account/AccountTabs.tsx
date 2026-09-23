// src/components/account/AccountTabs.tsx

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { label: 'Profile', href: '/account/settings', icon: '👤' },
  { label: 'Wishlist', href: '/account/wishlist', icon: '❤️' },
  { label: 'Reservations', href: '/account/reservations', icon: '📦' },
  { label: 'Product Requests', href: '/account/requests', icon: '📝' },
]

export default function AccountTabs() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/account/settings') {
      return pathname === '/account' || pathname === '/account/settings'
    }

    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-3">
        {tabs.map((tab) => {
          const active = isActive(tab.href)

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                active
                  ? 'border-red-500 bg-red-500 text-white'
                  : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <span aria-hidden="true">{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}