// src/app/blog/gear-review/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gear Reviews",
  description:
    "مراجعات تفصيلية لأفضل أجهزة الـ Running: Garmin vs Polar, Chest Strap vs Optical, وأكتر.",
};

const reviews = [
  {
    slug: "heart-rate-strap-vs-optical",
    emoji: "⚡",
    title: "أيهما أدق؟: Heart Rate Strap vs Optical",
    desc: "مقارنة تفصيلية بين الـ Chest Strap والـ Optical Sensor في الدقة والراحة والسعر.",
    readTime: "5 min read",
    badge: "Most Popular",
    badgeColor: "text-red-400 bg-red-500/10 border-red-500/20",
  },
  {
    slug: "garmin-vs-polar",
    emoji: "🥊",
    title: "أنهي الأحسن ليك؟ Garmin vs Polar",
    desc: "مقارنة شاملة بين Garmin وPolar في الـ GPS والـ HR والـ Battery وأنهي يناسب تدريبك.",
    readTime: "7 min read",
    badge: "In-Depth",
    badgeColor: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  },
  {
    slug: "running-shoes-guide",
    emoji: "👟",
    title: "إزاي تختار الجزمة الصح؟ Running Shoes Guide",
    desc: "الدليل الشامل لاختيار Running Shoes بناءً على الـ Gait والـ Terrain والـ Training Type.",
    readTime: "9 min read",
    badge: "Beginner Friendly",
    badgeColor: "text-green-400 bg-green-500/10 border-green-500/20",
  },
];

export default function GearReviewPage() {
  return (
    <div className="w-full bg-zinc-950 min-h-screen text-white">

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section className="w-full border-b border-zinc-800 py-16 px-6">
        <div className="max-w-6xl mx-auto flex flex-col gap-4">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wide">
            <Link href="/blog" className="hover:text-white transition-colors duration-200">
              Blog
            </Link>
            <span className="text-zinc-700">/</span>
            <span className="text-orange-400">Gear Review</span>
          </div>

          <span className="text-sm font-bold uppercase tracking-widest text-orange-500">
            ⭐ Gear Review
          </span>

          <h1 className="text-4xl md:text-5xl font-black uppercase leading-tight">
            <span className="block">Real Reviews.</span>
            <span className="block text-orange-500">Honest Opinions.</span>
          </h1>

          <p className="text-zinc-400 text-base max-w-xl leading-relaxed" dir="rtl">
            مراجعات حقيقية لأفضل الـ Gear، من غير مبالغة ومن غير إعلانات.
            بس الحقيقة عشان تاخد القرار الصح.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 mt-2">
            {[
              { value: `${reviews.length}`, label: "Reviews"  },
              { value: "100%",              label: "Honest"   },
              { value: "0",                 label: "Paid Ads" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <span className="text-2xl font-black text-white">{stat.value}</span>
                <span className="text-xs text-zinc-500 uppercase tracking-wide">{stat.label}</span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════
          REVIEWS GRID
      ══════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-6 py-16 flex flex-col gap-8">

        <h2 className="text-xl font-black uppercase text-white" dir="rtl">
          كل المراجعات ⭐
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <Link
              key={review.slug}
              href={`/blog/gear-review/${review.slug}`}
              className="group flex flex-col gap-4 bg-zinc-900 border border-zinc-800 hover:border-orange-500 rounded-2xl p-6 transition-all duration-300"
            >
              <span className="text-5xl">{review.emoji}</span>

              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className={`text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full border ${review.badgeColor}`}>
                  {review.badge}
                </span>
                <span className="text-xs text-zinc-500">{review.readTime}</span>
              </div>

              <h3
                className="text-lg font-black uppercase leading-tight text-white group-hover:text-orange-400 transition-colors duration-200"
                dir="rtl"
              >
                {review.title}
              </h3>

              <p className="text-sm text-zinc-400 leading-relaxed flex-1" dir="rtl">
                {review.desc}
              </p>

              <div className="flex items-center gap-2 text-sm font-semibold text-orange-500 group-hover:gap-3 transition-all duration-200">
                <span>اقرأ المراجعة</span>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>

      </section>

      {/* ══════════════════════════════════════
          CTA
      ══════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="bg-gradient-to-br from-orange-600/20 to-zinc-900 border border-orange-500/20 rounded-2xl p-10 flex flex-col gap-4 items-center text-center">
          <span className="text-4xl">🛒</span>
          <h3 className="text-2xl font-black uppercase text-white" dir="rtl">
            عجبك الـ Review؟ اشتري دلوقتي!
          </h3>
          <p className="text-zinc-400 text-sm max-w-md leading-relaxed" dir="rtl">
            كل الـ Gear اللي بنراجعه متاح عندنا بأفضل سعر في مصر.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            <Link
              href="/products"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wide transition-colors duration-200"
            >
              Browse Products
            </Link>
            <Link
              href="/blog/gear-guide"
              className="border border-zinc-600 text-zinc-300 hover:border-white hover:text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wide transition-colors duration-200"
            >
              📚 Gear Guides
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}