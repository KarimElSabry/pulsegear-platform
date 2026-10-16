// src/app/admin/audience/page.tsx

import StatCard from '@/app/admin/analytics/StatCard'
import { getAccountStats, getNewsletterStats } from '@/lib/audience'
import { filterCustomers, loadCustomers } from '@/lib/customers'

export const dynamic = 'force-dynamic'

function errorMessage(err: unknown) {
  return err instanceof Error ? err.message : 'Unknown error'
}

const MAX_ROWS = 100

export default async function AudiencePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? '').slice(0, 80)
  const [accounts, newsletter, customers] = await Promise.allSettled([getAccountStats(), getNewsletterStats(), loadCustomers()])

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-white">Audience</h1>
        <p className="text-gray-400 mt-1">Who has signed up: accounts on the site and newsletter subscribers.</p>
      </div>

      <section>
        <h2 className="text-white text-xl font-bold mb-4">👤 Accounts</h2>
        {accounts.status === 'fulfilled' ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard title="Total Accounts" value={accounts.value.total} icon="👤" color="purple" />
              <StatCard title="Last 7 Days" value={accounts.value.last7Days} icon="🆕" color="green" />
              <StatCard title="Last 30 Days" value={accounts.value.last30Days} icon="📅" color="blue" />
              <StatCard
                title="Email Not Confirmed"
                value={accounts.value.unconfirmed}
                subtitle="Signed up but never verified"
                icon="✉️"
                color="yellow"
              />
            </div>

            <div className="mt-6 bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-3">Latest sign-ups</h3>
              <ul className="divide-y divide-gray-800 text-sm">
                {accounts.value.recent.map((u) => (
                  <li key={u.email + u.createdAt} className="flex justify-between py-2">
                    <span className="text-gray-200">{u.email}</span>
                    <span className="text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      {u.confirmed ? '' : ' · unconfirmed'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <p className="text-red-400 text-sm">Could not load accounts: {errorMessage(accounts.reason)}</p>
        )}
      </section>

      <section>
        <h2 className="text-white text-xl font-bold mb-4">📬 Newsletter</h2>
        {newsletter.status === 'fulfilled' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Subscribers"
              value={newsletter.value.subscribers}
              subtitle="Brevo newsletter list"
              icon="📬"
              color="pink"
            />
            <StatCard
              title="Active Subscribers"
              value={newsletter.value.unique}
              subtitle="Not unsubscribed or blocklisted"
              icon="✅"
              color="green"
            />
          </div>
        ) : (
          <p className="text-red-400 text-sm">Could not load newsletter stats: {errorMessage(newsletter.reason)}</p>
        )}
      </section>

      <section>
        <h2 className="text-white text-xl font-bold mb-4">🧾 Customers</h2>
        <p className="text-gray-400 text-sm mb-4">
          Name, phone and address come from the profile the customer filled in, or from their latest request or reservation. Blank means they never gave it.
        </p>
        {customers.status === 'fulfilled' ? (() => {
          const rows = filterCustomers(customers.value, q)
          return (
            <>
              <form className="flex gap-2 mb-4" action="/admin/audience">
                <input name="q" defaultValue={q} placeholder="Search name, email, phone, city…" className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm" />
                <button className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold px-4 rounded-lg">Search</button>
              </form>
              <p className="text-gray-500 text-xs mb-2">{rows.length} of {customers.value.length} customers{rows.length > MAX_ROWS ? ` (showing the newest ${MAX_ROWS}, search to narrow)` : ''}</p>
              <div className="overflow-x-auto bg-gray-900 border border-gray-800 rounded-2xl">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 border-b border-gray-800 text-left">
                      <th className="p-3">Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Joined</th><th>Newsletter</th><th>Reservations</th><th>Requests</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, MAX_ROWS).map((c) => (
                      <tr key={c.id} className="border-b border-gray-800/50 text-gray-300 align-top">
                        <td className="p-3 text-white">{c.name || <span className="text-gray-600">-</span>}</td>
                        <td>{c.email}{c.confirmed ? '' : <span className="text-yellow-500"> · unconfirmed</span>}</td>
                        <td>{c.phone || <span className="text-gray-600">-</span>}</td>
                        <td className="max-w-xs">{c.address || <span className="text-gray-600">-</span>}</td>
                        <td className="whitespace-nowrap">{new Date(c.joined).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td>{c.newsletter ? '✅' : ''}</td>
                        <td>{c.reservations || ''}</td>
                        <td>{c.requests || ''}</td>
                      </tr>
                    ))}
                    {rows.length === 0 && <tr><td colSpan={8} className="p-4 text-gray-500">No customers match.</td></tr>}
                  </tbody>
                </table>
              </div>
            </>
          )
        })() : (
          <p className="text-red-400 text-sm">Could not load customers: {errorMessage(customers.reason)}</p>
        )}
      </section>
    </div>
  )
}
