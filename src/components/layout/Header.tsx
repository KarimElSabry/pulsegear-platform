// src/components/layout/Header.tsx

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase'

const navLinks = [
  { label: 'Products', href: '/products' },
  { label: 'Brands', href: '/brands' },
  { label: 'HOT Deals', href: '/deals', highlight: true },
  { label: 'Blog', href: '/blog' },
  { label: 'Sold', href: '/sold' },
  { label: 'Request Product', href: '/request-product' },
  { label: 'Wishlist', href: '/wishlist' },
  { label: 'FAQ', href: '/faq' },
]

export default function Header() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])
  const [menuOpen, setMenuOpen] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!mounted) return

      setUserEmail(user?.email ?? null)
      setAuthLoading(false)
    }

    loadUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null)
      setAuthLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <header className="w-full border-b border-white/10 bg-[#111111] sticky top-0 z-50">
      <div className="w-full px-6 py-4 flex items-center justify-between gap-4">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Pulse Gear Logo"
            width={140}
            height={40}
            style={{ width: 'auto', height: 'auto' }}
            priority
          />
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors duration-200 ${
                link.highlight
                  ? 'text-orange-400 hover:text-orange-300 font-bold'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {authLoading ? (
            <span className="text-sm text-zinc-500">Loading...</span>
          ) : userEmail ? (
            <>
              <Link
                href="/account"
                className="text-sm text-white border border-zinc-700 hover:border-zinc-500 px-4 py-2 rounded-full transition"
              >
                Account
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-full font-semibold transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-white border border-zinc-700 hover:border-zinc-500 px-4 py-2 rounded-full transition"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="text-sm bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-full font-semibold transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span
            className={`block w-6 h-0.5 bg-gray-300 transition-all duration-300 ${
              menuOpen ? 'rotate-45 translate-y-2' : ''
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-gray-300 transition-all duration-300 ${
              menuOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-gray-300 transition-all duration-300 ${
              menuOpen ? '-rotate-45 -translate-y-2' : ''
            }`}
          />
        </button>
      </div>

      {menuOpen && (
        <nav className="md:hidden border-t border-white/10 px-6 py-4 flex flex-col gap-4 bg-[#111111]">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-base font-medium transition-colors duration-200 ${
                link.highlight
                  ? 'text-orange-400 hover:text-orange-300 font-bold'
                  : 'text-gray-300 hover:text-white'
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <div className="border-t border-zinc-800 pt-4 flex flex-col gap-3">
            {authLoading ? (
              <span className="text-sm text-zinc-500">Loading...</span>
            ) : userEmail ? (
              <>
                <Link
                  href="/account"
                  className="text-sm text-center text-white border border-zinc-700 hover:border-zinc-500 px-4 py-2 rounded-full transition"
                  onClick={() => setMenuOpen(false)}
                >
                  Account
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-full font-semibold transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-center text-white border border-zinc-700 hover:border-zinc-500 px-4 py-2 rounded-full transition"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="text-sm text-center bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-full font-semibold transition"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}