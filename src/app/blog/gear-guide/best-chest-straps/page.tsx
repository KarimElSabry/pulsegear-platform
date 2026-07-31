// src/app/blog/gear-guide/best-chest-straps/page.tsx

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "أفضل Chest Straps في 2026 | Pulse Gear Blog",
  description:
    "مقارنة شاملة لأفضل Heart Rate Chest Straps في 2026، من الـ Budget للـ Pro Level.",
  openGraph: {
    title: "أفضل Chest Straps في 2026",
    description:
      "مقارنة شاملة لأفضل Heart Rate Chest Straps في 2026، من الـ Budget للـ Pro Level.",
    type: "article",
  },
};

const straps = [
  {
    rank: 1,
    badge: "🥇 Best Overall",
    badgeColor: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
    name: "Polar H10",
    tagline: "الـ Gold Standard في الدقة",
    color: "border-yellow-500/30 bg-yellow-500/5",
    nameColor: "text-yellow-400",
    price: "~$100",
    priceNote: "الأعلى سعراً، يستاهل",
    specs: [
      { label: "Battery Life", value: "400 ساعة" },
      { label: "Connectivity", value: "Dual BLE + ANT+" },
      { label: "Waterproof", value: "IPX7 — 30m" },
      { label: "Memory", value: "Session واحدة بدون Watch" },
      { label: "Compatibility", value: "Garmin والـ Polar والـ Wahoo والـ Zwift وكل حاجة" },
    ],
    pros: [
      "الأدق في السوق، دقة طبية ECG-Level",
      "بيتوصل بجهازين في نفس الوقت",
      "بيحفظ Session واحدة من غير Watch",
      "مريح جداً مع الـ Soft Strap",
      "Compatible مع كل الـ Apps والـ Devices",
    ],
    cons: [
      "السعر عالي شوية",
      "محتاج تبلله قبل اللبس",
      "مفيش Running Dynamics",
    ],
    verdict:
      "لو عايز أدق Chest Strap في السوق بدون نقاش، ده هو. الـ Polar H10 هو الـ Reference Device اللي بيستخدمه الباحثين والـ Elite Athletes.",
  },
  {
    rank: 2,
    badge: "🥈 Best for Garmin Users",
    badgeColor: "text-blue-400 bg-blue-400/10 border-blue-400/30",
    name: "Garmin HRM-Pro Plus",
    tagline: "Running Dynamics + دقة عالية",
    color: "border-blue-500/30 bg-blue-500/5",
    nameColor: "text-blue-400",
    price: "~$130",
    priceNote: "الأغلى، بس فيه Features مش موجودة في غيره",
    specs: [
      { label: "Battery Life", value: "500 ساعة" },
      { label: "Connectivity", value: "ANT+ + BLE" },
      { label: "Waterproof", value: "IPX7" },
      { label: "Running Dynamics", value: "✅ Cadence والـ GCT والـ Stride والـ Power" },
      { label: "Memory", value: "بيحفظ بدون Watch" },
    ],
    pros: [
      "Running Dynamics كاملة، Cadence والـ Ground Contact Time والـ Stride Length",
      "Running Power بدون Footpod",
      "Battery أطول من الـ H10",
      "بيشتغل بدون Watch ويحفظ البيانات",
      "Integration ممتاز مع Garmin Connect",
    ],
    cons: [
      "الأغلى في القايمة",
      "الـ Running Dynamics بتشتغل بس مع Garmin Watches",
      "مش الأدق مقارنة بالـ H10 في الـ Accuracy",
    ],
    verdict:
      "لو عندك Garmin Watch وبتجري بجدية، ده الـ Strap المثالي ليك. الـ Running Dynamics هتغير طريقة تدريبك خالص.",
  },
  {
    rank: 3,
    badge: "🥉 Best Value",
    badgeColor: "text-green-400 bg-green-400/10 border-green-400/30",
    name: "Wahoo TICKR X",
    tagline: "أفضل قيمة مقابل السعر",
    color: "border-green-500/30 bg-green-500/5",
    nameColor: "text-green-400",
    price: "~$80",
    priceNote: "سعر ممتاز لـ Features قوية",
    specs: [
      { label: "Battery Life", value: "500 ساعة" },
      { label: "Connectivity", value: "Dual BLE + ANT+" },
      { label: "Waterproof", value: "IPX7" },
      { label: "Memory", value: "16 ساعة بدون Watch" },
      { label: "Motion Data", value: "✅ Cadence والـ Reps والـ Steps" },
    ],
    pros: [
      "بيتوصل بـ 3 أجهزة في نفس الوقت",
      "Memory 16 ساعة، الأكبر في القايمة",
      "Motion Data للـ Gym والـ Running",
      "Compatible مع كل الـ Platforms",
      "سعر أقل من الـ H10 والـ HRM-Pro",
    ],
    cons: [
      "الـ App مش بالجودة دي",
      "الـ Strap ممكن يبقى أقل راحة من الـ H10",
      "الـ Accuracy أقل شوية من الـ H10",
    ],
    verdict:
      "لو مش Garmin User وعايز Chest Strap قوي بسعر معقول، الـ TICKR X هو الاختيار الأذكى.",
  },
  {
    rank: 4,
    badge: "💰 Best Budget",
    badgeColor: "text-orange-400 bg-orange-400/10 border-orange-400/30",
    name: "Polar H9",
    tagline: "أفضل Chest Strap للمبتدئين",
    color: "border-orange-500/30 bg-orange-500/5",
    nameColor: "text-orange-400",
    price: "~$60",
    priceNote: "أرخص Chest Strap موثوق في السوق",
    specs: [
      { label: "Battery Life", value: "400 ساعة" },
      { label: "Connectivity", value: "BLE + ANT+" },
      { label: "Waterproof", value: "IPX7" },
      { label: "Memory", value: "❌ مفيش" },
      { label: "Compatibility", value: "كل الـ Apps الكبيرة" },
    ],
    pros: [
      "سعر ممتاز للـ Accuracy اللي بيديها",
      "نفس جودة الـ H10 في الـ Accuracy الأساسية",
      "خفيف ومريح",
      "Compatible مع Garmin والـ Wahoo والـ Zwift",
    ],
    cons: [
      "مفيش Memory، محتاج Watch أو Phone دايماً",
      "BLE واحد بس، مش بيتوصل بجهازين",
      "مفيش Running Dynamics",
    ],
    verdict:
      "لو بتبدأ وعايز Chest Strap موثوق بأقل سعر ممكن، الـ H9 هو الاختيار الصح. نفس الدقة وأقل Features.",
  },
];

const quickPick = [
  { need: "أدق Chest Strap بدون نقاش", pick: "Polar H10", icon: "🎯" },
  { need: "عندي Garmin Watch وبتجري بجدية", pick: "Garmin HRM-Pro Plus", icon: "🏃" },
  { need: "عايز أفضل قيمة مقابل السعر", pick: "Wahoo TICKR X", icon: "💡" },
  { need: "بتبدأ وميزانيتي محدودة", pick: "Polar H9", icon: "💰" },
];

const relatedPosts = [
  { slug: "gear-guide/best-gps-watches", emoji: "⌚", title: "أفضل GPS Watches في 2026", tag: "Gear Guide" },
  { slug: "heart-rate-strap-vs-optical", emoji: "⚡", title: "Chest Strap vs Optical: أيهما أدق؟", tag: "Gear Review" },
  { slug: "zone-2-training", emoji: "🫀", title: "Zone 2 Training: سر الـ Elite Athletes", tag: "Training Guide" },
];

export default function BestChestStrapsPage() {
  return (
    <main className="w-full bg-zinc-950 min-h-screen text-white">

      {/* ===== HERO ===== */}
      <section className="w-full border-b border-zinc-800 py-20 px-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">

          <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wide">
            <Link href="/" className="hover:text-white transition-colors duration-200">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-white transition-colors duration-200">Blog</Link>
            <span>/</span>
            <Link href="/blog/gear-guide" className="hover:text-white transition-colors duration-200">Gear Guide</Link>
            <span>/</span>
            <span className="text-zinc-400">Best Chest Straps</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wide text-red-500 bg-red-500/10 px-3 py-1 rounded-full">
              Gear Guide
            </span>
            <span className="text-xs font-bold uppercase tracking-wide text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full">
              🗓️ Updated 2026
            </span>
          </div>

          {/* ✅ Title — Arabic subtitle no dash */}
          <h1 className="text-4xl md:text-5xl font-black uppercase leading-tight">
            أفضل Chest Straps 🫀
            <br />
            <span className="text-red-500">في 2026، مقارنة شاملة</span>
          </h1>

          {/* ✅ dir="rtl" + no dashes */}
          <p className="text-lg text-zinc-400 leading-relaxed" dir="rtl">
            اخترنا أفضل 4 Chest Straps في السوق دلوقتي،
            بناءً على الدقة والراحة والـ Features والسعر.
            مفيش Bias ومفيش إعلانات، بس الحقيقة. 🎯
          </p>

          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span>⏱ 7 min read</span>
            <span>•</span>
            <span>🫀 Gear Guide</span>
            <span>•</span>
            <span>Pulse Gear Egypt</span>
          </div>

        </div>
      </section>

      <article className="max-w-3xl mx-auto px-6 py-16 flex flex-col gap-16">

        {/* ===== QUICK PICKS ===== */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-black uppercase text-white">
            اختار بسرعة ⚡
          </h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-3">
            {quickPick.map((item) => (
              <div
                key={item.need}
                className="flex items-center gap-4 border-b border-zinc-800 last:border-b-0 pb-3 last:pb-0"
              >
                <span className="text-xl shrink-0">{item.icon}</span>
                <p className="text-sm text-zinc-400 flex-1" dir="rtl">{item.need}</p>
                <span className="text-sm font-black text-white shrink-0">→ {item.pick}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ===== STRAPS ===== */}
        <section className="flex flex-col gap-8">
          <h2 className="text-2xl font-black uppercase text-white">
            المراجعة التفصيلية 🔍
          </h2>

          {straps.map((strap) => (
            <div
              key={strap.name}
              className={`border rounded-2xl overflow-hidden ${strap.color}`}
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <span className={`text-3xl font-black ${strap.nameColor}`}>
                    #{strap.rank}
                  </span>
                  <div>
                    <p className={`font-black uppercase text-lg ${strap.nameColor}`}>
                      {strap.name}
                    </p>
                    <p className="text-xs text-zinc-500" dir="rtl">{strap.tagline}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold uppercase tracking-wide border px-3 py-1 rounded-full ${strap.badgeColor}`}>
                    {strap.badge}
                  </span>
                  <span className="text-sm font-black text-white">{strap.price}</span>
                </div>
              </div>

              {/* Specs */}
              <div className="px-6 py-5 border-b border-zinc-800">
                <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 mb-3">
                  المواصفات
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {strap.specs.map((spec) => (
                    <div
                      key={spec.label}
                      className="flex items-center justify-between bg-zinc-900/60 rounded-xl px-4 py-2"
                    >
                      <span className="text-xs text-zinc-500">{spec.label}</span>
                      <span className="text-xs font-bold text-white" dir="rtl">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pros & Cons */}
              <div className="grid grid-cols-1 md:grid-cols-2 border-b border-zinc-800">
                <div className="px-6 py-5 border-b md:border-b-0 md:border-l border-zinc-800">
                  <p className="text-xs font-bold uppercase tracking-wide text-green-400 mb-3">
                    ✅ المميزات
                  </p>
                  <div className="flex flex-col gap-2">
                    {strap.pros.map((pro) => (
                      <div key={pro} className="flex items-start gap-2">
                        <span className="text-green-400 text-xs shrink-0 mt-0.5">+</span>
                        <p className="text-xs text-zinc-300 leading-relaxed" dir="rtl">{pro}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="px-6 py-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-red-400 mb-3">
                    ❌ العيوب
                  </p>
                  <div className="flex flex-col gap-2">
                    {strap.cons.map((con) => (
                      <div key={con} className="flex items-start gap-2">
                        <span className="text-red-400 text-xs shrink-0 mt-0.5">−</span>
                        <p className="text-xs text-zinc-300 leading-relaxed" dir="rtl">{con}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Verdict */}
              <div className="px-6 py-5 flex items-start gap-3">
                <span className="text-xl shrink-0">💬</span>
                <p className="text-sm text-zinc-300 leading-relaxed" dir="rtl">
                  {strap.verdict}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* ===== CTA ===== */}
        <section className="bg-gradient-to-br from-red-600/20 to-zinc-900 border border-red-500/20 rounded-2xl p-8 flex flex-col gap-4 items-center text-center">
          <span className="text-4xl">🛒</span>
          <h3 className="text-xl font-black uppercase text-white">
            لاقي الـ Chest Strap المناسب ليك
          </h3>
          <p className="text-zinc-400 text-sm max-w-md leading-relaxed" dir="rtl">
            كل المنتجات اللي اتكلمنا عنها متاحة عندنا في Pulse Gear،
            مع ضمان الأصالة والشحن لكل مصر.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/products"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wide transition-colors duration-200"
            >
              Browse Chest Straps
            </Link>
            <Link
              href="/request-product"
              className="border border-zinc-600 text-zinc-300 hover:border-white hover:text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wide transition-colors duration-200"
            >
              Request a Product
            </Link>
          </div>
        </section>

        {/* ===== RELATED ===== */}
        <section className="flex flex-col gap-6">
          <h2 className="text-xl font-black uppercase text-white">اقرأ كمان 📚</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col gap-3 bg-zinc-900 border border-zinc-800 hover:border-red-600 rounded-2xl p-5 transition-all duration-300"
              >
                <span className="text-3xl">{post.emoji}</span>
                <span className="text-xs font-bold uppercase tracking-wide text-red-500">
                  {post.tag}
                </span>
                <h3 className="text-sm font-black uppercase text-white leading-tight group-hover:text-red-400 transition-colors duration-200" dir="rtl">
                  {post.title}
                </h3>
                <span className="text-xs text-red-500 font-semibold">اقرأ المقال →</span>
              </Link>
            ))}
          </div>
        </section>

        <div className="flex justify-center pt-4">
          <Link
            href="/blog"
            className="border border-zinc-700 hover:border-white text-zinc-400 hover:text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wide transition-all duration-200"
          >
            ← Back to Blog
          </Link>
        </div>

      </article>
    </main>
  );
}