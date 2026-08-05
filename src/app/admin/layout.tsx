// src/app/admin/layout.tsx

import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import LogoutButton from './LogoutButton'

const NAV_LINKS = [
  { href: '/admin',              label: '➕ Add Product'  },
  { href: '/admin/products',     label: '📦 Manage Products' },
  { href: '/admin/reservations', label: '📋 Reservations' },
  { href: '/admin/discounts',    label: '🏷️ Discount Codes' },
  { href: '/admin/analytics',    label: '📊 Analytics'    },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ✅ Single auth guard for ALL /admin/* pages
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  if (token !== process.env.ADMIN_SECRET) redirect('/admin-login')

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* ── Admin Nav ── */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center gap-6 flex-wrap">

          {/* Brand */}
          <span className="text-purple-400 font-bold text-lg">🛠️ Admin</span>

          {/* Nav Links */}
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-gray-400 hover:text-white text-sm transition"
            >
              {label}
            </Link>
          ))}

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

      {/* ── Page Content ── */}
      {children}

    </div>
  )
}