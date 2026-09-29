// src/app/blog/page.tsx
// Blog index, server-rendered from the posts registry. `?category=` filters.

import type { Metadata } from 'next'
import Link from 'next/link'
import { posts, categoryIndexes, getPostsByCategory, type PostCategory } from '@/content/posts'
import PostCard from '@/components/blog/PostCard'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Training science, gear guides and honest reviews for runners in Egypt.',
}

const VALID = new Set(categoryIndexes.map((c) => c.slug))

export default async function BlogIndexPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams
  const active = category && VALID.has(category) ? (category as PostCategory) : null
  const list = active ? getPostsByCategory(active) : posts
  const featured = list.find((p) => p.pillar) ?? list[0]
  const rest = list.filter((p) => p !== featured)

  return (
    <div className="container-x py-14 md:py-20">
      <header className="mb-12 max-w-3xl">
        <span className="eyebrow">Pulse Gear Blog</span>
        <h1 className="mt-3 text-4xl font-black uppercase leading-[1.05] tracking-tight text-white md:text-6xl">
          Train smarter.
          <br />
          <span className="text-brand-soft">Perform better.</span>
        </h1>
        <p className="mt-5 text-lg text-muted-strong" dir="rtl">
          مقالات عن الجري، علم التدريب، والـ Gear. كل حاجة محتاجها عشان توصل للـ Next Level.
        </p>
      </header>

      <div className="mb-10 grid grid-cols-1 gap-3 md:grid-cols-3">
        {categoryIndexes.map((c) => {
          const n = getPostsByCategory(c.slug as PostCategory).length
          return (
            <Link key={c.slug} href={`/blog/${c.slug}`} className="card group flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:border-brand/60">
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-white group-hover:text-brand-soft">{c.title}</p>
                <p className="text-xs text-muted">{n} articles</p>
              </div>
              <span className="text-muted transition-transform group-hover:translate-x-1">→</span>
            </Link>
          )
        })}
      </div>

      {featured && (
        <div className="mb-6">
          <PostCard post={featured} featured />
        </div>
      )}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((p) => (
          <PostCard key={p.slug} post={p} />
        ))}
      </div>
    </div>
  )
}
