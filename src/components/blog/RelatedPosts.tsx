// src/components/blog/RelatedPosts.tsx
import Link from 'next/link'
import { CATEGORY_LABEL, getPost, posts } from '@/content/posts'

export default function RelatedPosts({ current, slugs }: { current: string; slugs?: string[] }) {
  const currentPost = getPost(current)
  const picked = (slugs?.map(getPost).filter(Boolean) as NonNullable<ReturnType<typeof getPost>>[] | undefined) ??
    posts.filter((p) => p.slug !== current && p.category === currentPost?.category).slice(0, 3)
  if (picked.length === 0) return null
  return (
    <section aria-labelledby="related-title" className="space-y-5">
      <h2 id="related-title" className="text-xl font-black uppercase tracking-tight text-white" dir="auto">اقرأ كمان</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {picked.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="card group flex flex-col gap-3 p-5 transition-colors hover:border-brand/60">
            <span className="text-[11px] font-bold uppercase tracking-wide text-brand-soft">{CATEGORY_LABEL[p.category]}</span>
            <h3 className="text-sm font-black leading-snug text-white transition-colors group-hover:text-brand-soft" dir="auto">
              {p.titleAr ?? p.title}
            </h3>
            <span className="mt-auto text-xs text-muted">{p.readTime} read</span>
          </Link>
        ))}
      </div>
      <div className="flex justify-center pt-2">
        <Link href="/blog" className="btn-ghost">All articles</Link>
      </div>
    </section>
  )
}
