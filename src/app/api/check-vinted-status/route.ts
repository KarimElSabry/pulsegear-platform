import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { ProductService } from '@/services/productService'

// ─── Types ────────────────────────────────────────────────────────────────────

interface VintedProduct {
  id: number
  title: string
  source_url: string
}

interface CheckResult {
  id: number
  title: string
  sold: boolean
  priceChanged: boolean
  newPrice: number | null
  error?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractItemId(url: string): string | null {
  // https://www.vinted.de/items/9286317314-garmin-forerunner-165?referrer=catalog
  const match = url.match(/\/items\/(\d+)/)
  return match ? match[1] : null
}

function buildApiUrl(sourceUrl: string): string | null {
  const itemId = extractItemId(sourceUrl)
  if (!itemId) return null

  // استخرج الـ domain (vinted.de / vinted.fr / vinted.com)
  const domainMatch = sourceUrl.match(/https?:\/\/(www\.vinted\.[a-z.]+)/)
  const domain = domainMatch ? domainMatch[1] : 'www.vinted.de'

  return `https://${domain}/api/v2/items/${itemId}`
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  // ✅ 1. Auth Check
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ✅ 2. جيب كل Vinted products اللي لسه available
  const supabase = createServerClient()

  const { data: products, error } = await supabase
    .from('products')
    .select('id, title, source_url')
    .eq('source', 'vinted')
    .eq('status', 'available')
    .not('source_url', 'is', null)

  console.log('[DEBUG] Products found:', products?.length ?? 0)
  console.log('[DEBUG] Sample product:', products?.[0])
  console.log('[DEBUG] DB Error:', error)

  if (error) {
    console.error('[check-vinted-status] DB error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!products?.length) {
    return NextResponse.json({
      message: 'No Vinted products to check',
      checked: 0,
    })
  }

  // ✅ 3. Loop على كل product
  const results: CheckResult[] = []

  for (const product of products as VintedProduct[]) {
    try {
      const apiUrl = buildApiUrl(product.source_url)

      if (!apiUrl) {
        results.push({
          id: product.id,
          title: product.title,
          sold: false,
          priceChanged: false,
          newPrice: null,
          error: 'Could not extract item ID from URL',
        })
        continue
      }

      console.log(`[DEBUG] Fetching API: ${apiUrl}`)

      const res = await fetch(apiUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
            'KHTML, like Gecko Chrome/120.0.0.0 Safari/537.36',
          Accept: 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          Referer: 'https://www.vinted.de/',
          'X-Requested-With': 'XMLHttpRequest',
        },
        next: { revalidate: 0 },
      })

      console.log(`[DEBUG] API status for ${product.id}:`, res.status)

      if (!res.ok) {
        results.push({
          id: product.id,
          title: product.title,
          sold: false,
          priceChanged: false,
          newPrice: null,
          error: `HTTP ${res.status}`,
        })
        continue
      }

      const json = await res.json()

      // ─── DEBUG ────────────────────────────────────────────────────────
      console.log(`[DEBUG] Item ${product.id} — status:`, json?.item?.status)
      console.log(`[DEBUG] Item ${product.id} — can_buy:`, json?.item?.can_buy)
      console.log(`[DEBUG] Item ${product.id} — price:`, json?.item?.price)
      // ──────────────────────────────────────────────────────────────────

      const item = json?.item
      const isSold =
        item?.status === 'Closed' ||
        item?.is_closed === true ||
        item?.can_buy === false

      const rawPrice =
        item?.price?.amount ||
        item?.total_item_price?.amount ||
        item?.price

      const newPrice = rawPrice ? parseFloat(String(rawPrice)) : null

      if (isSold) {
        await ProductService.updateStatus(product.id, 'sold')
        console.log(`[check-vinted-status] ✅ Marked as sold: ${product.title}`)
      } else if (newPrice !== null && !isNaN(newPrice)) {
        await supabase
          .from('products')
          .update({ original_price: newPrice })
          .eq('id', product.id)
      }

      results.push({
        id: product.id,
        title: product.title,
        sold: isSold,
        priceChanged: newPrice !== null,
        newPrice,
      })

    } catch (err) {
      console.error(`[check-vinted-status] Failed: ${product.source_url}`, err)
      results.push({
        id: product.id,
        title: product.title,
        sold: false,
        priceChanged: false,
        newPrice: null,
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    }

    await delay(1500)
  }

  // ✅ 4. Summary
  const soldCount = results.filter((r) => r.sold).length
  const errorCount = results.filter((r) => r.error).length

  console.log(
    `[check-vinted-status] Done — checked: ${results.length}, sold: ${soldCount}, errors: ${errorCount}`
  )

  return NextResponse.json({
    checked: results.length,
    sold: soldCount,
    errors: errorCount,
    results,
  })
}