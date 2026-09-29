// src/components/blog/PostCover.tsx
// Generated cover art for a post: a topic glyph on a branded gradient with a grid texture.
// Always matches the article, never a broken or off-topic photo, and needs no image files.
import { getPost, type Post, type PostCategory } from '@/content/posts'

type Glyph = 'pulse' | 'bars' | 'moon' | 'metronome' | 'watch' | 'chat' | 'shoe' | 'scale' | 'book'

const BY_SLUG: Record<string, Glyph> = {
  'training-guide/heart-rate-zones': 'bars',
  'training-guide/zone-2-training': 'pulse',
  'training-guide/sleep-recovery': 'moon',
  'training-guide/running-cadence': 'metronome',
  'training-guide/complete-training-setup': 'watch',
  'training-guide/claude-kailo-free-running-coach': 'chat',
  'training-guide/claude-ai-running-coach-setup': 'chat',
  'training-guide/claude-coach-watch-telegram': 'chat',
  'gear-guide/beginners-guide': 'book',
  'gear-guide/best-heart-rate-monitors': 'pulse',
  'gear-guide/best-gps-watches': 'watch',
  'gear-guide/best-chest-straps': 'pulse',
  'gear-guide/budget-vs-premium': 'scale',
  'gear-review/heart-rate-strap-vs-optical': 'pulse',
  'gear-review/garmin-vs-polar': 'watch',
  'gear-review/running-shoes-guide': 'shoe',
}

const FALLBACK: Record<PostCategory, Glyph> = {
  'training-guide': 'pulse',
  'gear-guide': 'watch',
  'gear-review': 'scale',
}

const TONE: Record<PostCategory, string> = {
  'training-guide': 'from-brand/45 via-surface-2 to-surface-2 text-brand-soft',
  'gear-guide': 'from-accent/40 via-surface-2 to-surface-2 text-accent-soft',
  'gear-review': 'from-sky-500/35 via-surface-2 to-surface-2 text-sky-400',
}

const PATHS: Record<Glyph, React.ReactNode> = {
  pulse: <path d="M4 34h14l6-18 10 34 8-24 5 8h13" />,
  bars: (
    <>
      <path d="M12 52V42" opacity=".45" />
      <path d="M24 52V32" opacity=".6" />
      <path d="M36 52V22" opacity=".8" />
      <path d="M48 52V10" />
    </>
  ),
  moon: <path d="M42 8a24 24 0 1 0 14 40A20 20 0 0 1 42 8Z" />,
  metronome: (
    <>
      <path d="M20 56h24l-8-46h-8L20 56Z" />
      <path d="M32 44 44 18" />
      <path d="M28 30h10" />
    </>
  ),
  watch: (
    <>
      <circle cx="32" cy="32" r="14" />
      <path d="M25 18l2-10h10l2 10M25 46l2 10h10l2-10" />
      <path d="M32 25v7l5 3" />
    </>
  ),
  chat: (
    <>
      <path d="M8 12h48v30H26L14 52V42H8V12Z" />
      <path d="M21 27h.01M32 27h.01M43 27h.01" strokeWidth="5" />
    </>
  ),
  shoe: (
    <>
      <path d="M6 44V30l10-4 6 8 12 2c10 2 20 4 24 12v0H6Z" />
      <path d="M6 52h52" />
      <path d="M22 34l4-6" />
    </>
  ),
  scale: (
    <>
      <path d="M32 8v44M16 54h32M12 16h40" />
      <path d="M12 16 5 34h14L12 16Zm40 0-7 18h14L52 16Z" />
    </>
  ),
  book: (
    <>
      <path d="M8 12h20a6 6 0 0 1 6 6v34a4 4 0 0 0-4-4H8V12Z" />
      <path d="M56 12H36a6 6 0 0 0-6 6v34a4 4 0 0 1 4-4h22V12Z" />
    </>
  ),
}

export default function PostCover({ post, className = '' }: { post: Post | string; className?: string }) {
  const p = typeof post === 'string' ? getPost(post) : post
  if (!p) return null
  const glyph = BY_SLUG[p.slug] ?? FALLBACK[p.category]
  return (
    <div className={`absolute inset-0 overflow-hidden bg-gradient-to-br ${TONE[p.category]} ${className}`} aria-hidden="true">
      <div className="bg-grid absolute inset-0 opacity-70" />
      <svg
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute -bottom-6 -right-4 h-[88%] w-auto opacity-30 transition-transform duration-700 group-hover:scale-105"
      >
        {PATHS[glyph]}
      </svg>
    </div>
  )
}
