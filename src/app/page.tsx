// src/app/page.tsx
// Server-rendered homepage. Data is fetched here once per minute (ISR);
// only the interactive rails (carousels, like/wishlist buttons) are client code.

import Link from 'next/link'
import { createAdminSupabaseClient } from '@/lib/supabase'
import type { Product } from '@/types/product'

import HeroVideo from '@/components/home/HeroVideo'
import StatsStrip, { type Stats } from '@/components/home/StatsStrip'
import BrandMarquee from '@/components/home/BrandMarquee'
import SectionHeading from '@/components/home/SectionHeading'
import CategoryTiles, { buildCategoryTiles, type CategoryTile } from '@/components/home/CategoryTiles'
import RandomProductRail from '@/components/home/RandomProductRail'
import ValueProps from '@/components/home/ValueProps'
import Testimonials from '@/components/home/Testimonials'
import BlogTeasers from '@/components/home/BlogTeasers'
import HomeFaq from '@/components/home/HomeFaq'
import NewsletterSignup from '@/components/newsletter/NewsletterSignup'
import ScrollReveal from '@/components/ScrollReveal'

export const revalidate = 60

type HomeData = {
  featured: Product[]
  deals: Product[]
  stats: Stats
  brands: string[]
  categories: CategoryTile[]
}

async function getHomeData(): Promise<HomeData> {
  const empty: HomeData = { featured: [], deals: [], stats: { available: 0, sold: 0, brands: 0 }, brands: [], categories: [] }
  try {
    const supabase = createAdminSupabaseClient()
    const [featuredRes, dealsRes, availRes, soldRes, brandRes, catRes] = await Promise.all([
      supabase
        .from('products')
        .select('*, images:product_images(*)')
        .eq('status', 'available')
        .order('created_at', { ascending: false })
        .limit(16),
      supabase
        .from('products')
        .select('*, images:product_images(*)')
        .eq('is_deal', true)
        .eq('status', 'available')
        .order('created_at', { ascending: false })
        .limit(20),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'available'),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'sold'),
      supabase.from('products').select('brand').not('brand', 'is', null),
      supabase
        .from('products')
        .select('category, images:product_images(image_url, is_primary, display_order)')
        .eq('status', 'available')
        .order('created_at', { ascending: false }),
    ])

    const brands = [...new Set((brandRes.data ?? []).map((r) => String(r.brand).trim()).filter(Boolean))].sort()

    return {
      featured: (featuredRes.data ?? []) as Product[],
      deals: (dealsRes.data ?? []) as Product[],
      stats: {
        available: availRes.count ?? 0,
        sold: soldRes.count ?? 0,
        brands: brands.length,
      },
      brands,
      categories: buildCategoryTiles((catRes.data ?? []) as Parameters<typeof buildCategoryTiles>[0]),
    }
  } catch (error) {
    console.error('[home] data fetch failed:', error)
    return empty
  }
}

export default async function HomePage() {
  const { featured, deals, stats, brands, categories } = await getHomeData()

  return (
    <>
      <HeroVideo />
      <StatsStrip stats={stats} />
      <BrandMarquee brands={brands} />

      {/* Shop by category (live: only categories with available products) */}
      {categories.length > 0 && (
        <section className="container-x py-20">
          <ScrollReveal>
            <SectionHeading
              eyebrow="Shop by category"
              title="Built for the way you train"
              sub="Watches, straps and accessories picked for runners, cyclists and triathletes in Egypt."
              action={{ label: 'All products', href: '/products' }}
            />
            <CategoryTiles tiles={categories} />
          </ScrollReveal>
        </section>
      )}

      {/* New arrivals rail */}
      <section className="border-y border-line bg-surface-1 py-20">
        <div className="container-x">
          <ScrollReveal>
            <SectionHeading
              eyebrow="Just landed"
              title="New arrivals"
              sub="Fresh stock, listed as it clears inspection. Reserve before someone else does."
              action={{ label: 'View all', href: '/products?availability=In%20Stock' }}
            />
            <RandomProductRail pool={featured} limit={10} salt="new" />
          </ScrollReveal>
        </div>
      </section>

      {/* Deals rail (only when there are deals) */}
      {deals.length > 0 && (
        <section className="relative overflow-hidden py-20">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/15 via-transparent to-transparent" />
          <div className="container-x relative">
            <ScrollReveal>
              <SectionHeading
                eyebrow="Limited stock"
                title="Hot deals"
                sub="Hand-picked prices that will not last. When they are gone, they are gone."
                action={{ label: 'All deals', href: '/deals' }}
              />
              <RandomProductRail pool={deals} limit={8} salt="deals" />
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* Why us */}
      <section className="border-y border-line bg-surface-1 py-20">
        <div className="container-x">
          <ScrollReveal>
            <SectionHeading eyebrow="Our promise" title="Why runners buy from Pulse Gear" align="center" />
            <ValueProps />
          </ScrollReveal>
        </div>
      </section>

      {/* Request a product: full-bleed CTA */}
      <section className="relative isolate overflow-hidden py-24">
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand/10 to-transparent" />
        <div className="container-x relative flex flex-col items-center gap-6 text-center">
          <span className="eyebrow">Can&apos;t find it?</span>
          <h2 className="max-w-3xl text-4xl font-black uppercase leading-[0.95] tracking-tight text-white md:text-6xl">
            Tell us what you want. <span className="text-brand-soft">We source it.</span>
          </h2>
          <p className="max-w-xl text-muted-strong">
            Send the model you are after and your budget. We find it, quote it, and deliver it.
          </p>
          <Link href="/request-product" className="btn-primary mt-2">
            Request a product
          </Link>
        </div>
      </section>

      {/* Reviews */}
      <section className="border-y border-line bg-surface-1 py-20">
        <div className="container-x">
          <ScrollReveal>
            <SectionHeading eyebrow="Reviews" title="From runners across Egypt" sub="Real messages from customers on Instagram and WhatsApp." align="center" />
            <Testimonials />
          </ScrollReveal>
        </div>
      </section>

      {/* Blog */}
      <section className="container-x py-20">
        <ScrollReveal>
          <SectionHeading
            eyebrow="From the blog"
            title="Train smarter"
            sub="Heart rate zones, gear comparisons and training setups written for Egyptian runners."
            action={{ label: 'All articles', href: '/blog' }}
          />
          <BlogTeasers limit={3} />
        </ScrollReveal>
      </section>

      {/* Sold archive strip */}
      <section className="border-y border-line bg-surface-1">
        <div className="container-x flex flex-col items-start justify-between gap-6 py-12 md:flex-row md:items-center">
          <div>
            <span className="eyebrow">Sold archive</span>
            <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-white md:text-3xl">
              See what other runners took home
            </h2>
          </div>
          <Link href="/sold" className="btn-ghost">
            Browse sold items
          </Link>
        </div>
      </section>

      {/* Newsletter (single instance on the page) */}
      <NewsletterSignup source="homepage" />

      {/* FAQ + contact */}
      <section className="container-x py-20">
        <ScrollReveal>
          <SectionHeading eyebrow="Get in touch" title="We're here to help" align="center" />
          <HomeFaq />
        </ScrollReveal>
      </section>
    </>
  )
}
