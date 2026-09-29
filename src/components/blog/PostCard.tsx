// src/components/blog/PostCard.tsx
import Image from 'next/image'
import Link from 'next/link'
import { CATEGORY_LABEL, type Post } from '@/content/posts'

export default function PostCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`card group relative flex overflow-hidden transition-colors hover:border-brand/60 ${
        featured ? 'flex-col md:min-h-[360px] md:flex-row' : 'flex-col'
      }`}
    >
      <div className={`relative overflow-hidden bg-surface-3 ${featured ? 'aspect-[16/10] md:aspect-auto md:w-1/2' : 'aspect-[16/10]'}`}>
        {post.cover ? (
          <Image src={post.cover} alt="" fill sizes={featured ? '(min-width: 768px) 50vw, 100vw' : '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'} className="object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand/40 via-surface-2 to-surface-2" />
        )}
        <span className="absolute left-4 top-4 rounded-full bg-surface-0/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-soft backdrop-blur">
          {CATEGORY_LABEL[post.category]}
        </span>
        {post.pillar && (
          <span className="absolute right-4 top-4 rounded-full bg-surface-0/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-muted-strong backdrop-blur">
            Pillar
          </span>
        )}
      </div>
      <div className={`flex flex-1 flex-col gap-3 p-6 ${featured ? 'md:justify-center md:p-10' : ''}`}>
        <h3 className={`font-black leading-tight text-white transition-colors group-hover:text-brand-soft ${featured ? 'text-2xl md:text-3xl' : 'text-lg'}`} dir="ltr">
          {post.title}
        </h3>
        {post.titleAr && <p className="text-sm font-semibold text-muted-strong" dir="rtl">{post.titleAr}</p>}
        <p className="flex-1 text-sm leading-relaxed text-muted" dir="auto">{post.excerpt}</p>
        <div className="flex items-center justify-between text-xs text-muted">
          <span>{post.readTime} read</span>
          <span className="font-semibold text-white">Read →</span>
        </div>
      </div>
    </Link>
  )
}
