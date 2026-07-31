// src/app/blog/BlogClient.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

const allPosts = [
  {
    slug: "heart-rate-zones",
    emoji: "📊",
    tag: "Training Guide",
    title: "Heart Rate Zones: اتدرب بذكاء مش بتعب",
    desc: "اعرف إزاي الـ 5 Heart Rate Zones بتشتغل وإزاي تستخدمهم عشان تستفيد من كل Training Session.",
    readTime: "5 min read",
    featured: true,
  },
  {
    slug: "zone-2-training",
    emoji: "🫀",
    tag: "Training Guide",
    title: "Zone 2 Training: سر الـ Elite Athletes",
    desc: "ليه الـ Elite Athletes بيقضوا 80% من تدريبهم في Zone 2 وإزاي تعمل زيهم.",
    readTime: "6 min read",
    featured: false,
  },
  {
    slug: "heart-rate-strap-vs-optical",
    emoji: "⚡",
    tag: "Gear Review",
    title: "Heart Rate Strap vs Optical: أيهما أدق؟",
    desc: "مقارنة تفصيلية بين الـ Chest Strap والـ Optical Sensor في الدقة والراحة والسعر.",
    readTime: "5 min read",
    featured: false,
  },
  {
    slug: "garmin-vs-polar",
    emoji: "🥊",
    tag: "Gear Review",
    title: "Garmin vs Polar: أنهي الأحسن ليك؟",
    desc: "مقارنة شاملة بين Garmin وPolar في الـ GPS والـ HR والـ Battery وأنهي يناسب تدريبك.",
    readTime: "7 min read",
    featured: false,
  },
];

const tags = ["All", "Training Guide", "Gear Review"];

export default function BlogClient() {
  const [activeTag, setActiveTag] = useState("All");

  const filteredPosts =
    activeTag === "All"
      ? allPosts
      : allPosts.filter((p) => p.tag === activeTag);

  const featuredPost = filteredPosts.find((p) => p.featured);
  const restPosts = filteredPosts.filter((p) => !p.featured);

  return (
    <>
      {/* Tags Filter — LTR لأن الـ tags كلها English */}
      <div dir="ltr" className="flex flex-wrap gap-2 mt-4">
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

      <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col gap-16">

        {/* ===== FEATURED POST ===== */}
        {featuredPost && (
          <section className="flex flex-col gap-4">
            {/* Label — LTR لأنه English */}
            <span dir="ltr" className="text-xs font-bold uppercase tracking-widest text-zinc-500">
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

              {/* Content — RTL لأن الـ title والـ desc عربي */}
              <div className="flex flex-col gap-4 justify-center" dir="rtl">
                {/* Tag + Read Time row — نعكسها LTR جوه الـ RTL container */}
                <div className="flex items-center justify-between" dir="ltr">
                  <span className="text-xs font-bold uppercase tracking-wide text-red-500 bg-red-500/10 px-3 py-1 rounded-full">
                    {featuredPost.tag}
                  </span>
                  <span className="text-xs text-zinc-500">{featuredPost.readTime}</span>
                </div>

                <h2 className="text-2xl md:text-3xl font-black uppercase leading-tight text-white group-hover:text-red-400 transition-colors duration-200">
                  {featuredPost.title}
                </h2>

                <p className="text-zinc-400 leading-relaxed text-sm">
                  {featuredPost.desc}
                </p>

                {/* CTA arrow — LTR عشان السهم يبقى صح */}
                <div dir="ltr" className="flex items-center gap-2 text-sm font-semibold text-red-500 group-hover:gap-3 transition-all duration-200 mt-2">
                  <span>اقرأ المقال</span>
                  <span>→</span>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* ===== ALL POSTS GRID ===== */}
        {restPosts.length > 0 && (
          <section className="flex flex-col gap-6">
            <h2 className="text-xl font-black uppercase text-white">
              كل المقالات 📖
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {restPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  // ✅ dir="rtl" على الـ card كلها
                  dir="rtl"
                  className="group flex flex-col gap-4 bg-zinc-900 border border-zinc-800 hover:border-red-600 rounded-2xl p-6 transition-all duration-300 h-full"
                >
                  <span className="text-4xl">{post.emoji}</span>

                  {/* Tag + ReadTime — LTR جوه الـ RTL card */}
                  <div dir="ltr" className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wide text-red-500 bg-red-500/10 px-3 py-1 rounded-full">
                      {post.tag}
                    </span>
                    <span className="text-xs text-zinc-500">{post.readTime}</span>
                  </div>

                  <h3 className="text-lg font-black uppercase leading-tight text-white group-hover:text-red-400 transition-colors duration-200">
                    {post.title}
                  </h3>

                  <p className="text-sm text-zinc-400 leading-relaxed flex-1">
                    {post.desc}
                  </p>

                  {/* CTA arrow — LTR عشان السهم يبقى صح */}
                  <div dir="ltr" className="flex items-center gap-2 text-sm font-semibold text-red-500 group-hover:gap-3 transition-all duration-200">
                    <span>اقرأ المقال</span>
                    <span>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ===== EMPTY STATE ===== */}
        {filteredPosts.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <span className="text-6xl">🔍</span>
            <p className="text-zinc-400 text-sm" dir="rtl">
              مفيش مقالات في الـ Category دي دلوقتي، هتتضاف قريباً!
            </p>
          </div>
        )}

        {/* ===== COMING SOON ===== */}
        <section className="flex flex-col gap-6">
          {/* ✅ heading — RTL عشان فيه عربي */}
          <h2 className="text-xl font-black uppercase text-white" dir="rtl">
            قريباً على الـ Blog 👀
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                emoji: "🏃",
                title: "Running Cadence: ليه الـ 180 Steps/Min مهمة؟",
                tag: "Training Guide",
              },
              {
                emoji: "😴",
                title: "Sleep & Recovery: الجزء اللي بتتجاهله في تدريبك",
                tag: "Training Guide",
              },
              {
                emoji: "👟",
                title: "Running Shoes Guide: إزاي تختار الجزمة الصح؟",
                tag: "Gear Review",
              },
            ].map((post, i) => (
              // ✅ dir="rtl" على الـ card كلها — ده اللي كان ناقص!
              <div
                key={i}
                dir="rtl"
                className="flex flex-col gap-4 bg-zinc-900/50 border border-zinc-800 border-dashed rounded-2xl p-6 opacity-60"
              >
                <span className="text-4xl">{post.emoji}</span>

                {/* Tag — LTR لأنه English */}
                <span dir="ltr" className="text-xs font-bold uppercase tracking-wide text-zinc-500 bg-zinc-800 px-3 py-1 rounded-full self-start">
                  {post.tag}
                </span>

                {/* ✅ Title — RTL مش محتاج dir هنا لأن الـ parent عنده dir="rtl" */}
                <h3 className="text-lg font-black uppercase leading-tight text-zinc-500">
                  {post.title}
                </h3>

                {/* Coming Soon — LTR */}
                <span dir="ltr" className="text-xs font-bold uppercase tracking-wide text-zinc-600">
                  🔒 Coming Soon
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="bg-gradient-to-br from-red-600/20 to-zinc-900 border border-red-500/20 rounded-2xl p-10 flex flex-col gap-4 items-center text-center">
          <span className="text-4xl">🏃</span>
          <h3 className="text-2xl font-black uppercase text-white">
            جاهز تبدأ تتدرب صح؟
          </h3>
          <p className="text-zinc-400 text-sm max-w-md leading-relaxed" dir="rtl">
            الـ Knowledge مهم بس الـ Gear الصح هو اللي بيخليك تطبق كل ده.
            شوف مجموعتنا من الـ Running Watches والـ Heart Rate Monitors.
          </p>
          {/* Buttons — LTR */}
          <div dir="ltr" className="flex flex-wrap gap-3 justify-center mt-2">
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
    </>
  );
}