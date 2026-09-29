// src/components/blog/ArticleShell.tsx
// Wraps every blog article: breadcrumb, category badge, bilingual title,
// dek, meta row, share bar, BlogPosting JSON-LD, and the body column.
// Body text defaults to dir="auto", so Arabic and English paragraphs each
// pick their own direction without per-element dir attributes.

import Link from 'next/link'
import { CATEGORY_LABEL, getPost } from '@/content/posts'
import { SITE_NAME, SITE_URL } from '@/lib/site'
import ShareBar from './ShareBar'
import RelatedPosts from './RelatedPosts'
import ProductCta from './ProductCta'

export default function ArticleShell({
  slug,
  dek,
  children,
  related,
  cta,
  toc,
}: {
  slug: string
  dek?: string
  children: React.ReactNode
  /** slugs of related posts; defaults to 3 from the same category */
  related?: string[]
  /** override the closing shop CTA; pass null to hide */
  cta?: { title: string; body: string; href?: string; label?: string } | null
  /** optional table of contents: [{ id, label }] matching <Section id> */
  toc?: { id: string; label: string }[]
}) {
  const post = getPost(slug)
  if (!post) return <>{children}</>
  const url = `${SITE_URL}/blog/${post.slug}`
  const updated = new Date(post.updated)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    alternativeHeadline: post.titleAr,
    description: post.excerpt,
    inLanguage: 'ar-EG',
    dateModified: post.updated,
    datePublished: post.updated,
    mainEntityOfPage: url,
    image: post.cover ? `${SITE_URL}${post.cover}` : `${SITE_URL}/og-default.jpg`,
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL, logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` } },
  }

  return (
    <div className="bg-surface-0 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <header className="relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />
        <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-brand/15 blur-3xl" />
        <div className="container-x relative py-14 md:py-20">
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs uppercase tracking-wide text-muted">
            <Link href="/" className="hover:text-white">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/blog" className="hover:text-white">Blog</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/blog/${post.category}`} className="hover:text-white">{CATEGORY_LABEL[post.category]}</Link>
          </nav>

          <div className="max-w-3xl">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-brand/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-soft">
                {CATEGORY_LABEL[post.category]}
              </span>
              {post.pillar && (
                <span className="rounded-full border border-line-strong px-3 py-1 text-xs font-bold uppercase tracking-wide text-muted-strong">
                  Pillar guide
                </span>
              )}
            </div>

            <h1 className="text-4xl font-black uppercase leading-[1.05] tracking-tight text-white md:text-5xl" dir="ltr">
              {post.title}
            </h1>
            {post.titleAr && (
              <p className="mt-3 text-2xl font-black leading-snug text-brand-soft md:text-3xl" dir="rtl" lang="ar">
                {post.titleAr}
              </p>
            )}
            {dek && (
              <p className="mt-6 text-lg leading-relaxed text-muted-strong" dir="auto" lang="ar">
                {dek}
              </p>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5">
                <ClockIcon /> {post.readTime} read
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarIcon />
                Updated{' '}
                <time dateTime={post.updated}>
                  {updated.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </time>
              </span>
              <span>By {SITE_NAME}</span>
              <ShareBar url={url} title={post.title} />
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="container-x py-12 md:py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_260px]">
          <article lang="ar" dir="auto" className="min-w-0 max-w-3xl space-y-14">
            {children}

            {cta !== null && (
              <ProductCta
                title={cta?.title ?? 'جاهز تطبّق اللي قريته؟'}
                body={cta?.body ?? 'شوف مجموعة الـ GPS Watches والـ Heart Rate Straps اللي بنجيبها من برّه ونوصلها لباب بيتك في مصر.'}
                href={cta?.href ?? '/products'}
                label={cta?.label ?? 'Browse products'}
              />
            )}

            <RelatedPosts current={post.slug} slugs={related} />
          </article>

          {toc && toc.length > 0 && (
            <aside className="hidden lg:block">
              <div className="sticky top-28 rounded-2xl border border-line bg-surface-1 p-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-muted">On this page</p>
                <ol className="space-y-2" dir="rtl">
                  {toc.map((t) => (
                    <li key={t.id}>
                      <a href={`#${t.id}`} className="block text-sm leading-snug text-muted-strong transition-colors hover:text-brand-soft" dir="auto">
                        {t.label}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden="true">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
    </svg>
  )
}
function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  )
}
