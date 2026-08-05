// src/app/admin/analytics/page.tsx

import { createServerClient } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AnalyticsClient from './AnalyticsClient'

async function checkAuth() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  if (token !== process.env.ADMIN_SECRET) redirect('/admin-login')
}

async function getAnalyticsData() {
  const supabase = createServerClient()

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [
    productsRes,
    reservationsRes,
    discountCodesRes,
    likesRes,
    mostLikedRes,
    reservationsTimeRes,
    productsTimeRes,
    // ✅ NEW
    salesRes,
    salesTimeRes,
  ] = await Promise.all([

    supabase
      .from('products')
      .select('id, status, price_egp, category, brand'),

    supabase
      .from('reservations')
      .select(`
        id, status, created_at,
        discount_code, discounted_price,
        product:products(id, title, price_egp)
      `)
      .order('created_at', { ascending: true }),

    supabase
      .from('discount_codes')
      .select('code, discount_percent, usage_count, is_active')
      .order('usage_count', { ascending: false }),

    supabase
      .from('product_likes')
      .select('*', { count: 'exact', head: true }),

    supabase
      .from('product_likes')
      .select('product_id, products(title)')
      .limit(500),

    supabase
      .from('reservations')
      .select('created_at, status, discounted_price, product:products(price_egp)')
      .gte('created_at', thirtyDaysAgo),

    supabase
      .from('products')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo),

    // ✅ All sales (for totals + channel breakdown + recent)
    supabase
      .from('sales')
      .select('*')
      .order('sale_date', { ascending: false }),

    // ✅ Sales last 30 days (for time series)
    supabase
      .from('sales')
      .select('sale_date, selling_price_egp, profit_egp')
      .gte('sale_date', thirtyDaysAgo)
      .order('sale_date', { ascending: true }),
  ])

  // ── Products ──────────────────────────────────────────────────────
  const products = productsRes.data ?? []

  const totalProducts      = products.length
  const availableProducts  = products.filter((p) => p.status === 'available').length
  const soldProducts       = products.filter((p) => p.status === 'sold').length
  const reservedProducts   = products.filter((p) => p.status === 'reserved').length
  const outOfStockProducts = products.filter((p) => p.status === 'out_of_stock').length

  const avgProductPrice =
    totalProducts > 0
      ? Math.round(
          products.reduce((sum, p) => sum + (p.price_egp ?? 0), 0) / totalProducts
        )
      : 0

  const categoryMap = new Map<string, number>()
  products.forEach((p) => {
    if (p.category) categoryMap.set(p.category, (categoryMap.get(p.category) ?? 0) + 1)
  })
  const byCategory = [...categoryMap.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const brandMap = new Map<string, number>()
  products.forEach((p) => {
    if (p.brand) brandMap.set(p.brand, (brandMap.get(p.brand) ?? 0) + 1)
  })
  const byBrand = [...brandMap.entries()]
    .map(([brand, count]) => ({ brand, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // ── Reservations ──────────────────────────────────────────────────
  const reservations = reservationsRes.data ?? []

  const totalReservations     = reservations.length
  const pendingReservations   = reservations.filter((r) => r.status === 'pending').length
  const confirmedReservations = reservations.filter((r) => r.status === 'confirmed').length
  const cancelledReservations = reservations.filter((r) => r.status === 'cancelled').length

  const confirmedRes = reservations.filter((r) => r.status === 'confirmed')

  const totalRevenue = confirmedRes.reduce((sum, r) => {
    const product = Array.isArray(r.product) ? r.product[0] : r.product
    return sum + (product?.price_egp ?? 0)
  }, 0)

  const discountedRevenue = confirmedRes.reduce((sum, r) => {
    const product = Array.isArray(r.product) ? r.product[0] : r.product
    const price   = r.discounted_price ?? product?.price_egp ?? 0
    return sum + price
  }, 0)

  const totalSavingsGiven = totalRevenue - discountedRevenue

  const productReservationMap = new Map<
    number,
    { title: string; reservations: number; revenue: number }
  >()

  reservations.forEach((r) => {
    const product = Array.isArray(r.product) ? r.product[0] : r.product
    if (!product) return
    const existing = productReservationMap.get(product.id) ?? {
      title: product.title, reservations: 0, revenue: 0,
    }
    existing.reservations += 1
    if (r.status === 'confirmed') {
      existing.revenue += r.discounted_price ?? product.price_egp ?? 0
    }
    productReservationMap.set(product.id, existing)
  })

  const topReservedProducts = [...productReservationMap.values()]
    .sort((a, b) => b.reservations - a.reservations)
    .slice(0, 10)

  // ── Reservations Over Time ────────────────────────────────────────
  const reservationsTimeData = reservationsTimeRes.data ?? []
  const timeMap = new Map<string, { reservations: number; revenue: number }>()

  reservationsTimeData.forEach((r) => {
    const date     = new Date(r.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
    const existing = timeMap.get(date) ?? { reservations: 0, revenue: 0 }
    existing.reservations += 1
    if (r.status === 'confirmed') {
      const product = Array.isArray(r.product) ? r.product[0] : r.product
      existing.revenue += r.discounted_price ?? product?.price_egp ?? 0
    }
    timeMap.set(date, existing)
  })

  const reservationsOverTime = [...timeMap.entries()].map(([date, val]) => ({ date, ...val }))

  // ── Products Over Time ────────────────────────────────────────────
  const productsTimeData  = productsTimeRes.data ?? []
  const productsTimeMap   = new Map<string, number>()

  productsTimeData.forEach((p) => {
    const date = new Date(p.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
    productsTimeMap.set(date, (productsTimeMap.get(date) ?? 0) + 1)
  })

  const productsOverTime = [...productsTimeMap.entries()].map(([date, count]) => ({ date, count }))

  // ── Likes ─────────────────────────────────────────────────────────
  const totalLikes = likesRes.count ?? 0
  const likesData  = mostLikedRes.data ?? []
  const likesMap   = new Map<string, number>()

  likesData.forEach((like: any) => {
    const title =
      (Array.isArray(like.products) ? like.products[0]?.title : like.products?.title) ?? 'Unknown'
    likesMap.set(title, (likesMap.get(title) ?? 0) + 1)
  })

  const mostLikedProducts = [...likesMap.entries()]
    .map(([title, likes]) => ({ title, likes }))
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 10)

  // ── ✅ Sales ──────────────────────────────────────────────────────
  const sales = salesRes.data ?? []

  const totalSalesCount   = sales.length
  const totalSalesRevenue = sales.reduce((sum, s) => sum + (Number(s.selling_price_egp) || 0), 0)
  const totalSalesProfit  = sales.reduce((sum, s) => sum + (Number(s.profit_egp)        || 0), 0)
  const totalSalesCost    = sales.reduce((sum, s) => sum + (Number(s.cost_egp)          || 0), 0)
  const avgProfitMargin   =
    totalSalesCount > 0
      ? sales.reduce((sum, s) => sum + (Number(s.profit_margin_pct) || 0), 0) / totalSalesCount
      : 0

  // Sales by channel
  const channelMap = new Map<string, { count: number; revenue: number; profit: number }>()
  sales.forEach((s) => {
    const ch       = s.sale_channel ?? 'unknown'
    const existing = channelMap.get(ch) ?? { count: 0, revenue: 0, profit: 0 }
    existing.count   += 1
    existing.revenue += Number(s.selling_price_egp) || 0
    existing.profit  += Number(s.profit_egp)        || 0
    channelMap.set(ch, existing)
  })
  const salesByChannel = [...channelMap.entries()].map(([channel, val]) => ({ channel, ...val }))

  // Sales over time
  const salesTimeMap = new Map<string, { revenue: number; profit: number; count: number }>()
  ;(salesTimeRes.data ?? []).forEach((s) => {
    const date     = new Date(s.sale_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
    const existing = salesTimeMap.get(date) ?? { revenue: 0, profit: 0, count: 0 }
    existing.revenue += Number(s.selling_price_egp) || 0
    existing.profit  += Number(s.profit_egp)        || 0
    existing.count   += 1
    salesTimeMap.set(date, existing)
  })
  const salesOverTime = [...salesTimeMap.entries()].map(([date, val]) => ({ date, ...val }))

  // Recent sales (last 10)
  const recentSales = sales.slice(0, 10).map((s) => ({
    id:                String(s.id),
    product_name:      s.product_name      ?? 'Unknown',
    selling_price_egp: Number(s.selling_price_egp) || 0,
    profit_egp:        Number(s.profit_egp)        || 0,
    profit_margin_pct: Number(s.profit_margin_pct) || 0,
    sale_channel:      s.sale_channel      ?? 'other',
    sale_date:         s.sale_date         ?? '',
    cost_egp:          Number(s.cost_egp)          || 0,
  }))

  return {
    // Overview
    totalProducts,
    availableProducts,
    soldProducts,
    reservedProducts,
    outOfStockProducts,

    // Revenue
    totalRevenue,
    discountedRevenue,
    totalSavingsGiven,
    avgProductPrice,

    // Reservations
    totalReservations,
    pendingReservations,
    confirmedReservations,
    cancelledReservations,

    // Lists
    discountCodes:        discountCodesRes.data ?? [],
    topReservedProducts,
    byCategory,
    byBrand,

    // Time series
    reservationsOverTime,
    productsOverTime,

    // Likes
    totalLikes,
    mostLikedProducts,

    // ✅ Sales
    totalSalesCount,
    totalSalesRevenue,
    totalSalesProfit,
    totalSalesCost,
    avgProfitMargin,
    salesByChannel,
    salesOverTime,
    recentSales,
  }
}

export default async function AnalyticsPage() {
  await checkAuth()
  const data = await getAnalyticsData()

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-10">

        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-black text-white">📊 Analytics</h1>
            <p className="text-zinc-500 text-sm mt-1">Real-time insights from your store</p>
          </div>
          <Link href="/admin" className="text-zinc-400 hover:text-white text-sm transition">
            ← Back to Admin
          </Link>
        </div>

        <AnalyticsClient data={data} />

      </div>
    </div>
  )
}