// src/components/home/HeroMedia.tsx
// Chooses the hero background for this visitor:
//  - 'video'  big screen on a good connection -> crossfading clips (HeroVideoPlayer)
//  - 'slides' phones, cellular/slow/data-saver connections -> light picture slideshow
//  - 'still'  reduced motion -> the poster only
// navigator.connection exists only in Chrome/Android, so screen size is the main signal and the
// connection hints are a bonus. The server and the first client render use 'video', which loads
// nothing until mount, so there is no hydration mismatch and no video downloaded by phones.
'use client'

import { useSyncExternalStore } from 'react'
import HeroVideoPlayer from './HeroVideoPlayer'
import HeroSlides from './HeroSlides'
import type { HeroClip } from '@/content/hero-videos'

type Mode = 'video' | 'slides' | 'still'
type Conn = EventTarget & { saveData?: boolean; effectiveType?: string; type?: string }

const conn = (): Conn | undefined => (navigator as Navigator & { connection?: Conn }).connection

function getMode(): Mode {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'still'
  const c = conn()
  const slow = c?.saveData || c?.type === 'cellular' || /^(slow-2g|2g|3g)$/.test(c?.effectiveType ?? '')
  return window.matchMedia('(max-width: 767px)').matches || slow ? 'slides' : 'video'
}

function subscribe(cb: () => void) {
  const mqs = ['(max-width: 767px)', '(prefers-reduced-motion: reduce)'].map((q) => window.matchMedia(q))
  mqs.forEach((m) => m.addEventListener('change', cb))
  const c = conn()
  c?.addEventListener?.('change', cb)
  return () => {
    mqs.forEach((m) => m.removeEventListener('change', cb))
    c?.removeEventListener?.('change', cb)
  }
}

export default function HeroMedia({ clips, slides }: { clips: HeroClip[]; slides: string[] }) {
  const mode = useSyncExternalStore(subscribe, getMode, () => 'video' as Mode)
  if (mode === 'video') return <HeroVideoPlayer clips={clips} />
  if (mode === 'slides') return <HeroSlides slides={slides} />
  return null
}
