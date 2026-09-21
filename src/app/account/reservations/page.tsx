// src/app/account/reservations/page.tsx

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createAdminSupabaseClient, createServerSupabaseClient } from '@/lib/supabase'

export default async function AccountReservationsPage() {
  const authSupabase = await createServerSupabaseClient()
  const adminSupabase = createAdminSupabaseClient()

  const {
    data: { user },
  } = await authSupabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: reservations, error } = await adminSupabase
    .from('reservations')
    .select(`
      id,
      name,
      phone,
      note,
      status,
      created_at,
      discount_code,
      discounted_price,
      product:products(
        id,
        slug,
        title,
        status
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-widest text-red-500 font-bold">
            Account
          </p>
          <h1 className="text-4xl font-black text-white mt-2">My Reservations</h1>
          <p className="text-zinc-400 mt-3 text-sm">
            Track the products you reserved.
          </p>
        </div>

        {!reservations || reservations.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center">
            <p className="text-5xl mb-4">📦</p>
            <p className="text-zinc-300 text-lg font-semibold mb-2">
              No reservations yet
            </p>
            <p className="text-zinc-500 mb-6">
              Once you reserve a product while logged in, it will appear here.
            </p>
            <Link
              href="/products"
              className="inline-block bg-red-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-700 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation: any) => {
              const product = Array.isArray(reservation.product)
                ? reservation.product[0]
                : reservation.product

              return (
                <div
                  key={reservation.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-2">
                      <h2 className="text-xl font-bold text-white">
                        {product?.title ?? 'Product'}
                      </h2>

                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full">
                          Reservation #{reservation.id}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full font-semibold ${
                            reservation.status === 'confirmed'
                              ? 'bg-green-500/20 text-green-400'
                              : reservation.status === 'cancelled'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}
                        >
                          {reservation.status}
                        </span>
                        {reservation.discount_code && (
                          <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full font-mono">
                            {reservation.discount_code}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-zinc-400">
                        Reserved on{' '}
                        {new Date(reservation.created_at).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>

                      {reservation.discounted_price && (
                        <p className="text-sm text-green-400 font-semibold">
                          Final Price: {Number(reservation.discounted_price).toLocaleString('en-US')} EGP
                        </p>
                      )}

                      {reservation.note && (
                        <p className="text-sm text-zinc-400">
                          Note: <span className="text-zinc-300">{reservation.note}</span>
                        </p>
                      )}
                    </div>

                    {product?.slug && (
                      <Link
                        href={`/products/${product.slug}`}
                        className="inline-flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition"
                      >
                        View Product
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}