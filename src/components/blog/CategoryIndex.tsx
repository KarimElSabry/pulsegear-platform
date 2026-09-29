// src/components/blog/CategoryIndex.tsx
// Shared page body for /blog/<category>. Reads everything from the registry.
import { getPostsByCategory, type PostCategory, CATEGORY_LABEL } from '@/content/posts'
import PostCard from './PostCard'

const INTRO: Record<PostCategory, { titleAr: string; body: string }> = {
  'training-guide': {
    titleAr: 'اتدرب أذكى، مش أصعب',
    body: 'Heart rate zones, Zone 2, recovery, cadence and the AI coach setups. The science, explained for runners in Egypt.',
  },
  'gear-guide': {
    titleAr: 'اختار الـ Gear الصح لمستواك وميزانيتك',
    body: 'Buying guides for GPS watches, chest straps and accessories, with honest picks by budget.',
  },
  'gear-review': {
    titleAr: 'مقارنات صريحة قبل ما تدفع',
    body: 'Head-to-head comparisons and reviews: brands, sensors, shoes. What actually matters on the road.',
  },
}

export default function CategoryIndex({ category }: { category: PostCategory }) {
  const items = getPostsByCategory(category)
  const featured = items.find((p) => p.pillar) ?? items[0]
  const rest = items.filter((p) => p !== featured)
  const intro = INTRO[category]
  return (
    <div className="container-x py-14 md:py-20">
      <header className="mb-12 max-w-3xl">
        <span className="eyebrow">{CATEGORY_LABEL[category]}</span>
        <h1 className="mt-3 text-4xl font-black uppercase leading-[1.05] tracking-tight text-white md:text-5xl">
          {CATEGORY_LABEL[category]}
        </h1>
        <p className="mt-2 text-xl font-bold text-brand-soft" dir="rtl">{intro.titleAr}</p>
        <p className="mt-4 text-muted-strong">{intro.body}</p>
        <p className="mt-2 text-xs text-muted">{items.length} articles</p>
      </header>
      {featured && (
        <div className="mb-6">
          <PostCard post={featured} featured />
        </div>
      )}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((p) => (
          <PostCard key={p.slug} post={p} />
        ))}
      </div>
    </div>
  )
}
