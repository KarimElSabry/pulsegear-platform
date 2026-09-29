// src/components/blog/BlogNav.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { categoryIndexes } from '@/content/posts'

const items = [{ slug: '', title: 'All articles' }, ...categoryIndexes]

export default function BlogNav() {
  const pathname = usePathname() ?? '/blog'
  return (
    <nav aria-label="Blog categories" className="border-b border-line bg-surface-0/80 backdrop-blur">
      <div className="container-x flex items-center gap-2 overflow-x-auto py-3 no-scrollbar">
        <span className="me-2 shrink-0 text-xs font-bold uppercase tracking-[0.2em] text-muted">Blog</span>
        {items.map((c) => {
          const href = c.slug ? `/blog/${c.slug}` : '/blog'
          const active = c.slug ? pathname.startsWith(href) : pathname === '/blog'
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${
                active ? 'border-brand bg-brand text-white' : 'border-line text-muted-strong hover:border-white hover:text-white'
              }`}
            >
              {c.title}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
