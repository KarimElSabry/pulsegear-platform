// src/app/admin/campaigns/CampaignForms.tsx

'use client'

import { useActionState, useMemo, useState } from 'react'
import { salePrice } from '@/lib/promotions'
import { deleteCampaignAction, emailCampaignAction, saveCampaignAction, setCampaignActiveAction, type CampaignResult } from './actions'

export type OptionLite = { id: number; label: string; name: string; size: string; price: number }
export type ProductLite = { id: number; title: string; brand: string | null; category: string | null; price: number; status: string; options?: OptionLite[] }
export type CampaignInitial = { id: number | null; name: string; starts: string; ends: string; isActive: boolean; allowCodes: boolean; items: { product_id: number; percent_off: number; variant_ids?: number[] | null }[] }

const input = 'bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 placeholder-zinc-600'

function Msg({ r }: { r: CampaignResult | null }) {
  if (!r) return null
  return <span role="status" className={`text-sm ${r.ok ? 'text-green-400' : 'text-red-400'}`}>{r.message}</span>
}

export function SwitchForm({ id, active }: { id: number; active: boolean }) {
  const [res, action, pending] = useActionState(setCampaignActiveAction, null)
  return (
    <form action={action} className="inline-flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="active" value={active ? 'false' : 'true'} />
      <button disabled={pending} className={`rounded-lg px-3 py-1 text-xs font-bold text-white disabled:opacity-50 ${active ? 'bg-orange-600 hover:bg-orange-500' : 'bg-green-600 hover:bg-green-500'}`}>
        {active ? 'Switch off' : 'Switch on'}
      </button>
      <Msg r={res} />
    </form>
  )
}

export function EmailForm({ id, live, emailedAt }: { id: number; live: boolean; emailedAt: string | null }) {
  const [res, action, pending] = useActionState(emailCampaignAction, null)
  if (!live) return null
  const btn = 'rounded-lg px-3 py-1 text-xs font-bold text-white disabled:opacity-50'
  return (
    <form action={action} className="inline-flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <button disabled={pending} name="mode" value="test" className={`${btn} bg-zinc-600 hover:bg-zinc-500`}>✉️ Send me a test</button>
      {emailedAt ? (
        <button disabled={pending} name="mode" value="again" onClick={(e) => { if (!confirm('This campaign was already emailed. Send it to ALL subscribers again?')) e.preventDefault() }} className={`${btn} bg-purple-700 hover:bg-purple-600`}>📨 Email again</button>
      ) : (
        <button disabled={pending} name="mode" value="all" onClick={(e) => { if (!confirm('Send this campaign to ALL newsletter subscribers now? This cannot be undone. (Send yourself a test first.)')) e.preventDefault() }} className={`${btn} bg-purple-700 hover:bg-purple-600`}>📨 Email subscribers</button>
      )}
      {emailedAt && <span className="text-xs text-zinc-400">emailed {new Date(emailedAt).toLocaleDateString('en-GB')}</span>}
      <Msg r={res} />
    </form>
  )
}

export function DeleteForm({ id }: { id: number }) {
  const [res, action, pending] = useActionState(deleteCampaignAction, null)
  return (
    <form action={action} className="inline-flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <button disabled={pending} onClick={(e) => { if (!confirm('Delete this campaign? Prices go back to normal. Orders already placed keep the price the customer paid.')) e.preventDefault() }}
        className="rounded-lg bg-red-700 px-3 py-1 text-xs font-bold text-white hover:bg-red-600 disabled:opacity-50">Delete</button>
      <Msg r={res} />
    </form>
  )
}

export function CampaignForm({ products, initial }: { products: ProductLite[]; initial: CampaignInitial }) {
  const [res, action, pending] = useActionState(saveCampaignAction, null)
  const [picked, setPicked] = useState<Record<number, string>>(() => Object.fromEntries(initial.items.map((i) => [i.product_id, String(i.percent_off)])))
  // products where only some options (colors / sizes) get the discount: product id -> option ids. Not listed = every option.
  const [limit, setLimit] = useState<Record<number, number[]>>(() => Object.fromEntries(initial.items.filter((i) => i.variant_ids?.length).map((i) => [i.product_id, i.variant_ids as number[]])))
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [bulk, setBulk] = useState('20')

  const categories = useMemo(() => [...new Set(products.map((p) => p.category).filter(Boolean) as string[])].sort(), [products])
  const shown = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((p) => (!category || p.category === category) && (!q || `${p.title} ${p.brand ?? ''}`.toLowerCase().includes(q)))
  }, [products, search, category])

  const count = Object.keys(picked).length
  const items = Object.entries(picked).map(([id, pct]) => ({ product_id: Number(id), percent_off: Number(pct), variant_ids: limit[Number(id)]?.length ? limit[Number(id)] : null }))
  const toggle = (id: number) => setPicked((prev) => { const n = { ...prev }; if (id in n) delete n[id]; else n[id] = bulk || '20'; return n })
  const selectShown = () => setPicked((prev) => { const n = { ...prev }; for (const p of shown) if (!(p.id in n)) n[p.id] = bulk || '20'; return n })
  const applyBulk = () => setPicked((prev) => Object.fromEntries(Object.keys(prev).map((id) => [id, bulk])))
  const clear = () => { setPicked({}); setLimit({}) }
  // click an option to limit the discount to it; click all options again (or none) to go back to every option
  const setOptions = (p: ProductLite, ids: number[]) => setLimit((prev) => {
    const n = { ...prev }
    const all = (p.options ?? []).length
    if (ids.length === 0 || ids.length >= all) delete n[p.id]
    else n[p.id] = ids
    return n
  })
  const toggleOption = (p: ProductLite, optionId: number) => {
    const current = limit[p.id] ?? []
    setOptions(p, current.includes(optionId) ? current.filter((x) => x !== optionId) : [...current, optionId])
  }
  const toggleGroup = (p: ProductLite, ids: number[]) => {
    const current = limit[p.id] ?? []
    setOptions(p, ids.every((x) => current.includes(x)) ? current.filter((x) => !ids.includes(x)) : [...new Set([...current, ...ids])])
  }

  return (
    <form action={action} className="space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <h2 className="text-lg font-bold text-white">{initial.id ? 'Edit campaign' : 'New campaign'}</h2>
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="items" value={JSON.stringify(items)} />

      <div className="grid gap-4 md:grid-cols-3">
        <label className="block text-sm text-zinc-300 md:col-span-3">Campaign name (customers see it on the products)
          <input name="name" defaultValue={initial.name} maxLength={60} required placeholder="Early White Friday" className={`${input} mt-1 w-full`} />
        </label>
        <label className="block text-sm text-zinc-300">Starts (Egypt time, empty = now)
          <input type="datetime-local" name="starts" defaultValue={initial.starts} className={`${input} mt-1 w-full`} />
        </label>
        <label className="block text-sm text-zinc-300">Ends (Egypt time, empty = until you switch it off)
          <input type="datetime-local" name="ends" defaultValue={initial.ends} className={`${input} mt-1 w-full`} />
        </label>
        <div className="space-y-2 pt-6 text-sm text-zinc-300">
          <label className="flex items-center gap-2"><input type="checkbox" name="is_active" defaultChecked={initial.isActive} /> Switched on</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="allow_codes" defaultChecked={initial.allowCodes} /> Discount codes still work on these products</label>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-bold text-white">Products ({count} chosen)</p>
        <div className="flex flex-wrap items-center gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products" className={`${input} w-56`} />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={input}>
            <option value="">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button type="button" onClick={selectShown} className="rounded-lg border border-zinc-600 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-800">Choose all shown</button>
          <span className="text-xs text-zinc-500">% off</span>
          <input value={bulk} onChange={(e) => setBulk(e.target.value)} inputMode="decimal" className={`${input} w-16`} aria-label="Percent for all chosen" />
          <button type="button" onClick={applyBulk} className="rounded-lg border border-zinc-600 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-800">Set for all chosen</button>
          <button type="button" onClick={clear} className="text-xs text-zinc-400 underline hover:text-white">Clear</button>
        </div>

        <div className="max-h-96 overflow-y-auto rounded-xl border border-zinc-800">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 bg-zinc-800 text-xs text-zinc-400">
              <tr><th className="p-2 text-left">Use</th><th className="p-2 text-left">Product</th><th className="p-2 text-right">Regular</th><th className="p-2 text-left">% off</th><th className="p-2 text-right">Sale price</th></tr>
            </thead>
            <tbody>
              {shown.map((p) => {
                const on = p.id in picked
                const pct = Number(picked[p.id])
                const valid = on && pct > 0 && pct <= 95
                const opts = p.options ?? []
                const chosen = limit[p.id] ?? []
                const colors = [...new Set(opts.map((o) => o.name).filter(Boolean))]
                const sizes = [...new Set(opts.map((o) => o.size).filter(Boolean))]
                const chip = (active: boolean) => `rounded-full border px-2 py-0.5 text-xs ${active ? 'border-blue-500 bg-blue-600 text-white' : 'border-zinc-600 text-zinc-300 hover:bg-zinc-800'}`
                const covered = chosen.length ? opts.filter((o) => chosen.includes(o.id)) : opts
                const from = valid ? (covered.length ? Math.min(...covered.map((o) => salePrice(o.price, pct))) : salePrice(p.price, pct)) : null
                return (
                  <tr key={p.id} className={`border-t border-zinc-800 ${on ? 'bg-blue-900/10' : ''}`}>
                    <td className="p-2 align-top"><input type="checkbox" checked={on} onChange={() => toggle(p.id)} aria-label={`Use ${p.title}`} /></td>
                    <td className="p-2 text-zinc-200">
                      {p.title}{p.brand && <span className="ml-2 text-xs text-zinc-500">{p.brand}</span>}{p.status !== 'available' && <span className="ml-2 text-xs text-amber-400">{p.status}</span>}
                      {on && opts.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-zinc-400">Discount applies to: <b className="text-white">{chosen.length ? `${chosen.length} of ${opts.length} options` : 'every option'}</b></p>
                          <div className="flex flex-wrap gap-1">
                            <button type="button" onClick={() => setOptions(p, [])} className={chip(chosen.length === 0)}>Every option</button>
                            {colors.length > 1 || (colors.length === 1 && sizes.length > 0) ? colors.map((c) => {
                              const ids = opts.filter((o) => o.name === c).map((o) => o.id)
                              return <button key={`c-${c}`} type="button" onClick={() => toggleGroup(p, ids)} className={chip(ids.every((x) => chosen.includes(x)) && chosen.length > 0)}>All {c}</button>
                            }) : null}
                            {sizes.length > 1 || (sizes.length === 1 && colors.length > 0) ? sizes.map((z) => {
                              const ids = opts.filter((o) => o.size === z).map((o) => o.id)
                              return <button key={`s-${z}`} type="button" onClick={() => toggleGroup(p, ids)} className={chip(ids.every((x) => chosen.includes(x)) && chosen.length > 0)}>All {z}</button>
                            }) : null}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {opts.map((o) => <button key={o.id} type="button" onClick={() => toggleOption(p, o.id)} className={chip(chosen.includes(o.id))}>{o.label}</button>)}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="p-2 text-right align-top text-zinc-300">{p.price.toLocaleString('en-US')}</td>
                    <td className="p-2 align-top"><input disabled={!on} value={on ? picked[p.id] : ''} onChange={(e) => setPicked((prev) => ({ ...prev, [p.id]: e.target.value }))} inputMode="decimal" className={`${input} w-16 py-1 disabled:opacity-30`} aria-label={`Percent off ${p.title}`} /></td>
                    <td className="p-2 text-right align-top font-bold text-green-400">{from !== null ? `${opts.length > 1 || chosen.length ? 'from ' : ''}${from.toLocaleString('en-US')}` : ''}</td>
                  </tr>
                )
              })}
              {shown.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-zinc-500">No products match.</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-zinc-500">For products with colors or sizes, tick the product, then pick which options get the discount (&quot;Every option&quot; is the default). The percent is taken off each option&apos;s own price; the sale price shown is the lowest one.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button disabled={pending} className="rounded-xl bg-green-700 px-5 py-2 font-bold text-white hover:bg-green-600 disabled:opacity-50">{pending ? 'Saving…' : '💾 Save campaign'}</button>
        {initial.id && <a href="/admin/campaigns" className="text-sm text-zinc-400 underline hover:text-white">Close</a>}
        <Msg r={res} />
      </div>
    </form>
  )
}
