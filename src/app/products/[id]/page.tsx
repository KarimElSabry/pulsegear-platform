// src/app/products/[id]/page.tsx
// Product detail. The [id] segment is the product slug.

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductService } from '@/services/productService'
import ProductImageGallery from '@/components/ProductImageGallery'
import PriceSection from '@/components/PriceSection'
import { SITE_NAME, SITE_URL } from '@/lib/site'

type Props = {
  params: Promise<{ id: string }>
}

export const revalidate = 300

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const product = await ProductService.getProductBySlug(id)
  if (!product) return { title: 'Product not found' }

  const image =
    product.images?.find((img) => img.is_primary)?.image_url ??
    product.images?.[0]?.image_url ??
    '/og-default.jpg'
  const title = [product.brand, product.title].filter(Boolean).join(' ')
  const description =
    product.description?.slice(0, 155) ||
    `${title} in ${product.condition ?? 'great'} condition, ${product.price_egp.toLocaleString('en-US')} EGP, delivered across Egypt.`
  const url = `${SITE_URL}/products/${product.slug ?? product.id}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website', images: [{ url: image, alt: product.title }] },
    robots: product.status === 'sold' ? { index: false, follow: true } : undefined,
  }
}

const AVAILABILITY: Record<string, string> = {
  available: 'https://schema.org/InStock',
  reserved: 'https://schema.org/LimitedAvailability',
  sold: 'https://schema.org/SoldOut',
  out_of_stock: 'https://schema.org/OutOfStock',
}

const CONDITION: Record<string, string> = {
  'new with tags': 'https://schema.org/NewCondition',
  'new without tags': 'https://schema.org/NewCondition',
  'like new': 'https://schema.org/UsedCondition',
  'very good': 'https://schema.org/UsedCondition',
  good: 'https://schema.org/UsedCondition',
  satisfactory: 'https://schema.org/UsedCondition',
}

export default async function ProductDetailsPage({ params }: Props) {
  const { id } = await params
  const product = await ProductService.getProductBySlug(id)
  if (!product) return notFound()

  const images = product.images ?? []
  const url = `${SITE_URL}/products/${product.slug ?? product.id}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description ?? undefined,
    image: images.map((i) => i.image_url),
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    category: product.category ?? undefined,
    url,
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'EGP',
      price: product.price_egp,
      availability: AVAILABILITY[product.status ?? 'available'],
      itemCondition: CONDITION[(product.condition ?? '').toLowerCase()],
      seller: { '@type': 'Organization', name: SITE_NAME },
    },
  }

  return (
    <div className="container-x py-12 md:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
        <ProductImageGallery images={images} title={product.title} />

        <div className="flex flex-col justify-center gap-6">
          <div className="flex flex-wrap gap-2">
            {product.brand && (
              <span className="rounded-full bg-brand px-3 py-1 text-xs font-bold uppercase text-white">
                {product.brand}
              </span>
            )}
            {product.category && (
              <span className="rounded-full bg-surface-3 px-3 py-1 text-xs font-bold uppercase text-muted-strong">
                {product.category}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-black uppercase leading-tight tracking-tight text-white md:text-4xl">
            {product.title}
          </h1>

          {product.condition && (
            <p className="text-sm font-medium text-muted">
              Condition: <span className="font-bold capitalize text-white">{product.condition}</span>
            </p>
          )}

          {product.description && (
            <div className="flex flex-col gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wide text-muted-strong">Seller description</h2>
              <p className="whitespace-pre-line border-l-2 border-brand pl-4 text-sm leading-relaxed text-muted">
                {product.description}
              </p>
            </div>
          )}

          <PriceSection
            originalPrice={product.price_egp ?? 0}
            productId={product.id!}
            productTitle={product.title}
            isReservable={product.is_reservable ?? false}
            discountEnabled={product.discount_enabled ?? true}
            status={product.status ?? 'available'}
          />
        </div>
      </div>
    </div>
  )
}
