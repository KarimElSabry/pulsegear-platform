// src/app/blog/gear-guide/best-gps-watches/page.tsx

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "أفضل GPS Watches للـ Runners في 2026 | Pulse Gear Blog",
  description:
    "مقارنة أفضل GPS Watches للـ Runners في مصر، من الـ Beginner للـ Serious Runner، مع أسعار بالجنيه المصري ونصائح لاختيار الساعة المناسبة.",
  openGraph: {
    title: "أفضل GPS Watches للـ Runners في 2026 | Pulse Gear Egypt",
    description:
      "مقارنة أفضل GPS Watches للـ Runners في مصر، من الـ Beginner للـ Serious Runner.",
    type: "article",
  },
};

const watches = [
  {
    rank: 1,
    badge: "🥇 أفضل اختيار للـ Serious Runner",
    badgeColor: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
    name: "Garmin Forerunner 965",
    tagline: "للـ Runner اللي عايز كل الـ Training Features المهمة",
    color: "border-yellow-500/30 bg-yellow-500/5",
    nameColor: "text-yellow-400",
    price: "48,000–55,000 EGP",
    priceNote: "السعر Estimated حسب تكلفة الاستيراد",
    category: "Premium",
    bestFor: "Serious Runners + Triathletes",
    availability: "حسب الطلب",
    specs: [
      { label: "Display", value: "AMOLED" },
      { label: "GPS", value: "Multi-Band GPS" },
      { label: "Maps", value: "✅ خرائط مدمجة" },
      { label: "Training", value: "✅ HRV Status + Training Metrics" },
      { label: "Triathlon", value: "✅ Multi-Sport" },
      { label: "Battery", value: "ممتازة للـ Long Training" },
    ],
    pros: [
      "AMOLED Screen ممتازة وواضحة",
      "Training Metrics متقدمة للـ Serious Runners",
      "خرائط مدمجة مفيدة للـ Long Runs والـ Routes الجديدة",
      "مناسب للـ Triathlon والـ Multi-Sport",
      "بيشتغل بشكل ممتاز مع Heart Rate Straps",
    ],
    cons: [
      "سعره عالي مقارنة بالـ Entry-Level Watches",
      "مش ضروري للمبتدئ اللي لسه بيبدأ",
      "السعر النهائي ممكن يتغير حسب تكلفة الشراء والاستيراد",
    ],
    verdict:
      "لو بتتمرن بجد وعايز Watch تكمل معاك لفترة طويلة وتديك Training Data متقدمة، الـ Forerunner 965 اختيار قوي جداً. لكن لو لسه Beginner، مش محتاج تبدأ من هنا.",
  },

  {
    rank: 2,
    badge: "🥈 أفضل اختيار متوازن",
    badgeColor: "text-blue-400 bg-blue-400/10 border-blue-400/30",
    name: "Garmin Forerunner 265",
    tagline: "Training Features قوية بدون تكلفة الـ Flagship",
    color: "border-blue-500/30 bg-blue-500/5",
    nameColor: "text-blue-400",
    price: "32,000–37,000 EGP",
    priceNote: "السعر Estimated",
    category: "Mid-Range",
    bestFor: "Daily Runners + Serious Beginners",
    availability: "حسب الطلب",
    specs: [
      { label: "Display", value: "AMOLED" },
      { label: "GPS", value: "Multi-Band GPS" },
      { label: "Training", value: "✅ Advanced Training Metrics" },
      { label: "HRV", value: "✅ HRV Status" },
      { label: "Maps", value: "❌ مفيش Maps مدمجة" },
      { label: "Category", value: "Mid-Range Running Watch" },
    ],
    pros: [
      "AMOLED Screen ممتازة",
      "Training Metrics متقدمة بالنسبة لسعره",
      "Multi-Band GPS لدقة أعلى",
      "HRV Status يساعدك تتابع الـ Recovery",
      "مناسب جداً للـ Runner اللي عايز يطور تدريبه",
    ],
    cons: [
      "مفيش Maps مدمجة",
      "أغلى بكتير من الـ Forerunner 165",
      "السعر Estimated وممكن يتغير حسب تكلفة الاستيراد",
    ],
    verdict:
      "لو أنت Runner بقالك فترة وعايز تطور من Watch بسيطة لساعة Training جادة، الـ Forerunner 265 من أحسن الاختيارات المتوازنة في الفئة دي.",
  },

  {
    rank: 3,
    badge: "💰 أفضل بداية",
    badgeColor: "text-green-400 bg-green-400/10 border-green-400/30",
    name: "Garmin Forerunner 165",
    tagline: "اختيار ممتاز للـ Beginner والـ Daily Runner",
    color: "border-green-500/30 bg-green-500/5",
    nameColor: "text-green-400",
    price: "15,500–16,000 EGP",
    priceNote: "من المنتجات المتاحة حالياً",
    category: "Entry-Level",
    bestFor: "Beginners + Daily Runners",
    availability: "✅ متاح",
    specs: [
      { label: "Display", value: "AMOLED" },
      { label: "GPS", value: "Built-in GPS" },
      { label: "Training", value: "Running-focused Metrics" },
      { label: "Health", value: "Heart Rate + Health Tracking" },
      { label: "Maps", value: "❌ مفيش Maps كاملة" },
      { label: "Category", value: "Entry-Level Running Watch" },
    ],
    pros: [
      "سعره أقل بكتير من الـ Premium Watches",
      "AMOLED Screen",
      "مناسب جداً للـ Runner اللي لسه بيبدأ",
      "بيوفر الأساسيات المهمة للـ Running",
      "متاح في Pulse Gear حالياً",
    ],
    cons: [
      "الـ Training Features أقل من الـ 265 والـ 965",
      "مش مناسب للي محتاج Advanced Multi-Sport Features",
      "مش أفضل اختيار لو محتاج Maps متقدمة",
    ],
    verdict:
      "لو أول GPS Watch ليك وعايز حاجة محترمة من غير ما تدفع عشرات الآلاف زيادة على Features مش هتستخدمها، الـ Forerunner 165 هو المكان الصح تبدأ منه.",
  },

  {
    rank: 4,
    badge: "🏃 أفضل Budget Premium",
    badgeColor: "text-orange-400 bg-orange-400/10 border-orange-400/30",
    name: "Polar Pacer Pro",
    tagline: "Running-focused Watch خفيفة وموجهة للـ Training",
    color: "border-orange-500/30 bg-orange-500/5",
    nameColor: "text-orange-400",
    price: "22,000–26,000 EGP",
    priceNote: "السعر Estimated",
    category: "Running-focused",
    bestFor: "Runners + Polar Users",
    availability: "حسب الطلب",
    specs: [
      { label: "Display", value: "MIP" },
      { label: "GPS", value: "Built-in GPS" },
      { label: "Focus", value: "Running + Training" },
      { label: "Running Power", value: "✅" },
      { label: "Recovery", value: "Polar Training Ecosystem" },
      { label: "Weight", value: "خفيفة" },
    ],
    pros: [
      "Running-focused من الأساس",
      "خفيفة ومناسبة للـ Daily Training",
      "مناسبة جداً لو أنت بالفعل مستخدم Polar",
      "Running Power Features مفيدة للـ Serious Runner",
      "سعرها أقل من ساعات Garmin Premium",
    ],
    cons: [
      "الشاشة MIP مش AMOLED",
      "الـ Ecosystem أصغر من Garmin",
      "السعر Estimated",
    ],
    verdict:
      "لو أنت Polar User أو عايز Running Watch مركزة على التدريب من غير ما تدخل في أسعار الـ Flagship، الـ Pacer Pro اختيار منطقي جداً.",
  },

  {
    rank: 5,
    badge: "🚀 للـ Serious Athlete",
    badgeColor: "text-purple-400 bg-purple-400/10 border-purple-400/30",
    name: "Garmin Forerunner 970",
    tagline: "Flagship Running Watch للـ Athlete اللي عايز أحدث مستوى",
    color: "border-purple-500/30 bg-purple-500/5",
    nameColor: "text-purple-400",
    price: "56,000–62,000 EGP",
    priceNote: "السعر Estimated",
    category: "Flagship",
    bestFor: "Advanced Runners + Triathletes",
    availability: "حسب الطلب",
    specs: [
      { label: "Position", value: "Flagship Forerunner" },
      { label: "Display", value: "AMOLED" },
      { label: "GPS", value: "Advanced GPS" },
      { label: "Training", value: "✅ Advanced Training Metrics" },
      { label: "Multi-Sport", value: "✅" },
      { label: "Maps", value: "✅" },
    ],
    pros: [
      "أحدث وأعلى فئة في Forerunner Lineup",
      "موجه للـ Advanced Training",
      "مناسب للـ Triathlon والـ Multi-Sport",
      "Advanced Running Metrics",
      "اختيار قوي جداً للـ Athlete اللي عايز Flagship",
    ],
    cons: [
      "سعره مرتفع جداً",
      "مش منطقي لمعظم الـ Beginners",
      "السعر Estimated",
    ],
    verdict:
      "الـ Forerunner 970 معمول للـ Athlete اللي فعلاً هيستخدم الـ Advanced Features. لو استخدامك الأساسي Easy Runs وLong Runs بسيطة، مش محتاج تدفع السعر ده.",
  },
];

const quickPick = [
  {
    need: "أنا Beginner ودي أول GPS Watch ليا",
    pick: "Garmin Forerunner 165",
    price: "15,500–16,000 EGP",
    icon: "🌱",
  },
  {
    need: "عايز Training Features أقوى",
    pick: "Garmin Forerunner 265",
    price: "32,000–37,000 EGP",
    icon: "💪",
  },
  {
    need: "عايز أعلى فئة Running Watch",
    pick: "Garmin Forerunner 965",
    price: "48,000–55,000 EGP",
    icon: "🏆",
  },
  {
    need: "أنا Polar User",
    pick: "Polar Pacer Pro",
    price: "22,000–26,000 EGP",
    icon: "🔵",
  },
  {
    need: "عايز Flagship وأحدث Features",
    pick: "Garmin Forerunner 970",
    price: "56,000–62,000 EGP",
    icon: "🚀",
  },
];

const relatedPosts = [
  {
    slug: "gear-guide/best-heart-rate-monitors",
    emoji: "❤️",
    title: "أفضل Heart Rate Monitors في 2026",
    tag: "Gear Guide",
  },
  {
    slug: "gear-guide/best-chest-straps",
    emoji: "🫀",
    title: "أفضل Chest Straps في 2026",
    tag: "Gear Guide",
  },
  {
    slug: "gear-review/garmin-vs-polar",
    emoji: "🥊",
    title: "Garmin vs Polar: أنهي الأحسن ليك؟",
    tag: "Gear Review",
  },
];

export default function BestGPSWatchesPage() {
  return (
    <main className="w-full bg-zinc-950 min-h-screen text-white">

      {/* HERO */}
      <section className="w-full border-b border-zinc-800 py-20 px-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">

          {/* Breadcrumb */}
          <div
            className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wide flex-wrap"
            dir="ltr"
          >
            <Link
              href="/"
              className="hover:text-white transition-colors duration-200"
            >
              Home
            </Link>

            <span>/</span>

            <Link
              href="/blog"
              className="hover:text-white transition-colors duration-200"
            >
              Blog
            </Link>

            <span>/</span>

            <Link
              href="/blog/gear-guide"
              className="hover:text-white transition-colors duration-200"
            >
              Gear Guide
            </Link>

            <span>/</span>

            <span className="text-zinc-400">
              Best GPS Watches
            </span>
          </div>

          {/* Category */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wide text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full">
              Gear Guide
            </span>

            <span className="text-xs font-bold uppercase tracking-wide text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full">
              🗓️ Updated 2026
            </span>
          </div>

          {/* Title */}
          <div dir="rtl">
            <h1 className="text-4xl md:text-5xl font-black leading-tight">
              أفضل GPS Watches للـ Runners
              <br />
              <span className="text-red-500">
                في مصر 2026 ⌚
              </span>
            </h1>
          </div>

          {/* Intro */}
          <p
            className="text-lg text-zinc-400 leading-relaxed"
            dir="rtl"
          >
            مش كل Runner محتاج أغلى GPS Watch في السوق.
            في المقال ده هنعرف الفرق بين الـ Entry-Level والـ Mid-Range
            والـ Premium، وإمتى فعلاً تستاهل تدفع أكتر.
            والأسعار اللي تحت بالجنيه المصري حسب بيانات Pulse Gear،
            مع توضيح المنتجات اللي سعرها Estimated.
          </p>

          {/* Meta */}
          <div
            className="flex items-center gap-4 text-xs text-zinc-500 flex-wrap"
            dir="ltr"
          >
            <span>⏱ 9 min read</span>
            <span>•</span>
            <span>⌚ Gear Guide</span>
            <span>•</span>
            <span>Pulse Gear Egypt</span>
          </div>

          {/* Trust Banner */}
          <div className="bg-red-600/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
            <span className="text-2xl shrink-0">🇪🇬</span>

            <div className="flex flex-col gap-1" dir="rtl">
              <p className="text-sm font-bold text-white">
                الأسعار بالجنيه المصري
              </p>

              <p className="text-xs text-zinc-400 leading-relaxed">
                الأسعار في المقال مبنية على بيانات Pulse Gear الحالية.
                بعض أسعار الـ GPS Watches Estimated لأنها بتتأثر بتكلفة الشراء
                والاستيراد وتوفر المنتج.
              </p>
            </div>
          </div>

        </div>
      </section>

      <article className="max-w-3xl mx-auto px-6 py-16 flex flex-col gap-16">

        {/* QUICK PICKS */}
        <section className="flex flex-col gap-6">

          <div dir="rtl">
            <h2 className="text-2xl font-black text-white">
              اختار بسرعة ⚡
            </h2>

            <p className="text-sm text-zinc-500 mt-2">
              لو مش عايز تقرأ كل التفاصيل، دي الخلاصة حسب احتياجك.
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">

            {quickPick.map((item, index) => (
              <div
                key={item.need}
                className="px-5 py-4 border-b border-zinc-800 last:border-b-0 hover:bg-zinc-800/50 transition-colors"
              >
                <div
                  className="flex items-center gap-4"
                  dir="rtl"
                >
                  <span className="text-xl shrink-0">
                    {item.icon}
                  </span>

                  <div className="flex-1">
                    <p className="text-sm text-zinc-400">
                      {item.need}
                    </p>

                    <p className="text-sm font-black text-white mt-1">
                      {item.pick}
                    </p>
                  </div>

                  <span
                    className="text-sm font-bold text-red-400 shrink-0"
                    dir="ltr"
                  >
                    {item.price}
                  </span>
                </div>
              </div>
            ))}

          </div>
        </section>

        {/* DETAILED REVIEWS */}
        <section className="flex flex-col gap-8">

          <div dir="rtl">
            <h2 className="text-2xl font-black text-white">
              المراجعة التفصيلية 🔍
            </h2>

            <p className="text-sm text-zinc-500 mt-2">
              مش هنقولك إن أغلى Watch هي الأحسن.
              الاختيار الصح هو اللي يناسب مستواك وطريقة تدريبك وميزانيتك.
            </p>
          </div>

          {watches.map((watch) => (
            <div
              key={watch.name}
              className={`border rounded-2xl overflow-hidden ${watch.color}`}
            >

              {/* Header */}
              <div className="px-6 py-5 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-4">

                <div className="flex items-center gap-4">

                  <span
                    className={`text-3xl font-black ${watch.nameColor}`}
                  >
                    #{watch.rank}
                  </span>

                  <div dir="rtl">

                    <p
                      className={`font-black text-lg ${watch.nameColor}`}
                    >
                      {watch.name}
                    </p>

                    <p className="text-xs text-zinc-500 mt-1">
                      {watch.tagline}
                    </p>

                  </div>

                </div>

                <div className="flex flex-col items-end gap-2">

                  <span
                    className={`text-xs font-bold border px-3 py-1 rounded-full ${watch.badgeColor}`}
                    dir="rtl"
                  >
                    {watch.badge}
                  </span>

                  <span
                    className="text-lg font-black text-white"
                    dir="ltr"
                  >
                    {watch.price}
                  </span>

                  <span
                    className="text-xs text-zinc-600"
                    dir="rtl"
                  >
                    {watch.priceNote}
                  </span>

                </div>

              </div>

              {/* Best For */}
              <div
                className="px-6 py-3 border-b border-zinc-800 flex flex-wrap items-center gap-2"
                dir="rtl"
              >
                <span className="text-xs text-zinc-500">
                  مناسب لـ:
                </span>

                <span className="text-xs font-bold text-white">
                  {watch.bestFor}
                </span>

                <span className="text-xs text-zinc-600">
                  •
                </span>

                <span className="text-xs text-zinc-500">
                  {watch.category}
                </span>

              </div>

              {/* Availability */}
              <div
                className="px-6 py-3 border-b border-zinc-800 bg-zinc-950/30"
                dir="rtl"
              >
                <p className="text-xs text-zinc-500">
                  التوفر:
                  <span className="text-zinc-300 font-bold mr-1">
                    {watch.availability}
                  </span>
                </p>
              </div>

              {/* Specs */}
              <div className="px-6 py-5 border-b border-zinc-800">

                <p
                  className="text-xs font-bold text-zinc-500 mb-3"
                  dir="rtl"
                >
                  المواصفات المهمة
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

                  {watch.specs.map((spec) => (
                    <div
                      key={spec.label}
                      className="flex items-center justify-between gap-4 bg-zinc-900/60 rounded-xl px-4 py-3"
                    >

                      <span
                        className="text-xs text-zinc-500"
                        dir="ltr"
                      >
                        {spec.label}
                      </span>

                      <span
                        className="text-xs font-bold text-white text-right"
                        dir="auto"
                      >
                        {spec.value}
                      </span>

                    </div>
                  ))}

                </div>
              </div>

              {/* Pros & Cons */}
              <div className="grid grid-cols-1 md:grid-cols-2 border-b border-zinc-800">

                <div className="px-6 py-5 border-b md:border-b-0 md:border-l border-zinc-800">

                  <p
                    className="text-xs font-bold text-green-400 mb-3"
                    dir="rtl"
                  >
                    ✅ المميزات
                  </p>

                  <div className="flex flex-col gap-2">

                    {watch.pros.map((pro) => (
                      <div
                        key={pro}
                        className="flex items-start gap-2"
                      >

                        <span className="text-green-400 text-xs shrink-0 mt-0.5">
                          +
                        </span>

                        <p
                          className="text-xs text-zinc-300 leading-relaxed"
                          dir="auto"
                        >
                          {pro}
                        </p>

                      </div>
                    ))}

                  </div>

                </div>

                <div className="px-6 py-5">

                  <p
                    className="text-xs font-bold text-red-400 mb-3"
                    dir="rtl"
                  >
                    ❌ العيوب
                  </p>

                  <div className="flex flex-col gap-2">

                    {watch.cons.map((con) => (
                      <div
                        key={con}
                        className="flex items-start gap-2"
                      >

                        <span className="text-red-400 text-xs shrink-0 mt-0.5">
                          −
                        </span>

                        <p
                          className="text-xs text-zinc-300 leading-relaxed"
                          dir="auto"
                        >
                          {con}
                        </p>

                      </div>
                    ))}

                  </div>

                </div>

              </div>

              {/* Verdict */}
              <div className="px-6 py-5">

                <div className="bg-zinc-900/70 rounded-xl p-4 flex items-start gap-3">

                  <span className="text-xl shrink-0">
                    💬
                  </span>

                  <p
                    className="text-sm text-zinc-300 leading-relaxed"
                    dir="rtl"
                  >
                    <span className="font-bold text-white">
                      الحكم:
                    </span>{" "}
                    {watch.verdict}
                  </p>

                </div>

              </div>

            </div>
          ))}

        </section>

        {/* IMPORTANT BUYING ADVICE */}
        <section className="flex flex-col gap-6">

          <div dir="rtl">

            <h2 className="text-2xl font-black text-white">
              قبل ما تشتري GPS Watch 🎯
            </h2>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {[
              {
                icon: "💰",
                title: "متدفعش على Features مش هتستخدمها",
                body:
                  "لو لسه Beginner، غالباً مش محتاج Flagship Watch. الـ Forerunner 165 ممكن يكون كفاية جداً.",
              },
              {
                icon: "❤️",
                title: "الـ GPS مش أهم حاجة لوحده",
                body:
                  "لو هدفك الأساسي HR Zones والتدريب بالنبض، Heart Rate Strap كويس ممكن يفرق معاك أكتر من ترقية الـ Watch.",
              },
              {
                icon: "📈",
                title: "اختار على حسب تدريبك",
                body:
                  "Long Runs، Intervals، Triathlon، Recovery، أو مجرد Daily Running. كل استخدام له احتياجات مختلفة.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
                dir="rtl"
              >

                <span className="text-2xl">
                  {item.icon}
                </span>

                <h3 className="text-sm font-bold text-white mt-3">
                  {item.title}
                </h3>

                <p className="text-xs text-zinc-400 leading-relaxed mt-2">
                  {item.body}
                </p>

              </div>
            ))}

          </div>

        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-red-600/20 to-zinc-900 border border-red-500/20 rounded-2xl p-8 flex flex-col gap-4 items-center text-center">

          <span className="text-4xl">
            🛒
          </span>

          <h3
            className="text-xl font-black text-white"
            dir="rtl"
          >
            مش عارف تختار أنهي Watch؟
          </h3>

          <p
            className="text-zinc-400 text-sm max-w-md leading-relaxed"
            dir="rtl"
          >
            ابعتلنا مستواك في الجري، ميزانيتك، والـ Watch اللي بتستخدمها حالياً.
            هنساعدك تختار الـ GPS Watch المناسبة بدل ما تدفع في Features مش محتاجها.
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

        {/* RELATED */}
        <section className="flex flex-col gap-6">

          <h2
            className="text-xl font-black text-white"
            dir="rtl"
          >
            اقرأ كمان 📚
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {relatedPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col gap-3 bg-zinc-900 border border-zinc-800 hover:border-red-600 rounded-2xl p-5 transition-all duration-300"
              >

                <span className="text-3xl">
                  {post.emoji}
                </span>

                <span className="text-xs font-bold uppercase tracking-wide text-red-500">
                  {post.tag}
                </span>

                <h3
                  className="text-sm font-black text-white leading-tight group-hover:text-red-400 transition-colors duration-200"
                  dir="rtl"
                >
                  {post.title}
                </h3>

                <span
                  className="text-xs text-red-500 font-semibold"
                  dir="rtl"
                >
                  اقرأ المقال →
                </span>

              </Link>
            ))}

          </div>

        </section>

        {/* BACK */}
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
