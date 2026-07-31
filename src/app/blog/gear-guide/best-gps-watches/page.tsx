// src/app/blog/gear-guide/best-gps-watches/page.tsx

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "أفضل GPS Watches للـ Athletes في 2026 | Pulse Gear Blog",
  description:
    "مقارنة شاملة لأفضل GPS Watches في 2026، من الـ Budget للـ Premium، لكل مستوى ونوع تدريب.",
  openGraph: {
    title: "أفضل GPS Watches للـ Athletes في 2026",
    description:
      "مقارنة شاملة لأفضل GPS Watches في 2026، لكل مستوى ونوع تدريب.",
    type: "article",
  },
};

const watches = [
  {
    rank: 1,
    badge: "🥇 Best Overall",
    badgeColor: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
    name: "Garmin Forerunner 965",
    tagline: "أفضل GPS Watch للـ Serious Runner",
    color: "border-yellow-500/30 bg-yellow-500/5",
    nameColor: "text-yellow-400",
    price: "~$600",
    priceNote: "Premium، يستاهل كل قرش",
    category: "Premium",
    bestFor: "Runners + Triathletes",
    specs: [
      { label: "Display", value: "AMOLED، أوضح شاشة في السوق" },
      { label: "GPS Battery", value: "31 ساعة GPS كامل" },
      { label: "Smartwatch Mode", value: "23 يوم" },
      { label: "HR Sensor", value: "Elevate v4 Optical" },
      { label: "Maps", value: "✅ Color Topo Maps" },
      { label: "Training Load", value: "✅ HRV Status + Readiness" },
    ],
    pros: [
      "AMOLED Screen، أجمل وأوضح شاشة في الـ Running Watches",
      "Training Readiness والـ HRV Status، بيقولك امتى تتدرب وامتى تريح",
      "Color Maps مدمجة",
      "Running Dynamics مع HRM-Pro Plus",
      "Triathlon Mode كامل",
      "Garmin Coach، خطط تدريب مجانية",
    ],
    cons: [
      "سعر عالي",
      "الـ Optical HR مش بديل للـ Chest Strap في الـ HIIT",
      "تقيل شوية، 53g",
    ],
    verdict:
      "الـ Forerunner 965 هو أفضل Running Watch في السوق دلوقتي للـ Serious Athletes. الـ AMOLED Screen والـ Training Intelligence بيخلوه في مستوى تاني.",
  },
  {
    rank: 2,
    badge: "🥈 Best for Polar Users",
    badgeColor: "text-pink-400 bg-pink-400/10 border-pink-400/30",
    name: "Polar Vantage V3",
    tagline: "أفضل Watch للـ Recovery & Triathlon",
    color: "border-pink-500/30 bg-pink-500/5",
    nameColor: "text-pink-400",
    price: "~$600",
    priceNote: "نفس سعر الـ FR965، منافسة حقيقية",
    category: "Premium",
    bestFor: "Triathletes + Recovery-Focused",
    specs: [
      { label: "Display", value: "AMOLED" },
      { label: "GPS Battery", value: "40 ساعة GPS كامل" },
      { label: "Smartwatch Mode", value: "8 أيام" },
      { label: "HR Sensor", value: "Optical + ECG" },
      { label: "Maps", value: "✅ Color Maps" },
      { label: "Sleep", value: "✅ SleepWise، الأفضل في السوق" },
    ],
    pros: [
      "GPS Battery 40 ساعة، الأطول في الـ Premium Category",
      "SleepWise، أفضل Sleep Tracking في أي Watch",
      "FuelWise، Nutrition Guidance أثناء التمرين",
      "ECG مدمج في الـ Watch نفسه",
      "Triathlon Mode ممتاز",
      "Running Power بدون Footpod",
    ],
    cons: [
      "الـ Ecosystem أصغر من Garmin",
      "Apps أقل من Garmin Connect IQ",
      "الـ Maps أقل تفصيلاً من Garmin",
    ],
    verdict:
      "لو الـ Recovery والـ Sleep Tracking أولوية ليك، الـ Vantage V3 هو الأفضل. الـ SleepWise وحده يستاهل السعر.",
  },
  {
    rank: 3,
    badge: "🥉 Best Mid-Range",
    badgeColor: "text-blue-400 bg-blue-400/10 border-blue-400/30",
    name: "Garmin Forerunner 265",
    tagline: "أفضل قيمة في الـ Mid-Range",
    color: "border-blue-500/30 bg-blue-500/5",
    nameColor: "text-blue-400",
    price: "~$450",
    priceNote: "Mid-Range، أفضل قيمة في الفئة دي",
    category: "Mid-Range",
    bestFor: "Daily Runners + Beginners",
    specs: [
      { label: "Display", value: "AMOLED" },
      { label: "GPS Battery", value: "13 ساعة GPS كامل" },
      { label: "Smartwatch Mode", value: "15 يوم" },
      { label: "HR Sensor", value: "Elevate v4 Optical" },
      { label: "Maps", value: "❌ مفيش Maps" },
      { label: "Training Load", value: "✅ HRV Status" },
    ],
    pros: [
      "AMOLED بسعر أقل من الـ 965",
      "HRV Status والـ Training Readiness",
      "خفيف، 47g",
      "Garmin Pay",
      "Morning Report يومي",
    ],
    cons: [
      "مفيش Maps",
      "GPS Battery أقل من الـ 965",
      "مفيش Full Triathlon Mode",
    ],
    verdict:
      "لو مش محتاج Maps وبتجري مسافات عادية، الـ FR265 بيديك 90% من تجربة الـ FR965 بسعر أقل بكتير.",
  },
  {
    rank: 4,
    badge: "💰 Best Budget",
    badgeColor: "text-green-400 bg-green-400/10 border-green-400/30",
    name: "Polar Pacer Pro",
    tagline: "أفضل Budget Watch للـ Serious Runner",
    color: "border-green-500/30 bg-green-500/5",
    nameColor: "text-green-400",
    price: "~$300",
    priceNote: "Budget Premium، Features قوية بسعر معقول",
    category: "Budget",
    bestFor: "Budget-Conscious Runners",
    specs: [
      { label: "Display", value: "MIP، واضح في الشمس" },
      { label: "GPS Battery", value: "35 ساعة GPS كامل" },
      { label: "Smartwatch Mode", value: "7 أيام" },
      { label: "HR Sensor", value: "Precision Prime Optical" },
      { label: "Maps", value: "❌ مفيش" },
      { label: "Running Power", value: "✅ بدون Footpod" },
    ],
    pros: [
      "Running Power مدمج، نادر في السعر ده",
      "GPS Battery 35 ساعة، أطول من الـ FR265",
      "خفيف جداً، 45g",
      "Hill Splitter تلقائي",
      "FitSpark، Daily Workout Suggestions",
    ],
    cons: [
      "MIP Screen مش AMOLED",
      "مفيش Maps",
      "الـ Ecosystem أصغر من Garmin",
      "مفيش HRV Status بنفس مستوى Garmin",
    ],
    verdict:
      "لو ميزانيتك محدودة وعايز Watch جاد للـ Running، الـ Pacer Pro هو الأذكى. Running Power وGPS Battery ممتاز بسعر $300.",
  },
  {
    rank: 5,
    badge: "🏃 Best Ultra Budget",
    badgeColor: "text-orange-400 bg-orange-400/10 border-orange-400/30",
    name: "COROS PACE 3",
    tagline: "أرخص GPS Watch جاد في السوق",
    color: "border-orange-500/30 bg-orange-500/5",
    nameColor: "text-orange-400",
    price: "~$230",
    priceNote: "Ultra Budget، مفيش حاجة أرخص بنفس الجودة",
    category: "Ultra Budget",
    bestFor: "Beginners + Ultra Runners",
    specs: [
      { label: "Display", value: "MIP" },
      { label: "GPS Battery", value: "38 ساعة GPS كامل" },
      { label: "Smartwatch Mode", value: "17 يوم" },
      { label: "HR Sensor", value: "Optical" },
      { label: "Weight", value: "30g، الأخف في السوق" },
      { label: "Maps", value: "❌ مفيش" },
    ],
    pros: [
      "الأخف GPS Watch في السوق، 30g",
      "GPS Battery 38 ساعة بسعر $230",
      "Battery Life 17 يوم في الـ Smartwatch Mode",
      "Dual-Frequency GPS، دقة عالية",
      "مناسب للـ Ultra Marathons",
    ],
    cons: [
      "الـ Optical HR أقل دقة من الـ Garmin والـ Polar",
      "الـ Ecosystem والـ App أبسط بكتير",
      "مفيش Training Intelligence متقدمة",
      "مفيش Maps",
    ],
    verdict:
      "لو أول Watch GPS ليك وميزانيتك ضيقة، الـ COROS PACE 3 هو الاختيار. خفيف والـ Battery ممتاز وسعر مش موجود في غيره.",
  },
];

const quickPick = [
  { need: "أفضل Watch بدون نقاش", pick: "Garmin Forerunner 965", icon: "🏆" },
  { need: "أفضل Recovery & Sleep Tracking", pick: "Polar Vantage V3", icon: "😴" },
  { need: "أفضل قيمة Mid-Range", pick: "Garmin Forerunner 265", icon: "💡" },
  { need: "Budget مع Running Power", pick: "Polar Pacer Pro", icon: "💪" },
  { need: "أرخص GPS Watch موثوق", pick: "COROS PACE 3", icon: "💰" },
];

const relatedPosts = [
  { slug: "gear-guide/best-chest-straps", emoji: "🫀", title: "أفضل Chest Straps في 2026", tag: "Gear Guide" },
  { slug: "garmin-vs-polar", emoji: "🥊", title: "Garmin vs Polar: أنهي الأحسن ليك؟", tag: "Gear Review" },
  { slug: "heart-rate-strap-vs-optical", emoji: "⚡", title: "Chest Strap vs Optical: أيهما أدق؟", tag: "Gear Review" },
];

export default function BestGPSWatchesPage() {
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
            <span className="text-zinc-400">Best GPS Watches</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wide text-red-500 bg-red-500/10 px-3 py-1 rounded-full">
              Gear Guide
            </span>
            <span className="text-xs font-bold uppercase tracking-wide text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full">
              🗓️ Updated 2026
            </span>
          </div>

          {/* ✅ Title — no dash in subtitle */}
          <h1 className="text-4xl md:text-5xl font-black uppercase leading-tight">
            أفضل GPS Watches ⌚
            <br />
            <span className="text-red-500">للـ Athletes في 2026</span>
          </h1>

          {/* ✅ dir="rtl" + no dashes */}
          <p className="text-lg text-zinc-400 leading-relaxed" dir="rtl">
            من الـ $230 للـ $600، اخترنا أفضل 5 GPS Watches في السوق دلوقتي
            لكل مستوى وميزانية. مقارنة حقيقية بدون مبالغة. 🎯
          </p>

          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span>⏱ 9 min read</span>
            <span>•</span>
            <span>⌚ Gear Guide</span>
            <span>•</span>
            <span>Pulse Gear Egypt</span>
          </div>

        </div>
      </section>

      <article className="max-w-3xl mx-auto px-6 py-16 flex flex-col gap-16">

        {/* ===== QUICK PICKS ===== */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-black uppercase text-white">اختار بسرعة ⚡</h2>
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

        {/* ===== WATCHES ===== */}
        <section className="flex flex-col gap-8">
          <h2 className="text-2xl font-black uppercase text-white">المراجعة التفصيلية 🔍</h2>

          {watches.map((watch) => (
            <div key={watch.name} className={`border rounded-2xl overflow-hidden ${watch.color}`}>

              {/* Header */}
              <div className="px-6 py-5 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <span className={`text-3xl font-black ${watch.nameColor}`}>#{watch.rank}</span>
                  <div>
                    <p className={`font-black uppercase text-lg ${watch.nameColor}`}>{watch.name}</p>
                    <p className="text-xs text-zinc-500" dir="rtl">{watch.tagline}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`text-xs font-bold uppercase tracking-wide border px-3 py-1 rounded-full ${watch.badgeColor}`}>
                    {watch.badge}
                  </span>
                  <span className="text-sm font-black text-white">{watch.price}</span>
                </div>
              </div>

              {/* Best For */}
              <div className="px-6 py-3 border-b border-zinc-800 flex items-center gap-3">
                <span className="text-xs text-zinc-500 uppercase tracking-wide">Best For:</span>
                <span className="text-xs font-bold text-white">{watch.bestFor}</span>
              </div>

              {/* Specs */}
              <div className="px-6 py-5 border-b border-zinc-800">
                <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 mb-3">المواصفات</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {watch.specs.map((spec) => (
                    <div
                      key={spec.label}
                      className="flex items-center justify-between bg-zinc-900/60 rounded-xl px-4 py-2"
                    >
                      <span className="text-xs text-zinc-500">{spec.label}</span>
                      <span className="text-xs font-bold text-white text-right" dir="rtl">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pros & Cons */}
              <div className="grid grid-cols-1 md:grid-cols-2 border-b border-zinc-800">
                <div className="px-6 py-5 border-b md:border-b-0 md:border-l border-zinc-800">
                  <p className="text-xs font-bold uppercase tracking-wide text-green-400 mb-3">✅ المميزات</p>
                  <div className="flex flex-col gap-2">
                    {watch.pros.map((pro) => (
                      <div key={pro} className="flex items-start gap-2">
                        <span className="text-green-400 text-xs shrink-0 mt-0.5">+</span>
                        <p className="text-xs text-zinc-300 leading-relaxed" dir="rtl">{pro}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="px-6 py-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-red-400 mb-3">❌ العيوب</p>
                  <div className="flex flex-col gap-2">
                    {watch.cons.map((con) => (
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
                  {watch.verdict}
                </p>
              </div>

            </div>
          ))}
        </section>

        {/* ===== CTA ===== */}
        <section className="bg-gradient-to-br from-red-600/20 to-zinc-900 border border-red-500/20 rounded-2xl p-8 flex flex-col gap-4 items-center text-center">
          <span className="text-4xl">🛒</span>
          <h3 className="text-xl font-black uppercase text-white">لاقي الـ Watch المناسب ليك</h3>
          <p className="text-zinc-400 text-sm max-w-md leading-relaxed" dir="rtl">
            كل الـ Watches اللي اتكلمنا عنها متاحة عندنا في Pulse Gear،
            مع ضمان الأصالة والشحن لكل مصر.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/products"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wide transition-colors duration-200"
            >
              Browse GPS Watches
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
                <h3
                  className="text-sm font-black uppercase text-white leading-tight group-hover:text-red-400 transition-colors duration-200"
                  dir="rtl"
                >
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