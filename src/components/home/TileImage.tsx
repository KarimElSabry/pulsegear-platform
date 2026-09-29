// src/components/home/TileImage.tsx
// Category tile photo: a different product photo each browser session. Nothing is rendered on
// the server (the tile shows its gradient), so no wrong image is downloaded first. If a photo
// fails to load (expired link), the next one is tried.
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useSessionSeed } from '@/hooks/useSessionSeed'
import { seededIndex } from '@/lib/random'

export default function TileImage({ images, salt }: { images: string[]; salt: string }) {
  const seed = useSessionSeed()
  const [skipped, setSkipped] = useState(0)
  const [loaded, setLoaded] = useState(false)

  if (!seed || images.length === 0 || skipped >= images.length) return null
  const src = images[(seededIndex(images.length, seed, salt) + skipped) % images.length]

  return (
    <Image
      key={src}
      src={src}
      alt=""
      fill
      unoptimized
      sizes="(min-width: 768px) 50vw, 100vw"
      onLoad={() => setLoaded(true)}
      onError={() => {
        setLoaded(false)
        setSkipped((n) => n + 1)
      }}
      className={`object-cover transition-all duration-700 ease-out group-hover:scale-105 ${loaded ? 'opacity-100' : 'opacity-0'}`}
    />
  )
}
