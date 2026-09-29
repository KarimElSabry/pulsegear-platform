// src/content/posts.ts
// Single registry of blog posts. The homepage teasers, /blog index,
// sitemap and JSON-LD should all read from here so a slug is never
// typed twice. `slug` is the path under /blog.

export type PostCategory = 'training-guide' | 'gear-guide' | 'gear-review'

export interface Post {
  slug: string
  category: PostCategory
  title: string
  titleAr?: string
  excerpt: string
  readTime: string
  updated: string // ISO date, shown as "Updated" and used in JSON-LD
  featured?: boolean
  pillar?: boolean
}

export const CATEGORY_LABEL: Record<PostCategory, string> = {
  'training-guide': 'Training Guide',
  'gear-guide': 'Gear Guide',
  'gear-review': 'Gear Review',
}

export const posts: Post[] = [
  {
    slug: 'training-guide/claude-kailo-free-running-coach',
    category: 'training-guide',
    title: 'Free AI Running Coach: Connect Claude to Kailo in 10 Minutes',
    titleAr: 'كوتش جري بالـ AI ببلاش: وصّل Claude بـ Kailo في 10 دقايق',
    excerpt: 'Zero cost, nothing to install: Kailo reads your Garmin, Claude builds your dashboard and plan. The free Level 1, verified September 2026.',
    readTime: '9 min',
    updated: '2026-09-29',
    featured: true,
    pillar: true,
  },
  {
    slug: 'training-guide/heart-rate-zones',
    category: 'training-guide',
    title: 'Heart Rate Zones: Train Smart, Not Hard',
    titleAr: 'اتدرب بذكاء مش بتعب: Heart Rate Zones',
    pillar: true,
    excerpt: 'How the five heart rate zones work and how to use them to get more out of every session.',
    readTime: '5 min',
    updated: '2026-09-29',
    featured: true,
  },
  {
    slug: 'training-guide/zone-2-training',
    category: 'training-guide',
    title: 'Zone 2 Training: The Secret of Elite Athletes',
    titleAr: 'سر الـ Elite Athletes: Zone 2 Training',
    pillar: true,
    excerpt: 'Why elite runners spend 80% of their time in Zone 2, and how to build the same base.',
    readTime: '6 min',
    updated: '2026-09-29',
    featured: true,
  },
  {
    slug: 'training-guide/sleep-recovery',
    category: 'training-guide',
    title: 'Sleep & Recovery: The Part of Training You Ignore',
    titleAr: 'الجزء اللي بتتجاهله في تدريبك: Sleep & Recovery',
    excerpt: 'Why sleep and recovery decide whether your training actually makes you faster.',
    readTime: '8 min',
    updated: '2026-09-29',
  },
  {
    slug: 'training-guide/running-cadence',
    category: 'training-guide',
    title: 'Running Cadence: Why 180 Steps Per Minute Matters',
    titleAr: 'Running Cadence: ليه الـ 180 Steps/Min مهمة؟',
    excerpt: 'What cadence is, why it protects you from injury, and how to raise it gradually.',
    readTime: '6 min',
    updated: '2026-09-29',
  },
  {
    slug: 'training-guide/complete-training-setup',
    category: 'training-guide',
    title: 'Complete Training Setup 2026',
    titleAr: 'الـ Training Setup الكامل 2026',
    excerpt: 'Watch, strap, apps and a plan: the full setup for structured training this year.',
    readTime: '9 min',
    updated: '2026-09-29',
  },
  {
    slug: 'training-guide/claude-ai-running-coach-setup',
    category: 'training-guide',
    title: 'Let Claude AI Read Your Workouts Every Day',
    titleAr: 'خلي Claude AI يقرأ تمرينك كل يوم لوحده',
    excerpt: 'Step by step: connect your watch data to Claude and get a daily coaching summary.',
    readTime: '12 min',
    updated: '2026-09-29',
  },
  {
    slug: 'training-guide/claude-coach-watch-telegram',
    category: 'training-guide',
    title: 'Claude Coach on Your Watch and Telegram',
    titleAr: 'خلي Claude يبعت تمرينك على ساعتك ويكلمك على Telegram',
    excerpt: 'Push workouts to your watch and chat with your AI coach on Telegram. Full setup.',
    readTime: '15 min',
    updated: '2026-09-29',
  },
  {
    slug: 'gear-guide/beginners-guide',
    category: 'gear-guide',
    title: "Beginner's Gear Guide 2026",
    titleAr: 'دليل الـ Gear للمبتدئين 2026',
    pillar: true,
    excerpt: 'You do not need everything on day one. What you actually need and how to start cheap.',
    readTime: '10 min',
    updated: '2026-09-29',
    featured: true,
  },
  {
    slug: 'gear-guide/best-heart-rate-monitors',
    category: 'gear-guide',
    title: 'Best Heart Rate Monitors 2026',
    titleAr: 'أفضل Heart Rate Monitors 2026',
    pillar: true,
    excerpt: 'The straps and armbands that are worth your money this year, by budget and use case.',
    readTime: '8 min',
    updated: '2026-09-29',
  },
  {
    slug: 'gear-guide/best-gps-watches',
    category: 'gear-guide',
    title: 'Best GPS Watches for Runners 2026',
    titleAr: 'أفضل GPS Watches للـ Runners 2026',
    excerpt: 'From entry level to multisport: which GPS watch fits your goals and budget.',
    readTime: '9 min',
    updated: '2026-09-29',
  },
  {
    slug: 'gear-guide/best-chest-straps',
    category: 'gear-guide',
    title: 'Best Chest Straps 2026',
    titleAr: 'أفضل Chest Straps في 2026',
    excerpt: 'Accuracy, comfort, battery and price compared across the straps we sell most.',
    readTime: '7 min',
    updated: '2026-09-29',
  },
  {
    slug: 'gear-guide/budget-vs-premium',
    category: 'gear-guide',
    title: 'Budget vs Premium Gear',
    titleAr: 'Budget vs Premium: إمتى تدفع أكتر؟',
    excerpt: 'Where paying more actually buys performance, and where it does not.',
    readTime: '6 min',
    updated: '2026-09-29',
  },
  {
    slug: 'gear-review/heart-rate-strap-vs-optical',
    category: 'gear-review',
    title: 'Heart Rate Strap vs Optical: Which Is More Accurate?',
    titleAr: 'Heart Rate Strap vs Optical: أيهما أدق؟',
    pillar: true,
    excerpt: 'Chest straps and wrist sensors compared on accuracy, comfort and price.',
    readTime: '5 min',
    updated: '2026-09-29',
    featured: true,
  },
  {
    slug: 'gear-review/garmin-vs-polar',
    category: 'gear-review',
    title: 'Garmin vs Polar: Which Is Right for You?',
    titleAr: 'Garmin vs Polar: أنهي الأحسن ليك؟',
    excerpt: 'Two ecosystems, two philosophies. How to choose between them.',
    readTime: '7 min',
    updated: '2026-09-29',
  },
  {
    slug: 'gear-review/running-shoes-guide',
    category: 'gear-review',
    title: 'Running Shoes Guide 2026',
    titleAr: 'دليل الـ Running Shoes 2026',
    excerpt: 'Daily trainers, tempo shoes and race day plates explained.',
    readTime: '8 min',
    updated: '2026-09-29',
  },
]

export const categoryIndexes: { slug: string; title: string }[] = [
  { slug: 'training-guide', title: 'Training Guide' },
  { slug: 'gear-guide', title: 'Gear Guide' },
  { slug: 'gear-review', title: 'Gear Reviews' },
]

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug)
}

export function getPostsByCategory(category: PostCategory): Post[] {
  return posts.filter((p) => p.category === category)
}

export function getLatestPosts(limit = 3): Post[] {
  const featured = posts.filter((p) => p.featured)
  return (featured.length >= limit ? featured : posts).slice(0, limit)
}

export function postHref(post: Post): string {
  return `/blog/${post.slug}`
}
