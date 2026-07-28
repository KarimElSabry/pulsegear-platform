import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Best Heart Rate Monitors 2026 | Pulse Gear Egypt Blog",
  description:
    "أفضل أجهزة قياس ضربات القلب في 2026 — متاحة في Pulse Gear Egypt بأسعار مناسبة بالجنيه المصري.",
  openGraph: {
    title: "Best Heart Rate Monitors 2026 | Pulse Gear Egypt",
    description:
      "أفضل أجهزة قياس ضربات القلب في 2026 — متاحة في Pulse Gear Egypt.",
    type: "article",
  },
};

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */

const chestStraps = [
  {
    rank: 1,
    name: "Polar H10",
    badge: "🏆 Best Overall",
    badgeColor: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
    color: "border-yellow-500/30 bg-yellow-500/5",
    price: "~4,500 EGP",
    connectivity: "Bluetooth 5.0 + ANT+",
    battery: "400 hrs",
    memory: "✅ 1 session",
    waterproof: "IPX7 — 30m",
    ecg: "✅",
    hrv: "✅",
    pros: [
      "الأدق في السوق — دقة طبية مثبتة في دراسات مستقلة",
      "بيشتغل مع كل الـ Apps: Garmin، Wahoo، Zwift، Strava",
      "ذاكرة داخلية لتسجيل جلسة بدون هاتف",
      "مناسب للسباحة حتى 30 متر",
    ],
    cons: [
      "السعر أعلى من المنافسين",
      "محتاج تبلله قبل اللبس",
    ],
    verdict:
      "الخيار الأول لأي Serious Athlete — مفيش منافس حقيقي في الدقة.",
  },
  {
    rank: 2,
    name: "Garmin HRM-Pro Plus",
    badge: "🥈 Best for Garmin Users",
    badgeColor: "text-blue-400 bg-blue-400/10 border-blue-400/30",
    color: "border-blue-500/30 bg-blue-500/5",
    price: "~6,500 EGP",
    connectivity: "Bluetooth 5.0 + ANT+",
    battery: "500 hrs",
    memory: "✅ Multi-session",
    waterproof: "IPX7 — 30m",
    ecg: "✅",
    hrv: "✅",
    pros: [
      "أطول Battery Life في الفئة — 500 ساعة",
      "Running Dynamics: Cadence، Stride Length، Ground Contact",
      "بيسجل أكتر من جلسة في الذاكرة الداخلية",
      "Integration كاملة مع Garmin Connect",
    ],
    cons: [
      "الـ Running Dynamics مش بتشتغل إلا مع Garmin Watches",
      "السعر مرتفع",
    ],
    verdict:
      "الأفضل لو عندك Garmin Watch — بتاخد أقصى استفادة من الـ Ecosystem.",
  },
  {
    rank: 3,
    name: "Wahoo TICKR X",
    badge: "🥉 Best Value",
    badgeColor: "text-green-400 bg-green-400/10 border-green-400/30",
    color: "border-green-500/30 bg-green-500/5",
    price: "~4,000 EGP",
    connectivity: "Bluetooth 5.0 + ANT+",
    battery: "500 hrs",
    memory: "✅ 16 hrs",
    waterproof: "IPX7",
    ecg: "✅",
    hrv: "✅",
    pros: [
      "أفضل سعر في الفئة المتقدمة",
      "بيشتغل مع Peloton، Zwift، وكل الـ Fitness Apps",
      "Running Dynamics بدون الحاجة لـ Garmin",
      "500 ساعة Battery Life",
    ],
    cons: [
      "الـ App مش بنفس مستوى Polar أو Garmin",
      "الـ Strap ممكن يكون أقل راحة على المدى الطويل",
    ],
    verdict:
      "أفضل خيار لو عايز دقة عالية بسعر معقول ومش متقيد بـ Ecosystem معين.",
  },
  {
    rank: 4,
    name: "Polar H9",
    badge: "💰 Best Budget",
    badgeColor: "text-orange-400 bg-orange-400/10 border-orange-400/30",
    color: "border-orange-500/30 bg-orange-500/5",
    price: "~3,000 EGP",
    connectivity: "Bluetooth 5.0 + ANT+",
    battery: "400 hrs",
    memory: "❌ No",
    waterproof: "IPX7",
    ecg: "✅",
    hrv: "✅",
    pros: [
      "أرخص Chest Strap بدقة عالية في السوق",
      "نفس دقة الـ H10 في الـ HR",
      "خفيف ومريح",
      "بيشتغل مع كل الـ Apps",
    ],
    cons: [
      "مفيش ذاكرة داخلية",
      "مش بيجي مع ANT+ في بعض الإصدارات القديمة",
    ],
    verdict:
      "الخيار المثالي للـ Beginner أو اللي عايز يجرب الـ Chest Strap بأقل تكلفة.",
  },
];

const opticalWatches = [
  {
    rank: 1,
    name: "Garmin Forerunner 965",
    badge: "🏆 Best Running Watch",
    badgeColor: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
    color: "border-yellow-500/30 bg-yellow-500/5",
    price: "~30,000 EGP",
    display: "AMOLED 1.4\"",
    battery: "31 days / 31 hrs GPS",
    gps: "Multi-Band GPS",
    hrv: "✅ HRV Status",
    recovery: "✅ Training Readiness",
    maps: "✅ Onboard Maps",
    pros: [
      "أفضل Running Metrics في السوق",
      "Training Readiness وHRV Status يومياً",
      "Multi-Band GPS — دقة عالية جداً",
      "Onboard Maps كاملة",
      "Battery Life ممتازة",
    ],
    cons: [
      "سعر مرتفع",
      "الـ Optical HR مش بنفس دقة الـ Chest Strap في الـ HIIT",
    ],
    verdict:
      "الأفضل للـ Serious Runners اللي عايزين كل حاجة في جهاز واحد.",
  },
  {
    rank: 2,
    name: "Polar Vantage V3",
    badge: "🥈 Best for Triathletes",
    badgeColor: "text-blue-400 bg-blue-400/10 border-blue-400/30",
    color: "border-blue-500/30 bg-blue-500/5",
    price: "~30,000 EGP",
    display: "AMOLED 1.39\"",
    battery: "40 days / 43 hrs GPS",
    gps: "Dual-Frequency GPS",
    hrv: "✅ Nightly HRV",
    recovery: "✅ Orthostatic Test",
    maps: "✅ Onboard Maps",
    pros: [
      "أطول Battery Life في الفئة — 43 ساعة GPS",
      "Orthostatic Test لقياس الـ Recovery بدقة",
      "ECG مدمج في الساعة نفسها",
      "ممتاز للـ Triathlon والـ Multi-Sport",
    ],
    cons: [
      "الـ App Ecosystem أصغر من Garmin",
      "الـ Smartwatch Features أقل من Garmin",
    ],
    verdict:
      "الأفضل للـ Triathletes والـ Endurance Athletes اللي بيحتاجوا Battery طويلة.",
  },
  {
    rank: 3,
    name: "Apple Watch Ultra 2",
    badge: "🥉 Best for iPhone Users",
    badgeColor: "text-purple-400 bg-purple-400/10 border-purple-400/30",
    color: "border-purple-500/30 bg-purple-500/5",
    price: "~40,000 EGP",
    display: "LTPO OLED 1.92\"",
    battery: "36 hrs / 60 hrs Low Power",
    gps: "Dual-Frequency GPS + L5",
    hrv: "✅",
    recovery: "✅ Training Load",
    maps: "✅ Offline Maps",
    pros: [
      "أقوى Smartwatch في السوق للـ iPhone Users",
      "Dual-Frequency GPS + L5 دقة استثنائية",
      "Crash Detection وEmergency SOS",
      "أفضل Smartwatch Features بدون منافس",
    ],
    cons: [
      "يشتغل بس مع iPhone",
      "Battery Life أقل من Garmin وPolar",
      "السعر الأعلى في الفئة",
    ],
    verdict:
      "الأفضل لو iPhone User وعايز أفضل Smartwatch Experience مع Training Features.",
  },
  {
    rank: 4,
    name: "Coros Pace 3",
    badge: "💰 Best Budget GPS",
    badgeColor: "text-green-400 bg-green-400/10 border-green-400/30",
    color: "border-green-500/30 bg-green-500/5",
    price: "~11,500 EGP",
    display: "MIP 1.2\"",
    battery: "17 days / 38 hrs GPS",
    gps: "Dual-Frequency GPS",
    hrv: "✅",
    recovery: "✅ Training Load",
    maps: "❌ No Onboard Maps",
    pros: [
      "أفضل سعر في فئة الـ Dual-Frequency GPS",
      "38 ساعة GPS Battery Life",
      "خفيف جداً — 30 جرام بس",
      "Training Load وHRV مجاناً",
    ],
    cons: [
      "مفيش Onboard Maps",
      "الشاشة MIP مش AMOLED",
      "الـ Smartwatch Features محدودة",
    ],
    verdict:
      "أفضل خيار للـ Budget-Conscious Runner اللي عايز Dual GPS بسعر معقول.",
  },
];

const quickPicks = [
  { case: "أدق Chest Strap", pick: "Polar H10", price: "~4,500 EGP" },
  { case: "أفضل لـ Garmin Users", pick: "Garmin HRM-Pro Plus", price: "~6,500 EGP" },
  { case: "أرخص Chest Strap جيد", pick: "Polar H9", price: "~3,000 EGP" },
  { case: "أفضل Running Watch", pick: "Garmin Forerunner 965", price: "~30,000 EGP" },
  { case: "أفضل لـ Triathletes", pick: "Polar Vantage V3", price: "~30,000 EGP" },
  { case: "أفضل لـ iPhone Users", pick: "Apple Watch Ultra 2", price: "~40,000 EGP" },
  { case: "أرخص GPS Watch جيد", pick: "Coros Pace 3", price: "~11,500 EGP" },
];

const faqs = [
  {
    q: "Chest Strap ولا GPS Watch — أبدأ بإيه؟",
    a: "ابدأ بـ Chest Strap زي الـ Polar H9. أرخص وأدق — وبعدين لما تعرف إيه اللي محتاجه بالظبط، تشتري الـ Watch.",
  },
  {
    q: "الـ Optical HR في الـ Watch بيكفي؟",
    a: "في الـ Easy Runs والـ Zone 2 — أيوه كافي. في الـ HIIT والـ Intervals — لأ، الـ Chest Strap أدق بكتير لأن الـ Optical بيتأخر.",
  },
  {
    q: "HRV — إيه أهميته وإزاي أقيسه؟",
    a: "الـ HRV هو أهم مؤشر للـ Recovery. قيسه كل صبح بعد الاستيقاظ مباشرة بـ Polar H10 أو Oura Ring — لو نازل 3 أيام متتالية، خفف التمرين.",
  },
  {
    q: "Garmin ولا Polar — أنهي أحسن؟",
    a: "Garmin أحسن في الـ Smartwatch Features والـ App Ecosystem. Polar أحسن في الـ Physiological Metrics والـ Recovery Analysis. الاتنين ممتازين — يعتمد على أولوياتك.",
  },
  {
    q: "فين أقدر أشتري الأجهزة دي في مصر؟",
    a: "كل الأجهزة دي متاحة في Pulse Gear Egypt بأسعار مناسبة ومضمونة — تواصل معانا وهنساعدك تختار الصح.",
  },
];

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */

export default function BestHeartRateMonitorsPage() {
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
            <span className="text-zinc-400">Best Heart Rate Monitors</span>
          </div>

          <span className="self-start text-xs font-bold uppercase tracking-wide text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full">
            Gear Guide 2026
          </span>

          <h1 className="text-4xl md:text-5xl font-black uppercase leading-tight">
            Best Heart Rate Monitors 🏆
            <br />
            <span className="text-red-500">Top Picks for 2026</span>
          </h1>

          <p className="text-lg text-zinc-400 leading-relaxed">
            اخترنا أفضل 8 أجهزة قياس ضربات القلب في 2026 —
            4 Chest Straps و4 GPS Watches — بناءً على الدقة والسعر
            والـ Features الحقيقية. كل الأجهزة دي متاحة في{" "}
            <span className="text-white font-bold">Pulse Gear Egypt</span>{" "}
            بأسعار مناسبة بالجنيه المصري. 🇪🇬
          </p>

          <div className="flex items-center gap-4 text-xs text-zinc-500 flex-wrap">
            <span>⏱ 8 min read</span>
            <span>•</span>
            <span>🏆 Gear Guide</span>
            <span>•</span>
            <span>Updated 2026</span>
          </div>

          {/* Pulse Gear Egypt Banner */}
          <div className="bg-red-600/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
            <span className="text-2xl shrink-0">🇪🇬</span>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-bold text-white">
                متاح في Pulse Gear Egypt
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                كل الأجهزة في المقال ده بتقدر تطلبها عن طريق Pulse Gear Egypt
                بأسعار مناسبة ومضمونة — بدون ما تدفع رسوم استيراد مرتفعة أو
                تتعامل مع وسطاء.
              </p>
            </div>
          </div>

          {/* Table of Contents */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
              📋 Table of Contents
            </p>
            {[
              { href: "#chest-straps", label: "Best Chest Straps" },
              { href: "#gps-watches", label: "Best GPS Watches" },
              { href: "#quick-picks", label: "اختار بسرعة" },
              { href: "#how-to-choose", label: "إزاي تختار الصح" },
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

        {/* ─── CHEST STRAPS ─── */}
        <section id="chest-straps" className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white">
              🫀 Best Chest Straps
            </h2>
            <p className="text-sm text-zinc-500">
              للـ Serious Athletes اللي بيدوا الأولوية للدقة
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {chestStraps.map((strap) => (
              <div
                key={strap.name}
                className={`border rounded-2xl overflow-hidden ${strap.color}`}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 flex-wrap gap-3">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-black text-zinc-600">
                      #{strap.rank}
                    </span>
                    <div className="flex flex-col gap-1">
                      <p className="font-black uppercase text-white text-lg">
                        {strap.name}
                      </p>
                      <span className={`self-start text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${strap.badgeColor}`}>
                        {strap.badge}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-white">{strap.price}</p>
                    <p className="text-xs text-zinc-500">عبر Pulse Gear Egypt</p>
                  </div>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-zinc-800">
                  {[
                    { label: "Connectivity", value: strap.connectivity },
                    { label: "Battery", value: strap.battery },
                    { label: "Memory", value: strap.memory },
                    { label: "Waterproof", value: strap.waterproof },
                    { label: "ECG", value: strap.ecg },
                    { label: "HRV", value: strap.hrv },
                  ].map((spec) => (
                    <div key={spec.label} className="bg-zinc-950 p-4 flex flex-col gap-1">
                      <p className="text-xs text-zinc-500 uppercase tracking-wide">
                        {spec.label}
                      </p>
                      <p className="text-sm font-bold text-white">{spec.value}</p>
                    </div>
                  ))}
                </div>

                {/* Pros & Cons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-green-400">
                      ✅ Pros
                    </p>
                    {strap.pros.map((pro, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-green-400 text-xs shrink-0 mt-0.5">+</span>
                        <p className="text-xs text-zinc-400 leading-relaxed">{pro}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-red-400">
                      ❌ Cons
                    </p>
                    {strap.cons.map((con, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-red-400 text-xs shrink-0 mt-0.5">−</span>
                        <p className="text-xs text-zinc-400 leading-relaxed">{con}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verdict */}
                <div className="px-6 pb-6">
                  <div className="bg-zinc-900 rounded-xl p-4 flex items-start gap-3">
                    <span className="text-lg shrink-0">⚡</span>
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      <span className="font-bold text-white">الحكم: </span>
                      {strap.verdict}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── GPS WATCHES ─── */}
        <section id="gps-watches" className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white">
              ⌚ Best GPS Watches
            </h2>
            <p className="text-sm text-zinc-500">
              للـ Athletes اللي عايزين كل حاجة في جهاز واحد
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {opticalWatches.map((watch) => (
              <div
                key={watch.name}
                className={`border rounded-2xl overflow-hidden ${watch.color}`}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 flex-wrap gap-3">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-black text-zinc-600">
                      #{watch.rank}
                    </span>
                    <div className="flex flex-col gap-1">
                      <p className="font-black uppercase text-white text-lg">
                        {watch.name}
                      </p>
                      <span className={`self-start text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${watch.badgeColor}`}>
                        {watch.badge}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-white">{watch.price}</p>
                    <p className="text-xs text-zinc-500">عبر Pulse Gear Egypt</p>
                  </div>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-zinc-800">
                  {[
                    { label: "Display", value: watch.display },
                    { label: "Battery", value: watch.battery },
                    { label: "GPS", value: watch.gps },
                    { label: "HRV", value: watch.hrv },
                    { label: "Recovery", value: watch.recovery },
                    { label: "Maps", value: watch.maps },
                  ].map((spec) => (
                    <div key={spec.label} className="bg-zinc-950 p-4 flex flex-col gap-1">
                      <p className="text-xs text-zinc-500 uppercase tracking-wide">
                        {spec.label}
                      </p>
                      <p className="text-sm font-bold text-white">{spec.value}</p>
                    </div>
                  ))}
                </div>

                {/* Pros & Cons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-green-400">
                      ✅ Pros
                    </p>
                    {watch.pros.map((pro, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-green-400 text-xs shrink-0 mt-0.5">+</span>
                        <p className="text-xs text-zinc-400 leading-relaxed">{pro}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-red-400">
                      ❌ Cons
                    </p>
                    {watch.cons.map((con, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-red-400 text-xs shrink-0 mt-0.5">−</span>
                        <p className="text-xs text-zinc-400 leading-relaxed">{con}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verdict */}
                <div className="px-6 pb-6">
                  <div className="bg-zinc-900 rounded-xl p-4 flex items-start gap-3">
                    <span className="text-lg shrink-0">⚡</span>
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      <span className="font-bold text-white">الحكم: </span>
                      {watch.verdict}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── QUICK PICKS ─── */}
        <section id="quick-picks" className="flex flex-col gap-6">
          <h2 className="text-2xl font-black uppercase text-white">
            اختار بسرعة 🚀
          </h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 bg-zinc-800 px-5 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">الحالة</p>
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">الاختيار</p>
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">السعر (EGP)</p>
            </div>
            {quickPicks.map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-3 px-5 py-4 border-t border-zinc-800 hover:bg-zinc-800/50 transition-colors"
              >
                <p className="text-sm text-zinc-400">{row.case}</p>
                <p className="text-sm font-bold text-white">{row.pick}</p>
                <p className="text-sm font-bold text-red-400">{row.price}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── HOW TO CHOOSE ─── */}
        <section id="how-to-choose" className="flex flex-col gap-6">
          <h2 className="text-2xl font-black uppercase text-white">
            إزاي تختار الصح؟ 🎯
          </h2>
          <div className="flex flex-col gap-4">
            {[
              {
                icon: "🏃",
                title: "لو بتجري بس",
                body: "Polar H9 + موبايل في البداية. بعدين Coros Pace 3 لو عايز GPS. الـ Garmin FR 965 لو عايز الـ Full Experience.",
              },
              {
                icon: "🚴",
                title: "لو بتعمل Cycling",
                body: "Wahoo TICKR X مع الـ Wahoo Elemnt Bolt أو Garmin Edge — أفضل Ecosystem للـ Cycling.",
              },
              {
                icon: "🏊",
                title: "لو بتعمل Triathlon",
                body: "Polar H10 للـ HR + Polar Vantage V3 للـ Watch — أفضل Triathlon Combo في السوق.",
              },
              {
                icon: "💪",
                title: "لو بتعمل Gym / HIIT",
                body: "Polar H9 أو H10 — الـ Chest Strap هو الأدق في التمارين الشديدة. الـ Watch الـ Optical بيتأخر.",
              },
              {
                icon: "📱",
                title: "لو iPhone User",
                body: "Apple Watch Ultra 2 لو عايز أفضل Smartwatch. Garmin أو Polar لو عايز أفضل Training Features.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-start gap-4"
              >
                <span className="text-2xl shrink-0">{item.icon}</span>
                <div className="flex flex-col gap-1">
                  <p className="font-bold text-white text-sm">{item.title}</p>
                  <p className="text-xs text-zinc-400 leading-relaxed">{item.body}</p>
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
                <p className="font-bold text-white text-sm">
                  س: {faq.q}
                </p>
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
            لمستواك وميزانيتك. 💪
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
              { href: "/blog/gear-guide/beginners-guide", icon: "🌱", tag: "Beginner", title: "Beginner's Gear Guide" },
              { href: "/blog/gear-guide/budget-vs-premium", icon: "💰", tag: "Comparison", title: "Budget vs Premium Gear" },
              { href: "/blog/complete-training-setup", icon: "🔧", tag: "Complete Guide", title: "Complete Training Setup" },
            ].map((article) => (
              <Link
                key={article.href}
                href={article.href}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-5 flex flex-col gap-3 transition-colors duration-200 group"
              >
                <span className="text-2xl">{article.icon}</span>
                <p className="text-xs font-bold uppercase tracking-wide text-red-400">{article.tag}</p>
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