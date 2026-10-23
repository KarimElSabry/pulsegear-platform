// src/components/tour/WelcomeTour.tsx

'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  TOUR_STEPS, TOUR_START_EVENT, TOUR_STORAGE_KEY, mobileHint, progressLabel, selectorsFor, shouldAutoStart,
} from '@/lib/tour'

type Box = { top: number; left: number; width: number; height: number }

function findVisible(selectors: string[]): HTMLElement | null {
  for (const sel of selectors) {
    for (const el of Array.from(document.querySelectorAll<HTMLElement>(sel))) {
      if (el.getClientRects().length > 0) return el
    }
  }
  return null
}

function markSeen() {
  try { localStorage.setItem(TOUR_STORAGE_KEY, '1') } catch { /* private mode: tour may show again, harmless */ }
}

export default function WelcomeTour() {
  const pathname = usePathname()
  const [index, setIndex] = useState<number | null>(null)
  const [box, setBox] = useState<Box | null>(null)
  const [width, setWidth] = useState(1280)

  const close = useCallback(() => { markSeen(); setIndex(null); setBox(null) }, [])

  // Auto-start once on the homepage, after the page has settled.
  useEffect(() => {
    let seen: string | null = null
    try { seen = localStorage.getItem(TOUR_STORAGE_KEY) } catch { return }
    if (!shouldAutoStart(pathname, seen)) return
    const t = setTimeout(() => setIndex(0), 1500)
    return () => clearTimeout(t)
  }, [pathname])

  // Replay from the footer link.
  useEffect(() => {
    const start = () => setIndex(0)
    window.addEventListener(TOUR_START_EVENT, start)
    return () => window.removeEventListener(TOUR_START_EVENT, start)
  }, [])

  // Highlight the current step's target and keep it positioned.
  useEffect(() => {
    if (index === null) return
    const step = TOUR_STEPS[index]
    const place = () => {
      setWidth(window.innerWidth)
      const el = findVisible(selectorsFor(step, window.innerWidth))
      if (!el) { setBox(null); return }
      const r = el.getBoundingClientRect()
      setBox({ top: r.top - 6, left: r.left - 6, width: r.width + 12, height: r.height + 12 })
    }
    const el = findVisible(selectorsFor(step, window.innerWidth))
    if (el) {
      const r = el.getBoundingClientRect()
      const inView = r.top >= 0 && r.bottom <= window.innerHeight && r.left >= 0 && r.right <= window.innerWidth
      if (!inView) el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' })
    }
    place()
    const settle = setTimeout(place, 450) // after the smooth scroll finishes
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      clearTimeout(settle)
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [index])

  useEffect(() => {
    if (index === null) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, close])

  if (index === null || pathname?.startsWith('/admin')) return null

  const step = TOUR_STEPS[index]
  const last = index === TOUR_STEPS.length - 1
  const hint = mobileHint(step, width)
  const mobile = width < 640
  // Desktop: card under the target when there is room, otherwise above. Mobile: pinned to the bottom.
  const cardStyle: React.CSSProperties = mobile || !box
    ? mobile ? (box && box.top > window.innerHeight / 2 ? { left: 12, right: 12, top: 12 } : { left: 12, right: 12, bottom: 12 }) : { left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 360 }
    : box.top + box.height + 220 < window.innerHeight
      ? { top: box.top + box.height + 12, left: Math.min(Math.max(12, box.left), window.innerWidth - 372), width: 360 }
      : { top: Math.max(12, box.top - 232), left: Math.min(Math.max(12, box.left), window.innerWidth - 372), width: 360 }

  return (
    <div className="fixed inset-0 z-100" role="dialog" aria-modal="true" aria-label="Website tour">
      {box ? (
        <div
          className="pointer-events-none fixed rounded-xl ring-2 ring-red-500"
          style={{ ...box, boxShadow: '0 0 0 9999px rgba(0,0,0,0.72)' }}
        />
      ) : (
        <div className="fixed inset-0 bg-black/70" />
      )}
      <div className="fixed rounded-2xl border border-zinc-700 bg-zinc-900 p-5 shadow-2xl" style={cardStyle}>
        <div className="mb-1 flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-red-500">
          <span>Quick tour</span>
          <span className="text-zinc-500">{progressLabel(index, TOUR_STEPS.length)}</span>
        </div>
        <h3 className="text-lg font-black text-white">{step.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-zinc-300">{step.body}</p>
        {hint && <p className="mt-1 text-xs font-semibold text-amber-400">{hint.en}</p>}
        <div dir="rtl" className="mt-3 border-t border-zinc-800 pt-3 text-right">
          <p className="text-sm font-bold text-white">{step.titleAr}</p>
          <p className="mt-1 text-sm leading-relaxed text-zinc-400">{step.bodyAr}</p>
          {hint && <p className="mt-1 text-xs font-semibold text-amber-400">{hint.ar}</p>}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <button type="button" onClick={close} className="text-sm text-zinc-400 underline hover:text-white">
            Skip / تخطّي
          </button>
          <div className="flex gap-2">
            {index > 0 && (
              <button type="button" onClick={() => setIndex(index - 1)}
                className="rounded-full border border-zinc-600 px-4 py-2 text-sm text-white hover:bg-zinc-800">
                Back
              </button>
            )}
            <button type="button" onClick={() => (last ? close() : setIndex(index + 1))}
              className="rounded-full bg-red-600 px-5 py-2 text-sm font-bold text-white hover:bg-red-500">
              {last ? 'Done / تم' : 'Next / التالي'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
