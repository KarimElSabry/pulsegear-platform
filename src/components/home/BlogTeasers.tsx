// src/components/home/BlogTeasers.tsx
import Link from 'next/link'
import { CATEGORY_LABEL, getLatestPosts, postHref } from '@/content/posts'
import { ArrowIcon } from './SectionHeading'
import PostCover from '@/components/blog/PostCover'

export default function BlogTeasers({ limit = 3 }: { limit?: number }) {
  const items = getLatestPosts(limit)
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {items.map((post) => (
        <Link key={post.slug} href={postHref(post)} className="card group flex flex-col overflow-hidden transition-colors hover:border-brand/60">
          <div className="relative aspect-[16/10] overflow-hidden bg-surface-3">
            <PostCover post={post} />
            <span className="absolute left-4 top-4 rounded-full bg-surface-0/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-soft backdrop-blur">
              {CATEGORY_LABEL[post.category]}
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-3 p-6">
            <h3 className="text-lg font-black uppercase leading-tight text-white transition-colors group-hover:text-brand-soft">
              {post.title}
            </h3>
            <p className="flex-1 text-sm leading-relaxed text-muted">{post.excerpt}</p>
            <div className="flex items-center justify-between text-xs text-muted">
              <span>{post.readTime} read</span>
              <span className="inline-flex items-center gap-1 font-semibold text-white">
                Read <ArrowIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
