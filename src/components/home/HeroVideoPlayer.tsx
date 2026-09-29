// src/components/home/HeroVideoPlayer.tsx
// Plays a playlist of muted background clips in random order with a crossfade.
// Two stacked <video> layers: one visible, one preloading the next clip.
//  - Randomness happens on the client after mount, so cached/static HTML never mismatches.
//  - Skipped entirely for reduced-motion and data-saver visitors (poster image stays).
//  - A clip that fails to load is dropped from the playlist; if none work, the poster stays.
'use client'

import { useEffect, useRef } from 'react'
import type { HeroClip } from '@/content/hero-videos'

const FADE_MS = 900

export default function HeroVideoPlayer({ clips }: { clips: HeroClip[] }) {
  const layerA = useRef<HTMLVideoElement>(null)
  const layerB = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const a = layerA.current
    const b = layerB.current
    if (!a || !b || clips.length === 0) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    if (conn?.saveData) return

    const layers = [a, b]
    let pool = [...clips]
    let visible = 0 // index of the layer currently on screen
    let last = ''
    let swapping = false
    let disposed = false
    const timers: number[] = []

    const pick = (): HeroClip => {
      if (pool.length === 1) return pool[0]
      const options = pool.filter((c) => c.mp4 !== last)
      return options[Math.floor(Math.random() * options.length)]
    }

    const srcOf = (c: HeroClip, v: HTMLVideoElement) =>
      c.webm && v.canPlayType('video/webm') ? c.webm : c.mp4

    const load = (v: HTMLVideoElement) => {
      if (pool.length === 0) return
      const clip = pick()
      last = clip.mp4
      v.dataset.clip = clip.mp4
      v.src = srcOf(clip, v)
      v.load()
    }

    const show = (v: HTMLVideoElement, on: boolean) => {
      v.style.opacity = on ? '1' : '0'
    }

    const swap = () => {
      if (swapping || disposed) return
      const from = layers[visible]
      const to = layers[1 - visible]
      if (pool.length < 2 || to.readyState < 3) return
      swapping = true
      to.currentTime = 0
      void to.play().catch(() => undefined)
      show(to, true)
      show(from, false)
      timers.push(
        window.setTimeout(() => {
          if (disposed) return
          from.pause()
          visible = 1 - visible
          swapping = false
          load(from) // the hidden layer preloads the next random clip
        }, FADE_MS + 100)
      )
    }

    const onTimeUpdate = (e: Event) => {
      const v = e.currentTarget as HTMLVideoElement
      if (v !== layers[visible] || !v.duration) return
      if (v.duration - v.currentTime < FADE_MS / 1000 + 0.3) swap()
    }
    const onEnded = (e: Event) => {
      if (e.currentTarget === layers[visible]) swap()
    }
    const onError = (e: Event) => {
      const v = e.currentTarget as HTMLVideoElement
      const bad = v.dataset.clip
      pool = pool.filter((c) => c.mp4 !== bad)
      if (pool.length === 0) {
        layers.forEach((l) => show(l, false))
        return
      }
      if (v === layers[visible]) {
        show(v, false)
        load(v)
      } else {
        load(v)
      }
    }
    const onFirstPlaying = () => {
      // First clip is on screen: preload the next one (or loop if there is only one).
      if (pool.length > 1) load(layers[1 - visible])
      else layers[visible].loop = true
    }

    layers.forEach((v) => {
      v.muted = true
      v.addEventListener('timeupdate', onTimeUpdate)
      v.addEventListener('ended', onEnded)
      v.addEventListener('error', onError)
    })

    load(layers[0])
    layers[0].addEventListener(
      'canplay',
      () => {
        if (disposed) return
        void layers[0].play().catch(() => undefined)
        show(layers[0], true)
      },
      { once: true }
    )
    layers[0].addEventListener('playing', onFirstPlaying, { once: true })

    return () => {
      disposed = true
      timers.forEach((t) => window.clearTimeout(t))
      layers.forEach((v) => {
        v.removeEventListener('timeupdate', onTimeUpdate)
        v.removeEventListener('ended', onEnded)
        v.removeEventListener('error', onError)
        v.pause()
        v.removeAttribute('src')
        v.load()
      })
    }
  }, [clips])

  const cls =
    'absolute inset-0 h-full w-full object-cover object-center opacity-0 transition-opacity motion-reduce:hidden'
  return (
    <>
      <video ref={layerA} className={cls} style={{ transitionDuration: `${FADE_MS}ms` }} muted playsInline preload="auto" aria-hidden="true" tabIndex={-1} />
      <video ref={layerB} className={cls} style={{ transitionDuration: `${FADE_MS}ms` }} muted playsInline preload="auto" aria-hidden="true" tabIndex={-1} />
    </>
  )
}
