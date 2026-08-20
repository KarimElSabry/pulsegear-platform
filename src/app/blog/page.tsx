// src/app/blog/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */

const allPosts = [
  // ── TRAINING GUIDE ──────────────────────────
  {
    slug: "training-guide/heart-rate-zones",
    emoji: "📊",
    tag: "Training Guide",
    title: "اتدرب بذكاء مش بتعب: Heart Rate Zones",
    desc: "اعرف إزاي الـ 5 Heart Rate Zones بتشتغل وإزاي تستخدمهم عشان تستفيد من كل Training Session.",
    readTime: "5 min read",
    featured: true,
  },
  {
    slug: "training-guide/zone-2-training",
    emoji: "🫀",
    tag: "Training Guide",
    title: "سر الـ Elite Athletes: Zone 2 Training",
    desc: "ليه الـ Elite Athletes بيقضوا 80% من تدريبهم في Zone 2 وإزاي تعمل زيهم.",
    readTime: "6 min read",
    featured: false,
  },
  {
    slug: "training-guide/sleep-recovery",
    emoji: "😴",
    tag: "Training Guide",
    title: "الجزء اللي بتتجاهله في تدريبك — Sleep & Recovery",
    desc: "ليه النوم والـ Recovery هم السر الحقيقي وراء كل Athlete ناجح.",
    readTime: "8 min read",
    featured: false,
  },
  {
    slug: "training-guide/running-cadence",
    emoji: "🏃",
    tag: "Training Guide",
    title: "ليه الـ 180 Steps/Min مهمة؟ — Running Cadence",
    desc: "إزاي تحسن الـ Running Form بتاعك عن طريق الـ Cadence وتتجنب الإصابات.",
    readTime: "6 min read",
    featured: false,
  },
  {
    slug: "training-guide/complete-training-setup",
    emoji: "🔧",
    tag: "Training Guide",
    title: "Complete Training Setup — كل حاجة في مكان واحد",
    desc: "من الـ HR Zones للـ Recovery للـ Gear — الدليل الشامل لبناء Training System كامل.",
    readTime: "12 min read",
    featured: false,
  },
  {
    slug: "training-guide/claude-ai-running-coach-setup",
    emoji: "🤖",
    tag: "Training Guide",
    title: "Claude AI: كوتش جري شخصي أوتوماتيك",
    desc: "وصّل Strava أو Garmin بـ Claude AI وخلّيه يحلل تدريبك ويبني الـ Dashboard بتاعك كل يوم أوتوماتيك.",
    readTime: "15 min read",
    featured: false,
  },

  // ── GEAR GUIDE ──────────────────────────────
  {
    slug: "gear-guide/beginners-guide",
    emoji: "🌱",
    tag: "Gear Guide",
    title: "Beginner's Gear Guide 2026",
    desc: "مش محتاج تشتري كل حاجة من أول يوم. إيه اللي محتاجه فعلاً وإزاي تبدأ بأقل تكلفة.",
    readTime: "10 min read",
    featured: false,
  },
  {
    slug: "gear-guide/best-heart-rate-monitors",
    emoji: "🫀",
    tag: "Gear Guide",
    title: "Best Heart Rate Monitors 2026",
    desc: "مقارنة شاملة بين أفضل Chest Straps والـ Optical HR Monitors في السوق.",
    readTime: "8 min read",
    featured: false,
  },
  {
    slug: "gear-guide/best-gps-watches",
    emoji: "⌚",
    tag: "Gear Guide",
    title: "Best GPS Watches 2026",
    desc: "Garmin vs Coros vs Polar — أفضل GPS Watches لكل مستوى وميزانية.",
    readTime: "9 min read",
    featured: false,
  },
  {
    slug: "gear-guide/best-chest-straps",
    emoji: "📡",
    tag: "Gear Guide",
    title: "Best Chest Straps 2026",
    desc: "Polar H10 vs H9 vs Garmin HRM-Pro — أدق Chest Straps في السوق.",
    readTime: "7 min read",
    featured: false,
  },
  {
    slug: "gear-guide/budget-vs-premium",
    emoji: "💰",
    tag: "Gear Guide",
    title: "Budget vs Premium Gear",
    desc: "هل الـ Gear الغالي يستاهل فعلاً؟ مقارنة صريحة بين الـ Budget والـ Premium Options.",
    readTime: "6 min read",
    featured: false,
  },

  // ── GEAR REVIEW ─────────────────────────────
  {
    slug: "gear-review/heart-rate-strap-vs-optical",
    emoji: "⚡",
    tag: "Gear Review",
    title: "أيهما أدق؟: Heart Rate Strap vs Optical",
    desc: "مقارنة تفصيلية بين الـ Chest Strap والـ Optical Sensor في الدقة والراحة والسعر.",
    readTime: "5 min read",
    featured: false,
  },
  {
    slug: "gear-review/garmin-vs-polar",
    emoji: "🥊",
    tag: "Gear Review",
    title: "أنهي الأحسن ليك؟ Garmin vs Polar",
    desc: "مقارنة شاملة بين Garmin وPolar في الـ GPS والـ HR والـ Battery وأنهي يناسب تدريبك.",
    readTime: "7 min read",
    featured: false,
  },
  {
    slug: "gear-review/running-shoes-guide",
    emoji: "👟",
    tag: "Gear Review",
    title: "إزاي تختار الجزمة الصح؟ — Running Shoes Guide",
    desc: "الدليل الشامل لاختيار Running Shoes بناءً على الـ Gait والـ Terrain والـ Training Type.",
    readTime: "9 min read",
    featured: false,
  },
];

/* ─────────────────────────────────────────────
   TAGS
───────────────────────────────────────────── */

const tags = ["All", "Training Guide", "Gear Guide", "Gear Review"];

/* ─────────────────────────────────────────────
   TAG STYLE HELPER
───────────────────────────────────────────── */

function tagStyle(tag: string) {
  switch (tag) {
    case "Training Guide":
      return "text-purple-400 bg-purple-500/10 border border-purple-500/20";
    case "Gear Guide":
      return "text-green-400 bg-green-500/10 border border-green-500/20";
    case "Gear Review":
      return "text-orange-400 bg-orange-500/10 border border-orange-500/20";
    default:
      return "text-red-400 bg-red-500/10 border border-red-500/20";
  }
}

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */

export default function BlogPage() {
  const [activeTag, setActiveTag] = useState("All");

  const filteredPosts =
    activeTag === "All"
      ? allPosts
      : allPosts.filter((p) => p.tag === activeTag);

  const featuredPost = filteredPosts.find((p) => p.featured);
  const restPosts = filteredPosts.filter((p) => !p.featured);

  return (
    <main className="w-full bg-zinc-950 min-h-screen text-white">

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section className="w-full border-b border-zinc-800 py-20 px-6">
        <div className="max-w-6xl mx-auto flex flex-col gap-4">

          <span className="text-sm font-bold uppercase tracking-widest text-red-500">
            Pulse Gear Blog
          </span>

          <h1 className="text-5xl md:text-6xl font-black uppercase leading-tight">
            <span className="block">Train Smarter. 📚</span>
            <span className="block text-red-500">Perform Better.</span>
          </h1>

          <p className="text-zinc-400 text-lg max-w-xl leading-relaxed" dir="rtl">
            مقالات عن الـ Running والـ Training Science والـ Gear،
            كل حاجة محتاجها عشان توصل للـ Next Level
          </p>

          {/* Category Hub Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
            {[
              {
                href: "/blog/training-guide",
                icon: "📊",
                label: "Training Guide",
                desc: "HR Zones · Zone 2 · Recovery · AI Coach",
                color: "border-purple-500/30 hover:border-purple-500 text-purple-400",
              },
              {
                href: "/blog/gear-guide",
                icon: "🎒",
                label: "Gear Guide",
                desc: "GPS Watches · Chest Straps · Budget Picks",
                color: "border-green-500/30 hover:border-green-500 text-green-400",
              },
              {
                href: "/blog/gear-review",
                icon: "⭐",
                label: "Gear Review",
                desc: "Garmin vs Polar · Shoes · Strap vs Optical",
                color: "border-orange-500/30 hover:border-orange-500 text-orange-400",
              },
            ].map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className={`flex items-center gap-3 bg-zinc-900 border rounded-xl px-4 py-3 transition-colors duration-200 group ${cat.color}`}
              >
                <span className="text-xl shrink-0">{cat.icon}</span>
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-white group-hover:text-red-400 transition-colors duration-200">
                    {cat.label}
                  </p>
                  <p className="text-xs text-zinc-500">{cat.desc}</p>
                </div>
                <span className="ml-auto text-zinc-600 group-hover:text-white transition-colors duration-200 text-xs">
                  →
                </span>
              </Link>
            ))}
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mt-4">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`text-xs font-bold uppercase tracking-wide px-4 py-2 rounded-full border transition-colors duration-200 cursor-pointer ${
                  activeTag === tag
                    ? "bg-red-600 border-red-600 text-white"
                    : "border-zinc-700 text-zinc-400 hover:border-white hover:text-white"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════
          BODY
      ══════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col gap-16">

        {/* ── FEATURED POST ── */}
        {featuredPost && (
          <section className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              ⭐ Featured Article
            </span>
            <Link
              href={`/blog/${featuredPost.slug}`}
              className="group grid grid-cols-1 md:grid-cols-2 gap-8 bg-zinc-900 border border-zinc-800 hover:border-red-600 rounded-2xl p-8 transition-all duration-300"
            >
              {/* Emoji Box */}
              <div className="flex items-center justify-center bg-zinc-800 rounded-xl min-h-[200px] text-8xl">
                {featuredPost.emoji}
              </div>

              {/* Content */}
              <div className="flex flex-col gap-4 justify-center">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className={`text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full ${tagStyle(featuredPost.tag)}`}>
                    {featuredPost.tag}
                  </span>
                  <span className="text-xs text-zinc-500">{featuredPost.readTime}</span>
                </div>

                <h2 className="text-2xl md:text-3xl font-black uppercase leading-tight text-white group-hover:text-red-400 transition-colors duration-200" dir="rtl">
                  {featuredPost.title}
                </h2>

                <p className="text-zinc-400 leading-relaxed text-sm" dir="rtl">
                  {featuredPost.desc}
                </p>

                <div className="flex items-center gap-2 text-sm font-semibold text-red-500 group-hover:gap-3 transition-all duration-200 mt-2">
                  <span>اقرأ المقال</span>
                  <span>→</span>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* ── ALL POSTS GRID ── */}
        {restPosts.length > 0 && (
          <section className="flex flex-col gap-6">
            <h2 className="text-xl font-black uppercase text-white" dir="rtl">
              {activeTag === "All" ? "كل المقالات 📖" : `مقالات — ${activeTag}`}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {restPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col gap-4 bg-zinc-900 border border-zinc-800 hover:border-red-600 rounded-2xl p-6 transition-all duration-300 h-full"
                >
                  <span className="text-4xl">{post.emoji}</span>

                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className={`text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full ${tagStyle(post.tag)}`}>
                      {post.tag}
                    </span>
                    <span className="text-xs text-zinc-500">{post.readTime}</span>
                  </div>

                  <h3 className="text-lg font-black uppercase leading-tight text-white group-hover:text-red-400 transition-colors duration-200" dir="rtl">
                    {post.title}
                  </h3>

                  <p className="text-sm text-zinc-400 leading-relaxed flex-1" dir="rtl">
                    {post.desc}
                  </p>

                  <div className="flex items-center gap-2 text-sm font-semibold text-red-500 group-hover:gap-3 transition-all duration-200">
                    <span>اقرأ المقال</span>
                    <span>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── EMPTY STATE ── */}
        {filteredPosts.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <span className="text-6xl">🔍</span>
            <p className="text-zinc-400 text-sm" dir="rtl">
              مفيش مقالات في الـ Category دي دلوقتي، هتتضاف قريباً!
            </p>
          </div>
        )}

        {/* ── CTA ── */}
        <section className="bg-gradient-to-br from-red-600/20 to-zinc-900 border border-red-500/20 rounded-2xl p-10 flex flex-col gap-4 items-center text-center">
          <span className="text-4xl">🏃</span>
          <h3 className="text-2xl font-black uppercase text-white" dir="rtl">
            جاهز تبدأ تتدرب صح؟
          </h3>
          <p className="text-zinc-400 text-sm max-w-md leading-relaxed" dir="rtl">
            الـ Knowledge مهمة بس الـ Gear الصح هو اللي بيخليك تطبق كل ده.
            شوف مجموعتنا من الـ Running Watches والـ Heart Rate Monitors.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            <Link
              href="/products"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wide transition-colors duration-200"
            >
              Browse Products
            </Link>
            <Link
              href="/request-product"
              className="border border-zinc-600 text-zinc-300 hover:border-white hover:text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wide transition-colors duration-200"
            >
              Request a Product
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}