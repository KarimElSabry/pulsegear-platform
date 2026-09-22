// src/components/layout/Header.tsx

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'

const navLinks = [
  { label: 'Products', href: '/products' },
  { label: 'Brands', href: '/brands' },
  { label: 'HOT Deals', href: '/deals', highlight: true, icon: '🔥' },
  { label: 'Blog', href: '/blog' },
  { label: 'Sold', href: '/sold' },
  { label: 'Request Product', href: '/request-product' },
  { label: 'Wishlist', href: '/wishlist' },
  { label: 'FAQ', href: '/faq' },
]

export default function Header() {
  const pathname = usePathname()
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])
  const [menuOpen, setMenuOpen] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  const isAdminRoute = pathname?.startsWith('/admin')

  useEffect(() => {
    if (isAdminRoute) return

    let mounted = true

    async function loadUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!mounted) return
        setUserEmail(user?.email ?? null)
      } finally {
        if (mounted) {
          setAuthLoading(false)
        }
      }
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
  }, [supabase, isAdminRoute])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const isActiveLink = (href: string) => {
    if (!pathname) return false
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  if (isAdminRoute) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0b0b0b]/95 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-6 px-4 py-3 md:px-6 lg:px-8">
        <Link href="/" className="shrink-0 flex items-center">
          <Image
            src="/logo.png"
            alt="Pulse Gear Logo"
            width={140}
            height={140}
            priority
            className="h-[80px] w-auto sm:h-[92px] lg:h-[104px]"
          />
        </Link>

        <nav className="hidden xl:flex flex-1 items-center justify-center gap-8 2xl:gap-10">
          {navLinks.map((link) => {
            const isActive = isActiveLink(link.href)

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative whitespace-nowrap text-[16px] 2xl:text-[17px] font-medium tracking-[0.01em] transition-colors duration-200 ${
                  link.highlight
                    ? isActive
                      ? 'text-orange-300'
                      : 'text-orange-400 hover:text-orange-300 font-semibold'
                    : isActive
                      ? 'text-white'
                      : 'text-zinc-200 hover:text-white'
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  {link.icon && <span aria-hidden="true">{link.icon}</span>}
                  <span>{link.label}</span>
                </span>
                {isActive && (
                  <span
                    className={`absolute left-0 top-full mt-2 h-[2px] w-full rounded-full ${
                      link.highlight ? 'bg-orange-300' : 'bg-white/80'
                    }`}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-3 shrink-0">
          {authLoading ? (
            <span className="text-sm text-zinc-500">Loading...</span>
          ) : userEmail ? (
            <>
              <Link
                href="/account"
                className="rounded-full border border-zinc-700/80 px-5 py-2.5 text-sm font-medium text-white transition hover:border-zinc-500 hover:bg-zinc-900/80"
              >
                Account
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200 shadow-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="rounded-full border border-zinc-700/80 px-5 py-2.5 text-sm font-medium text-white transition hover:border-zinc-500 hover:bg-zinc-900/80"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200 shadow-sm"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button
          className="flex shrink-0 flex-col gap-1.5 rounded-md p-2 text-white xl:hidden"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span
            className={`block h-0.5 w-6 bg-white transition-all duration-300 ${
              menuOpen ? 'translate-y-2 rotate-45' : ''
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-white transition-all duration-300 ${
              menuOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-white transition-all duration-300 ${
              menuOpen ? '-translate-y-2 -rotate-45' : ''
            }`}
          />
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-white/10 bg-[#0b0b0b] xl:hidden">
          <div className="mx-auto flex max-w-[1600px] flex-col gap-2 px-4 py-4 md:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {navLinks.map((link) => {
                const isActive = isActiveLink(link.href)

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                      link.highlight
                        ? 'border-orange-500/30 bg-orange-500/10 text-orange-300 hover:bg-orange-500/15'
                        : isActive
                          ? 'border-white/20 bg-zinc-800 text-white'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-200 hover:border-zinc-700 hover:bg-zinc-800'
                    }`}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {link.icon && <span aria-hidden="true">{link.icon}</span>}
                      <span>{link.label}</span>
                    </span>
                  </Link>
                )
              })}
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {authLoading ? (
                <span className="text-sm text-zinc-500">Loading...</span>
              ) : userEmail ? (
                <>
                  <Link
                    href="/account"
                    className="rounded-xl border border-zinc-700 px-4 py-3 text-center text-sm font-medium text-white transition hover:border-zinc-500 hover:bg-zinc-900"
                  >
                    Account
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="rounded-xl border border-zinc-700 px-4 py-3 text-center text-sm font-medium text-white transition hover:border-zinc-500 hover:bg-zinc-900"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-black transition hover:bg-zinc-200"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}