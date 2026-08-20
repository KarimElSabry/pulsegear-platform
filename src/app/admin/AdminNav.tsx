// src/app/admin/AdminNav.tsx

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from './LogoutButton'

const NAV_LINKS = [
  { href: '/admin',                     label: '➕ Add Product'     },
  { href: '/admin/products',            label: '📦 Manage Products' },
  { href: '/admin/reservations',        label: '📋 Reservations'    },
  { href: '/admin/discounts',           label: '🏷️ Discount Codes'  },
  { href: '/admin/analytics',           label: '📊 Analytics'       },
  { href: '/admin/analytics/traffic',   label: '🌐 Traffic'         },
  { href: '/admin/deals', label: '🤝 Deals' },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center gap-6 flex-wrap">

        {/* Brand */}
        <span className="text-purple-400 font-bold text-lg">🛠️ Admin</span>

        {/* Nav Links */}
        {NAV_LINKS.map(({ href, label }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`text-sm transition ${
                isActive
                  ? 'text-white font-semibold border-b-2 border-purple-500 pb-0.5'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {label}
            </Link>
          )
        })}

        {/* Back to Site */}
        <Link
          href="/"
          className="text-gray-400 hover:text-white text-sm transition ml-auto"
        >
          ← Back to Site
        </Link>

        {/* Logout */}
        <LogoutButton />

      </div>
    </nav>
  )
}