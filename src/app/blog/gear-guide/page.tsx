// src/app/blog/gear-guide/page.tsx

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gear Guide | Pulse Gear Egypt Blog",
  description:
    "دليل الـ Gear الشامل — اختار أفضل GPS Watch وـ Chest Strap وـ Heart Rate Monitor لمستواك وميزانيتك.",
  openGraph: {
    title: "Gear Guide | Pulse Gear Egypt Blog",
    description:
      "دليل الـ Gear الشامل — اختار الـ Gear الصح لمستواك وميزانيتك.",
    type: "website",
  },
};

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */

const articles = [
  {
    href: "/blog/gear-guide/beginners-guide",
    icon: "🌱",
    tag: "Start Here",
    tagColor: "text-green-400 bg-green-500/10 border-green-500/20",
    title: "Beginner's Gear Guide 2026",
    desc: "مش محتاج تشتري كل حاجة من أول يوم. إيه اللي محتاجه فعلاً وإزاي تبدأ بأقل تكلفة.",
    readTime: "10 min",
    level: "Beginner",
    levelColor: "text-green-400",
    featured: true,
    badge: "ابدأ هنا",
  },
  {
    href: "/blog/gear-guide/best-heart-rate-monitors",
    icon: "🫀",
    tag: "Best Of",
    tagColor: "text-red-400 bg-red-500/10 border-red-500/20",
    title: "Best Heart Rate Monitors 2026",
    desc: "مقارنة شاملة بين أفضل Chest Straps والـ Optical HR Monitors في السوق.",
    readTime: "8 min",
    level: "All Levels",
    levelColor: "text-zinc-400",
    featured: true,
    badge: null,
  },
  {
    href: "/blog/gear-guide/best-gps-watches",
    icon: "⌚",
    tag: "Best Of",
    tagColor: "text-red-400 bg-red-500/10 border-red-500/20",
    title: "Best GPS Watches 2026",
    desc: "Garmin vs Coros vs Polar — أفضل GPS Watches لكل مستوى وميزانية.",
    readTime: "9 min",
    level: "All Levels",
    levelColor: "text-zinc-400",
    featured: true,
    badge: null,
  },
  {
    href: "/blog/gear-guide/best-chest-straps",
    icon: "📡",
    tag: "Gear Guide",
    tagColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    title: "Best Chest Straps 2026",
    desc: "Polar H10 vs H9 vs Garmin HRM-Pro — أدق Chest Straps في السوق.",
    readTime: "7 min",
    level: "Intermediate",
    levelColor: "text-yellow-400",
    featured: false,
    badge: null,
  },
  {
    href: "/blog/gear-guide/budget-vs-premium",
    icon: "💰",
    tag: "Comparison",
    tagColor: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    title: "Budget vs Premium Gear",
    desc: "هل الـ Gear الغالي يستاهل فعلاً؟ مقارنة صريحة بين الـ Budget والـ Premium Options.",
    readTime: "6 min",
    level: "All Levels",
    levelColor: "text-zinc-400",
    featured: false,
    badge: null,
  },
];

const gearCategories = [
  {
    icon: "⌚",
    title: "GPS Watches",
    desc: "الـ Watch اللي بتتابع كل حاجة HR والـ GPS والـ Training Load.",
    priceRange: "~11,000 — 35,000 EGP",
    topPick: "Garmin Forerunner 965",
    href: "/blog/gear-guide/best-gps-watches",
    color: "border-blue-500/30 bg-blue-500/5",
    tagColor: "text-blue-400",
  },
  {
    icon: "📡",
    title: "Chest Straps",
    desc: "أدق طريقة لقياس الـ HR: ضروري للـ HIIT والـ Interval Training.",
    priceRange: "~3,000 — 4,500 EGP",
    topPick: "Polar H10",
    href: "/blog/gear-guide/best-chest-straps",
    color: "border-red-500/30 bg-red-500/5",
    tagColor: "text-red-400",
  },
  {
    icon: "🪵",
    title: "Recovery Tools",
    desc: "Foam Rollers والـ Massage Guns أهم ما بعد التمرين.",
    priceRange: "~500 — 10,000 EGP",
    topPick: "Foam Roller + Theragun Mini",
    href: "/blog/gear-guide/beginners-guide",
    color: "border-purple-500/30 bg-purple-500/5",
    tagColor: "text-purple-400",
  },
  {
    icon: "🏋️",
    title: "Resistance Bands",
    desc: "للـ Warm-Up والـ Activation والـ Injury Prevention.",
    priceRange: "~500 — 1,500 EGP",
    topPick: "Set متكامل بمقاومات مختلفة",
    href: "/blog/gear-guide/beginners-guide",
    color: "border-green-500/30 bg-green-500/5",
    tagColor: "text-green-400",
  },
];

const buyingGuide = [
  {
    step: "01",
    question: "إيه مستواك؟",
    options: [
      { label: "مبتدئ", action: "ابدأ بـ Polar H9 + Foam Roller", href: "/blog/gear-guide/beginners-guide" },
      { label: "Intermediate", action: "أضف Coros Pace 3 أو Garmin 265", href: "/blog/gear-guide/best-gps-watches" },
      { label: "Advanced", action: "Garmin 965 + Polar H10 + Theragun", href: "/blog/gear-guide/best-heart-rate-monitors" },
    ],
  },
  {
    step: "02",
    question: "إيه الميزانية؟",
    options: [
      { label: "~3,500 EGP", action: "Polar H9 + Foam Roller — Starter Pack", href: "/blog/gear-guide/beginners-guide" },
      { label: "~15,000 EGP", action: "Polar H10 + Coros Pace 3", href: "/blog/gear-guide/budget-vs-premium" },
      { label: "~50,000 EGP", action: "Garmin 965 + Polar H10 + Theragun", href: "/blog/gear-guide/budget-vs-premium" },
    ],
  },
  {
    step: "03",
    question: "إيه الأهم ليك؟",
    options: [
      { label: "دقة الـ HR", action: "Polar H10 Chest Strap هو الأفضل", href: "/blog/gear-guide/best-chest-straps" },
      { label: "GPS وـ Maps", action: "Garmin Forerunner 965 أو Fenix 7", href: "/blog/gear-guide/best-gps-watches" },
      { label: "Value for Money", action: "راجع Budget vs Premium Guide", href: "/blog/gear-guide/budget-vs-premium" },
    ],
  },
];

const comparisonTable = [
  {
    gear: "Polar H9",
    type: "Chest Strap",
    price: "~3,000 EGP",
    best: "المبتدئ",
    accuracy: "⭐⭐⭐⭐⭐",
    gps: "❌",
    battery: "400h",
  },
  {
    gear: "Polar H10",
    type: "Chest Strap",
    price: "~4,500 EGP",
    best: "الجاد",
    accuracy: "⭐⭐⭐⭐⭐",
    gps: "❌",
    battery: "400h + Memory",
  },
  {
    gear: "Coros Pace 3",
    type: "GPS Watch",
    price: "~11,500 EGP",
    best: "Intermediate",
    accuracy: "⭐⭐⭐⭐",
    gps: "✅ Dual-Freq",
    battery: "38h GPS",
  },
  {
    gear: "Garmin FR 265",
    type: "GPS Watch",
    price: "~18,000 EGP",
    best: "Serious Runner",
    accuracy: "⭐⭐⭐⭐",
    gps: "✅ Multi-Band",
    battery: "24h GPS",
  },
  {
    gear: "Garmin FR 965",
    type: "GPS Watch",
    price: "~30,000 EGP",
    best: "Advanced",
    accuracy: "⭐⭐⭐⭐⭐",
    gps: "✅ Multi-Band",
    battery: "31h GPS",
  },
];

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */

export default function GearGuideHubPage() {
  const featured = articles.filter((a) => a.featured);
  const rest = articles.filter((a) => !a.featured);

  return (
    <main className="w-full bg-zinc-950 min-h-screen text-white">

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section className="w-full border-b border-zinc-800 py-20 px-6">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wide flex-wrap">
            <Link href="/" className="hover:text-white transition-colors duration-200">
              Home
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-white transition-colors duration-200">
              Blog
            </Link>
            <span>/</span>
            <span className="text-zinc-400">Gear Guide</span>
          </div>

          <span className="self-start text-xs font-bold uppercase tracking-wide text-green-500 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
            Gear Guide
          </span>

          <h1 className="text-4xl md:text-5xl font-black uppercase leading-tight">
            Gear Guide 🎒
            <br />
            <span className="text-red-500" dir="auto">اختار الـ Gear الصح</span>
          </h1>

          <p className="text-lg text-zinc-400 leading-relaxed max-w-2xl" dir="rtl">
            مش كل الـ Gear بيناسب كل الناس. هنا هتلاقي مقارنات صريحة
            ودلايل مفصلة عشان تختار الـ Gear المناسب لمستواك وميزانيتك
            بدون تضييع فلوس على حاجات مش محتاجها.
          </p>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            {[
              { value: `${articles.length}`, label: "مقالات" },
              { value: "3", label: "Starter Packs" },
              { value: "~3,500", label: "أقل سعر للبداية (EGP)" },
              { value: "100%", label: "متاح في مصر" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center"
              >
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-xs text-zinc-500 mt-1" dir="rtl">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Egypt Banner */}
          <div className="bg-red-600/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-bold text-white" dir="auto">
                كل الـ Gear متاح في Pulse Gear Egypt
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed" dir="rtl">
                بأسعار مناسبة بالجنيه المصري، بدون تعقيدات الاستيراد أو الوسطاء.
                تواصل معانا وهنساعدك تختار الصح.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          BODY
      ══════════════════════════════════════ */}
      <div className="max-w-4xl mx-auto px-6 py-16 flex flex-col gap-20">

        {/* ─── BUYING GUIDE ─── */}
        <section className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white">
              مش عارف تبدأ من فين؟ 🤔
            </h2>
            <p className="text-sm text-zinc-500" dir="rtl">
              جاوب على 3 أسئلة وهنوجهك للمقال المناسب
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {buyingGuide.map((item) => (
              <div
                key={item.step}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
              >
                <div className="flex items-center gap-4 px-5 py-4 border-b border-zinc-800">
                  <span className="text-2xl font-black text-red-500">{item.step}</span>
                  <p className="font-black text-white uppercase tracking-wide text-sm" dir="rtl">
                    {item.question}
                  </p>
                </div>
                <div className="flex flex-col divide-y divide-zinc-800">
                  {item.options.map((option) => (
                    <Link
                      key={option.label}
                      href={option.href}
                      className="flex items-center justify-between px-5 py-3 hover:bg-zinc-800/50 transition-colors duration-200 group"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-black text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full shrink-0">
                          {option.label}
                        </span>
                        <p className="text-xs text-zinc-400 group-hover:text-white transition-colors duration-200" dir="rtl">
                          {option.action}
                        </p>
                      </div>
                      <span className="text-xs text-zinc-600 group-hover:text-red-400 transition-colors duration-200 shrink-0">
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── FEATURED ARTICLES ─── */}
        <section className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white">
              المقالات الأساسية ⭐
            </h2>
            <p className="text-sm text-zinc-500" dir="rtl">
              ابدأ بـ Beginner's Guide لو جديد، أو اختار المقال اللي يناسبك
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featured.map((article) => (
              <Link
                key={article.href}
                href={article.href}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-6 flex flex-col gap-4 transition-all duration-200 group relative"
              >
                {article.badge && (
                  <span className="absolute top-4 right-4 text-xs font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                    {article.badge}
                  </span>
                )}

                <span className="text-3xl">{article.icon}</span>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-bold uppercase tracking-wide border px-2 py-0.5 rounded-full ${article.tagColor}`}>
                    {article.tag}
                  </span>
                  <span className={`text-xs font-bold ${article.levelColor}`}>
                    {article.level}
                  </span>
                </div>

                <div className="flex flex-col gap-2 flex-1">
                  <p className="font-black text-white text-sm uppercase tracking-wide leading-snug group-hover:text-red-400 transition-colors duration-200">
                    {article.title}
                  </p>
                  <p className="text-xs text-zinc-500 leading-relaxed" dir="rtl">
                    {article.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                  <span className="text-xs text-zinc-600">⏱ {article.readTime}</span>
                  <span className="text-xs text-red-400 font-bold group-hover:translate-x-1 transition-transform duration-200">
                    اقرأ →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── REST OF ARTICLES ─── */}
        {rest.length > 0 && (
          <section className="flex flex-col gap-8">
            <h2 className="text-2xl font-black uppercase text-white">
              مقالات تانية 📚
            </h2>
            <div className="flex flex-col gap-3">
              {rest.map((article) => (
                <Link
                  key={article.href}
                  href={article.href}
                  className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-5 flex items-center gap-5 transition-all duration-200 group"
                >
                  <span className="text-2xl shrink-0">{article.icon}</span>
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold uppercase tracking-wide border px-2 py-0.5 rounded-full ${article.tagColor}`}>
                        {article.tag}
                      </span>
                      <span className={`text-xs font-bold ${article.levelColor}`}>
                        {article.level}
                      </span>
                    </div>
                    <p className="font-black text-white text-sm uppercase tracking-wide group-hover:text-red-400 transition-colors duration-200">
                      {article.title}
                    </p>
                    <p className="text-xs text-zinc-500 leading-relaxed" dir="rtl">
                      {article.desc}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-xs text-zinc-600">⏱ {article.readTime}</span>
                    <span className="text-xs text-red-400 font-bold group-hover:translate-x-1 transition-transform duration-200">
                      اقرأ →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ─── GEAR CATEGORIES ─── */}
        <section className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white" dir="auto">
              الـ Gear Categories 🗂️
            </h2>
            <p className="text-sm text-zinc-500" dir="rtl">
              اختار الـ Category اللي بتدور عليها
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gearCategories.map((cat) => (
              <Link
                key={cat.title}
                href={cat.href}
                className={`border rounded-2xl p-5 flex flex-col gap-3 hover:border-zinc-600 transition-all duration-200 group ${cat.color}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{cat.icon}</span>
                  <span className={`text-xs font-bold uppercase tracking-wide ${cat.tagColor}`}>
                    {cat.title}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed" dir="rtl">
                  {cat.desc}
                </p>
                <div className="flex flex-col gap-1 pt-2 border-t border-zinc-800">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-zinc-500" dir="auto">Price:</p>
                    <p className="text-xs font-bold text-white">{cat.priceRange}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-zinc-500" dir="auto">Top Pick:</p>
                    <p className="text-xs font-bold text-red-400">{cat.topPick}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── COMPARISON TABLE ─── */}
        <section className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white">
              Quick Comparison ⚡
            </h2>
            <p className="text-xl font-black uppercase text-white" dir="rtl">
              مقارنة سريعة لأهم الـ Gear في السوق:
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden overflow-x-auto">
            <table className="w-full text-xs min-w-[600px]">
              <thead>
                <tr className="border-b border-zinc-800">
                  {["الجهاز", "النوع", "Price", "الأفضل لـ", "الدقة", "GPS", "البطارية"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-zinc-500 font-bold uppercase tracking-wide"
                      dir="rtl"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonTable.map((row, i) => (
                  <tr
                    key={row.gear}
                    className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-black text-white">{row.gear}</td>
                    <td className="px-4 py-3 text-zinc-400">{row.type}</td>
                    <td className="px-4 py-3 font-bold text-red-400">{row.price}</td>
                    <td className="px-4 py-3 text-zinc-400" dir="rtl">{row.best}</td>
                    <td className="px-4 py-3">{row.accuracy}</td>
                    <td className="px-4 py-3">{row.gps}</td>
                    <td className="px-4 py-3 text-zinc-400">{row.battery}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="bg-gradient-to-br from-red-600/20 to-zinc-900 border border-red-500/20 rounded-2xl p-8 flex flex-col gap-5 items-center text-center">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🇪🇬</span>
            <span className="text-4xl">🛒</span>
          </div>
          <h3 className="text-xl font-black uppercase text-white">
            Pulse Gear Egypt — وصّلك الـ Gear الصح
          </h3>
          <p className="text-zinc-400 text-sm max-w-md leading-relaxed" dir="rtl">
            كل الـ Gear في المقالات دي متاح في Pulse Gear Egypt بأسعار
            مناسبة بالجنيه المصري. تواصل معانا وهنساعدك تختار الـ Pack
            المناسب لمستواك وميزانيتك. 💪
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
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

        {/* ─── EXPLORE OTHER CATEGORIES ─── */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-black uppercase text-white">
            استكشف كمان 🗂️
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                href: "/blog/training-guide",
                icon: "📊",
                tag: "Training Guide",
                title: "اتدرب بذكاء",
                desc: "HR Zones: والـ Zone 2 والـ Recovery كل علم التدريب في مكان واحد.",
                color: "text-purple-400",
              },
              {
                href: "/blog/gear-review",
                icon: "⭐",
                tag: "Gear Review",
                title: "Reviews وتجارب حقيقية",
                desc: "مقارنات ومراجعات للـ Gear الأكتر مبيعاً في السوق.",
                color: "text-orange-400",
              },
            ].map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-6 flex flex-col gap-3 transition-all duration-200 group"
              >
                <span className="text-3xl">{cat.icon}</span>
                <p className={`text-xs font-bold uppercase tracking-wide ${cat.color}`}>
                  {cat.tag}
                </p>
                <p className="font-black text-white text-sm uppercase tracking-wide group-hover:text-red-400 transition-colors duration-200">
                  {cat.title}
                </p>
                <p className="text-xs text-zinc-500 leading-relaxed" dir="rtl">
                  {cat.desc}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Back */}
        <div className="flex justify-center pt-4">
          <Link
            href="/blog"
            className="border border-zinc-700 hover:border-white text-zinc-400 hover:text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wide transition-all duration-200"
          >
            ← Back to Blog
          </Link>
        </div>

      </div>
    </main>
  );
}