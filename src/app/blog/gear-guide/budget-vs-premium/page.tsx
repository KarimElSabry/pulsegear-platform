// src/app/blog/gear-guide/budget-vs-premium/page.tsx


import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Budget vs Premium Gear 2026 | Pulse Gear Egypt Blog",
  description:
    "مقارنة شاملة بين الـ Budget والـ Premium Gear — إيه اللي يستحق فلوسك وإيه اللي مش محتاجه. متاح في Pulse Gear Egypt بأسعار مناسبة بالجنيه المصري.",
  openGraph: {
    title: "Budget vs Premium Gear 2026 | Pulse Gear Egypt",
    description:
      "مقارنة شاملة بين الـ Budget والـ Premium Gear — إيه اللي يستحق فلوسك.",
    type: "article",
  },
};

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */

const comparisons = [
  {
    category: "Heart Rate Monitors",
    icon: "🫀",
    budget: {
      name: "Polar H9",
      price: "~3,000 EGP",
      badge: "💰 Budget Pick",
      badgeColor: "text-green-400 bg-green-400/10 border-green-400/30",
      specs: [
        { label: "Accuracy", value: "✅ عالية جداً" },
        { label: "Connectivity", value: "BT 5.0 + ANT+" },
        { label: "Battery", value: "400 hrs" },
        { label: "Memory", value: "❌ لأ" },
        { label: "HRV", value: "✅ أيوه" },
        { label: "ECG", value: "✅ أيوه" },
      ],
      pros: ["دقة عالية جداً بسعر منخفض", "بيشتغل مع كل الـ Apps", "خفيف ومريح"],
      cons: ["مفيش ذاكرة داخلية", "مفيش Running Dynamics"],
      verdict: "أفضل خيار للمبتدئ — نفس دقة الـ H10 في الـ HR الأساسي.",
    },
    premium: {
      name: "Polar H10",
      price: "~4,500 EGP",
      badge: "🏆 Premium Pick",
      badgeColor: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
      specs: [
        { label: "Accuracy", value: "✅ الأعلى في السوق" },
        { label: "Connectivity", value: "BT 5.0 + ANT+" },
        { label: "Battery", value: "400 hrs" },
        { label: "Memory", value: "✅ جلسة واحدة" },
        { label: "HRV", value: "✅ أيوه" },
        { label: "ECG", value: "✅ أيوه" },
      ],
      pros: ["الأدق في السوق — دقة طبية مثبتة", "ذاكرة داخلية لجلسة بدون هاتف", "مناسب للسباحة 30m"],
      cons: ["أغلى من الـ H9 بـ ~1,500 EGP", "محتاج تبلله قبل اللبس"],
      verdict: "يستحق الفرق لو بتسبح أو محتاج الذاكرة الداخلية.",
    },
    worthIt: "الـ Premium يستحق لو بتسبح أو عايز الذاكرة الداخلية. غير كده الـ H9 كافي تماماً.",
  },
  {
    category: "GPS Watches — Entry Level",
    icon: "⌚",
    budget: {
      name: "Coros Pace 3",
      price: "~11,500 EGP",
      badge: "💰 Budget Pick",
      badgeColor: "text-green-400 bg-green-400/10 border-green-400/30",
      specs: [
        { label: "Display", value: "MIP 1.2\"" },
        { label: "Battery GPS", value: "38 hrs" },
        { label: "GPS", value: "Dual-Frequency" },
        { label: "HRV", value: "✅ أيوه" },
        { label: "Maps", value: "❌ لأ" },
        { label: "Weight", value: "30g فقط" },
      ],
      pros: ["أخف GPS Watch في السوق — 30g", "38 ساعة GPS Battery", "Dual-Frequency GPS بسعر منخفض", "Training Load مجاناً"],
      cons: ["مفيش Onboard Maps", "الشاشة MIP مش AMOLED", "الـ Smartwatch Features محدودة"],
      verdict: "أفضل GPS Watch للـ Budget-Conscious Runner — مفيش منافس في السعر ده.",
    },
    premium: {
      name: "Garmin Forerunner 265",
      price: "~20,000 EGP",
      badge: "🏆 Premium Pick",
      badgeColor: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
      specs: [
        { label: "Display", value: "AMOLED 1.3\"" },
        { label: "Battery GPS", value: "24 hrs" },
        { label: "GPS", value: "Multi-Band" },
        { label: "HRV", value: "✅ HRV Status" },
        { label: "Maps", value: "❌ لأ" },
        { label: "Weight", value: "47g" },
      ],
      pros: ["AMOLED Display رائعة", "HRV Status يومي", "Training Readiness", "Garmin Ecosystem كامل"],
      cons: ["Battery GPS أقل من Coros", "أتقل من Coros بـ 17g", "أغلى بـ ~8,500 EGP"],
      verdict: "يستحق لو الـ AMOLED والـ Garmin Ecosystem مهمين ليك.",
    },
    worthIt: "الـ Coros Pace 3 أفضل قيمة بكتير — الـ Garmin يستحق بس لو الـ AMOLED وGarmin Ecosystem أولوية.",
  },
  {
    category: "GPS Watches — Advanced",
    icon: "🏆",
    budget: {
      name: "Garmin Forerunner 265",
      price: "~20,000 EGP",
      badge: "💰 Mid-Range",
      badgeColor: "text-green-400 bg-green-400/10 border-green-400/30",
      specs: [
        { label: "Display", value: "AMOLED 1.3\"" },
        { label: "Battery GPS", value: "24 hrs" },
        { label: "GPS", value: "Multi-Band" },
        { label: "HRV", value: "✅ HRV Status" },
        { label: "Maps", value: "❌ لأ" },
        { label: "Training Readiness", value: "✅ أيوه" },
      ],
      pros: ["AMOLED ممتازة", "Training Readiness وHRV Status", "Multi-Band GPS", "Garmin Ecosystem"],
      cons: ["مفيش Onboard Maps", "Battery أقل من الـ 965"],
      verdict: "الأفضل للـ Serious Runner اللي مش محتاج Maps.",
    },
    premium: {
      name: "Garmin Forerunner 965",
      price: "~30,000 EGP",
      badge: "🏆 Premium Pick",
      badgeColor: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
      specs: [
        { label: "Display", value: "AMOLED 1.4\"" },
        { label: "Battery GPS", value: "31 hrs" },
        { label: "GPS", value: "Multi-Band" },
        { label: "HRV", value: "✅ HRV Status" },
        { label: "Maps", value: "✅ Onboard Maps" },
        { label: "Training Readiness", value: "✅ أيوه" },
      ],
      pros: ["Onboard Maps كاملة", "أكبر شاشة AMOLED في الفئة", "Battery أطول", "كل الـ Features الموجودة في الـ 265 وأكتر"],
      cons: ["أغلى بـ ~10,000 EGP من الـ 265", "أتقل شوية"],
      verdict: "يستحق الفرق بس لو الـ Onboard Maps ضرورية ليك — Trail Running أو Hiking.",
    },
    worthIt: "الـ FR 265 كافي لـ 90% من الـ Runners. الـ FR 965 بس لو بتعمل Trail Running أو محتاج Maps.",
  },
  {
    category: "Recovery Tools",
    icon: "💆",
    budget: {
      name: "Foam Roller",
      price: "~500 EGP",
      badge: "💰 Budget Pick",
      badgeColor: "text-green-400 bg-green-400/10 border-green-400/30",
      specs: [
        { label: "Type", value: "Static Pressure" },
        { label: "Areas", value: "كل الجسم" },
        { label: "Portability", value: "✅ سهل" },
        { label: "Battery", value: "مش محتاج" },
        { label: "Intensity", value: "متوسطة" },
        { label: "Learning Curve", value: "سهل جداً" },
      ],
      pros: ["أرخص Recovery Tool فعّال", "بيشتغل على كل العضلات", "مش محتاج شحن أو بطارية", "سهل الاستخدام"],
      cons: ["مش بيوصل للعضلات العميقة", "محتاج وقت أطول من الـ Theragun"],
      verdict: "أساسي لكل Athlete — لازم يبقى عندك من اليوم الأول.",
    },
    premium: {
      name: "Theragun Prime",
      price: "~12,000 EGP",
      badge: "🏆 Premium Pick",
      badgeColor: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
      specs: [
        { label: "Type", value: "Percussive Therapy" },
        { label: "Areas", value: "كل الجسم" },
        { label: "Portability", value: "✅ سهل" },
        { label: "Battery", value: "120 min" },
        { label: "Intensity", value: "عالية جداً" },
        { label: "Learning Curve", value: "سهل" },
      ],
      pros: ["بيوصل للعضلات العميقة", "أسرع Recovery بشكل ملحوظ", "5 Speeds مختلفة", "مناسب للـ Post-Race Recovery"],
      cons: ["غالي جداً", "محتاج شحن", "ممكن يكون قوي أوي للمبتدئ"],
      verdict: "يستحق لو بتتمرن 5+ أيام في الأسبوع وعندك Sessions شديدة.",
    },
    worthIt: "الـ Foam Roller أساسي للكل. الـ Theragun يستحق بس لو بتتمرن بجدية عالية — 5+ أيام في الأسبوع.",
  },
];

const valueMatrix = [
  {
    product: "Polar H9",
    price: "~3,000 EGP",
    value: 10,
    for: "الكل",
    skip: "لو محتاج ذاكرة داخلية",
  },
  {
    product: "Polar H10",
    price: "~4,500 EGP",
    value: 9,
    for: "Swimmers + Advanced Athletes",
    skip: "لو مش بتسبح",
  },
  {
    product: "Coros Pace 3",
    price: "~11,500 EGP",
    value: 10,
    for: "Budget Runners",
    skip: "لو محتاج Maps",
  },
  {
    product: "Garmin FR 265",
    price: "~20,000 EGP",
    value: 8,
    for: "Garmin Ecosystem Lovers",
    skip: "لو مش محتاج AMOLED",
  },
  {
    product: "Garmin FR 965",
    price: "~30,000 EGP",
    value: 7,
    for: "Trail Runners + Map Lovers",
    skip: "لو مش بتعمل Trail Running",
  },
  {
    product: "Foam Roller",
    price: "~500 EGP",
    value: 10,
    for: "الكل — بدون استثناء",
    skip: "مفيش سبب تتخطاه",
  },
  {
    product: "Theragun Prime",
    price: "~12,000 EGP",
    value: 7,
    for: "High-Volume Athletes",
    skip: "لو بتتمرن أقل من 5 أيام",
  },
];

const budgetTiers = [
  {
    tier: "Tier 1 — الـ Essentials",
    range: "~3,500 EGP",
    color: "border-green-500/30 bg-green-500/5",
    titleColor: "text-green-400",
    icon: "🌱",
    items: ["Polar H9 — ~3,000 EGP", "Foam Roller — ~500 EGP"],
    note: "كل اللي محتاجه للبداية — مفيش أقل من كده.",
  },
  {
    tier: "Tier 2 — الـ Serious Setup",
    range: "~16,000 EGP",
    color: "border-blue-500/30 bg-blue-500/5",
    titleColor: "text-blue-400",
    icon: "💪",
    items: ["Polar H10 — ~4,500 EGP", "Coros Pace 3 — ~11,500 EGP", "Foam Roller — ~500 EGP"],
    note: "الـ Setup المثالي للـ Serious Runner — أفضل قيمة في السوق.",
  },
  {
    tier: "Tier 3 — الـ Advanced Setup",
    range: "~35,000 EGP",
    color: "border-yellow-500/30 bg-yellow-500/5",
    titleColor: "text-yellow-400",
    icon: "🏆",
    items: ["Polar H10 — ~4,500 EGP", "Garmin FR 965 — ~30,000 EGP", "Foam Roller — ~500 EGP"],
    note: "للـ Dedicated Athletes — أفضل Ecosystem وأفضل Running Metrics.",
  },
  {
    tier: "Tier 4 — الـ Full Pro Setup",
    range: "~47,500 EGP",
    color: "border-red-500/30 bg-red-500/5",
    titleColor: "text-red-400",
    icon: "🔥",
    items: ["Polar H10 — ~4,500 EGP", "Garmin FR 965 — ~30,000 EGP", "Theragun Prime — ~12,000 EGP", "Foam Roller — ~500 EGP"],
    note: "الـ Full Setup للـ Competitive Athletes — مفيش حاجة فوق ده للـ Amateur.",
  },
];

const faqs = [
  {
    q: "هل الـ Premium Gear بيخليني أسرع؟",
    a: "لأ مباشرةً — الـ Gear بيساعدك تتدرب أذكى مش أسرع. الـ Consistency والـ Training Plan أهم بكتير من الـ Gear.",
  },
  {
    q: "إيه أهم حاجة أشتريها أول؟",
    a: "Polar H9 + Foam Roller — ~3,500 EGP بس. ده كل اللي محتاجه للبداية الصح.",
  },
  {
    q: "الـ Coros Pace 3 ولا الـ Garmin FR 265؟",
    a: "Coros Pace 3 أفضل قيمة بكتير — Dual GPS وBattery أطول بسعر أقل. الـ Garmin يستحق بس لو الـ AMOLED والـ Garmin Ecosystem أولوية.",
  },
  {
    q: "الـ Theragun يستحق فعلاً؟",
    a: "لو بتتمرن 5+ أيام في الأسبوع — أيوه يستحق. لو أقل من كده، الـ Foam Roller كافي تماماً.",
  },
  {
    q: "فين أقدر أشتري الـ Gear ده في مصر؟",
    a: "كل الـ Gear ده متاح في Pulse Gear Egypt بأسعار مناسبة بالجنيه المصري — تواصل معانا وهنساعدك تختار الصح لميزانيتك.",
  },
];

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */

export default function BudgetVsPremiumPage() {
  return (
    <main className="w-full bg-zinc-950 min-h-screen text-white">

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section className="w-full border-b border-zinc-800 py-20 px-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wide flex-wrap">
            <Link href="/" className="hover:text-white transition-colors duration-200">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-white transition-colors duration-200">Blog</Link>
            <span>/</span>
            <Link href="/blog/gear-guide" className="hover:text-white transition-colors duration-200">Gear Guide</Link>
            <span>/</span>
            <span className="text-zinc-400">Budget vs Premium</span>
          </div>

          <span className="self-start text-xs font-bold uppercase tracking-wide text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full">
            Comparison Guide 2026
          </span>

          <h1 className="text-4xl md:text-5xl font-black uppercase leading-tight">
            Budget vs Premium Gear 💰
            <br />
            <span className="text-red-500">إيه اللي يستحق فلوسك؟</span>
          </h1>

          <p className="text-lg text-zinc-400 leading-relaxed">
            مش كل الـ Premium Gear يستحق الفرق في السعر — وفي نفس الوقت
            مش كل الـ Budget Gear كافي. مقارنة شاملة بالأرقام الحقيقية
            بالجنيه المصري عشان تاخد القرار الصح. كل الأجهزة متاحة في{" "}
            <span className="text-white font-bold">Pulse Gear Egypt</span>. 🇪🇬
          </p>

          <div className="flex items-center gap-4 text-xs text-zinc-500 flex-wrap">
            <span>⏱ 10 min read</span>
            <span>•</span>
            <span>💰 Comparison Guide</span>
            <span>•</span>
            <span>Updated 2026</span>
          </div>

          {/* Pulse Gear Egypt Banner */}
          <div className="bg-red-600/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
            <span className="text-2xl shrink-0">🇪🇬</span>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-bold text-white">متاح في Pulse Gear Egypt</p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                كل الأجهزة في المقال ده بتقدر تطلبها عن طريق Pulse Gear Egypt
                بأسعار مناسبة بالجنيه المصري — بدون تعقيدات الاستيراد أو الوسطاء.
              </p>
            </div>
          </div>

          {/* Table of Contents */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
              📋 Table of Contents
            </p>
            {[
              { href: "#comparisons", label: "المقارنات التفصيلية" },
              { href: "#value-matrix", label: "Value Matrix — إيه يستحق؟" },
              { href: "#budget-tiers", label: "الـ Budget Tiers" },
              { href: "#faq", label: "الأسئلة الشائعة" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors duration-200 group"
              >
                <span className="w-1 h-1 rounded-full bg-zinc-600 group-hover:bg-red-500 transition-colors duration-200 shrink-0" />
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          ARTICLE BODY
      ══════════════════════════════════════ */}
      <article className="max-w-3xl mx-auto px-6 py-16 flex flex-col gap-20">

        {/* ─── COMPARISONS ─── */}
        <section id="comparisons" className="flex flex-col gap-10">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white">
              المقارنات التفصيلية ⚖️
            </h2>
            <p className="text-sm text-zinc-500">
              Budget vs Premium — بالأرقام والـ Specs الحقيقية
            </p>
          </div>

          {comparisons.map((comp) => (
            <div key={comp.category} className="flex flex-col gap-4">

              {/* Category Header */}
              <div className="flex items-center gap-3">
                <span className="text-2xl">{comp.icon}</span>
                <h3 className="text-lg font-black uppercase text-white">
                  {comp.category}
                </h3>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[comp.budget, comp.premium].map((item) => (
                  <div
                    key={item.name}
                    className="border border-zinc-800 bg-zinc-900 rounded-2xl overflow-hidden"
                  >
                    {/* Card Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 flex-wrap gap-2">
                      <div className="flex flex-col gap-1">
                        <p className="font-black text-white">{item.name}</p>
                        <span className={`self-start text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-white">{item.price}</p>
                        <p className="text-xs text-zinc-500">عبر Pulse Gear Egypt</p>
                      </div>
                    </div>

                    {/* Specs */}
                    <div className="grid grid-cols-2 gap-px bg-zinc-800">
                      {item.specs.map((spec) => (
                        <div key={spec.label} className="bg-zinc-950 p-3 flex flex-col gap-1">
                          <p className="text-xs text-zinc-500 uppercase tracking-wide">
                            {spec.label}
                          </p>
                          <p className="text-xs font-bold text-white">{spec.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Pros & Cons */}
                    <div className="p-4 flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        {item.pros.map((pro, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-green-400 text-xs shrink-0 mt-0.5">+</span>
                            <p className="text-xs text-zinc-400">{pro}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col gap-1">
                        {item.cons.map((con, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-red-400 text-xs shrink-0 mt-0.5">−</span>
                            <p className="text-xs text-zinc-400">{con}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Verdict */}
                    <div className="px-4 pb-4">
                      <div className="bg-zinc-800 rounded-xl p-3">
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          <span className="font-bold text-white">⚡ الحكم: </span>
                          {item.verdict}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Worth It Banner */}
              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-4 flex items-start gap-3">
                <span className="text-yellow-400 text-lg shrink-0">💡</span>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  <span className="font-bold text-yellow-400">الخلاصة: </span>
                  {comp.worthIt}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* ─── VALUE MATRIX ─── */}
        <section id="value-matrix" className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white">
              Value Matrix 📊
            </h2>
            <p className="text-sm text-zinc-500">
              إيه اللي يستحق فلوسك — وإيه اللي تتخطاه
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-4 bg-zinc-800 px-5 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">المنتج</p>
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">السعر</p>
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">لمين؟</p>
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">تخطاه لو</p>
            </div>
            {valueMatrix.map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-4 px-5 py-4 border-t border-zinc-800 hover:bg-zinc-800/50 transition-colors gap-2"
              >
                <p className="text-sm font-bold text-white">{row.product}</p>
                <p className="text-sm font-bold text-red-400">{row.price}</p>
                <p className="text-xs text-zinc-400 leading-relaxed">{row.for}</p>
                <p className="text-xs text-zinc-500 leading-relaxed">{row.skip}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── BUDGET TIERS ─── */}
        <section id="budget-tiers" className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white">
              الـ Budget Tiers 💸
            </h2>
            <p className="text-sm text-zinc-500">
              اختار الـ Tier المناسب لميزانيتك
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {budgetTiers.map((tier) => (
              <div
                key={tier.tier}
                className={`border rounded-2xl p-6 flex flex-col gap-4 ${tier.color}`}
              >
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{tier.icon}</span>
                    <p className={`font-black uppercase text-sm ${tier.titleColor}`}>
                      {tier.tier}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-white">{tier.range}</p>
                    <p className="text-xs text-zinc-500">إجمالي الـ Setup</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {tier.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-red-400 text-xs shrink-0">•</span>
                      <p className="text-sm text-zinc-300">{item}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-zinc-900/50 rounded-xl p-3">
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    <span className="font-bold text-white">💡 </span>
                    {tier.note}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section id="faq" className="flex flex-col gap-6">
          <h2 className="text-2xl font-black uppercase text-white">
            الأسئلة الشائعة ❓
          </h2>
          <div className="flex flex-col gap-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3"
              >
                <p className="font-bold text-white text-sm">س: {faq.q}</p>
                <p className="text-xs text-zinc-400 leading-relaxed border-t border-zinc-800 pt-3">
                  <span className="text-red-400 font-bold">ج: </span>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── PULSE GEAR EGYPT CTA ─── */}
        <section className="bg-gradient-to-br from-red-600/20 to-zinc-900 border border-red-500/20 rounded-2xl p-8 flex flex-col gap-5 items-center text-center">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🇪🇬</span>
            <span className="text-4xl">🛒</span>
          </div>
          <h3 className="text-xl font-black uppercase text-white">
            Pulse Gear Egypt — وصّلك الـ Gear الصح
          </h3>
          <p className="text-zinc-400 text-sm max-w-md leading-relaxed">
            في Pulse Gear Egypt، بنوفرلك أفضل أجهزة التدريب العالمية
            بأسعار مناسبة بالجنيه المصري — بدون تعقيدات الاستيراد أو
            الوسطاء. تواصل معانا وهنساعدك تختار الـ Gear المناسب
            لميزانيتك ومستواك. 💪
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

        {/* Related Articles */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-black uppercase text-white">
            اقرأ كمان 📚
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { href: "/blog/best-heart-rate-monitors", icon: "🫀", tag: "Gear Guide", title: "Best Heart Rate Monitors 2026" },
              { href: "/blog/gear-guide/beginners-guide", icon: "🌱", tag: "Beginner", title: "Beginner's Gear Guide" },
              { href: "/blog/complete-training-setup", icon: "🔧", tag: "Complete Guide", title: "Complete Training Setup" },
            ].map((article) => (
              <Link
                key={article.href}
                href={article.href}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-5 flex flex-col gap-3 transition-colors duration-200 group"
              >
                <span className="text-2xl">{article.icon}</span>
                <p className="text-xs font-bold uppercase tracking-wide text-red-400">
                  {article.tag}
                </p>
                <p className="font-bold text-white text-sm group-hover:text-red-400 transition-colors duration-200">
                  {article.title}
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

      </article>
    </main>
  );
}