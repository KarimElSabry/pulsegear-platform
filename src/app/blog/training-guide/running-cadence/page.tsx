// src/app/blog/running-cadence/page.tsx

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Running Cadence: ليه الـ 180 Steps/Min مهمة؟ | Pulse Gear Egypt Blog",
  description:
    "اعرف إيه هو الـ Running Cadence، ليه الـ 180 Steps/Min هي الـ Magic Number، وإزاي تحسن الـ Cadence بتاعك بالـ Garmin أو Polar أو Coros.",
  openGraph: {
    title: "Running Cadence: ليه الـ 180 Steps/Min مهمة؟ | Pulse Gear Egypt",
    description:
      "اعرف إيه هو الـ Running Cadence وإزاي تحسنه بالـ Data الحقيقية.",
    type: "article",
  },
};

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */

const cadenceZones = [
  {
    range: "أقل من 160 spm",
    label: "Low Cadence",
    color: "border-red-500/30 bg-red-500/5 text-red-400",
    dot: "bg-red-500",
    effect: "Overstriding، ضغط زيادة على الـ Knees والـ Hips",
    risk: "عالي جداً",
    tip: "ركز على تقصير الـ Stride وزيادة الـ Steps",
  },
  {
    range: "160 – 170 spm",
    label: "Below Average",
    color: "border-orange-500/30 bg-orange-500/5 text-orange-400",
    dot: "bg-orange-500",
    effect: "Overstriding خفيف، بتضيع طاقة في كل خطوة",
    risk: "متوسط",
    tip: "زود الـ Cadence بـ 5% كل أسبوعين",
  },
  {
    range: "170 – 180 spm",
    label: "Good",
    color: "border-yellow-500/30 bg-yellow-500/5 text-yellow-400",
    dot: "bg-yellow-500",
    effect: "Running Form كويسة، بس في مجال للتحسين",
    risk: "منخفض",
    tip: "أنت على الطريق الصح، استمر",
  },
  {
    range: "180 spm",
    label: "Optimal ✅",
    color: "border-green-500/30 bg-green-500/5 text-green-400",
    dot: "bg-green-500",
    effect: "أفضل Efficiency، أقل Impact على المفاصل",
    risk: "الأدنى",
    tip: "الـ Sweet Spot للـ Elite والـ Amateur على حد سواء",
  },
  {
    range: "أكتر من 180 spm",
    label: "Elite Zone",
    color: "border-blue-500/30 bg-blue-500/5 text-blue-400",
    dot: "bg-blue-500",
    effect: "الـ Elite Runners بيوصلوا لـ 190-200 spm في السباقات",
    risk: "الأدنى",
    tip: "مش ضروري تستهدفه كـ Amateur، الـ 180 كافية",
  },
];

const watchFeatures = [
  {
    brand: "Garmin",
    icon: "⌚",
    color: "border-blue-500/20 bg-blue-500/5",
    tagColor: "text-blue-400 bg-blue-400/10 border-blue-400/30",
    models: "Forerunner 165 / 255 / 265 / 965",
    features: [
      { label: "Cadence Display", value: "✅ Real-time على الـ Watch" },
      { label: "Cadence Alert", value: "✅ Vibration لو نزلت عن الـ Target" },
      { label: "Running Dynamics", value: "✅ مع الـ HRM-Pro Plus" },
      { label: "Cadence Graph", value: "✅ في Garmin Connect" },
      { label: "Metronome", value: "✅ Built-in في كل الـ Models" },
      { label: "Cadence History", value: "✅ تتبع التحسن على مدار أسابيع" },
    ],
    verdict:
      "الأفضل لتتبع الـ Cadence، خصوصاً مع الـ HRM-Pro Plus اللي بيديك Running Dynamics كاملة.",
    tip: "فعّل الـ Metronome من Settings > Sensors > Metronome واضبطه على 180 bpm.",
  },
  {
    brand: "Polar",
    icon: "🫀",
    color: "border-red-500/20 bg-red-500/5",
    tagColor: "text-red-400 bg-red-400/10 border-red-400/30",
    models: "Pacer / Pacer Pro / Vantage M2 / V3",
    features: [
      { label: "Cadence Display", value: "✅ Real-time على الـ Watch" },
      { label: "Cadence Alert", value: "✅ في الـ Pacer Pro والـ Vantage" },
      { label: "Running Dynamics", value: "✅ مع Polar H10 + Stride Sensor" },
      { label: "Cadence Graph", value: "✅ في Polar Flow" },
      { label: "Metronome", value: "✅ في الـ Pacer Pro والـ Vantage V3" },
      { label: "Cadence History", value: "✅ تتبع كامل في Polar Flow" },
    ],
    verdict:
      "ممتاز لتتبع الـ Cadence مع أفضل HR Accuracy في السوق، الـ Pacer Pro أفضل خيار للـ Serious Runner.",
    tip: "استخدم الـ Running Program في Polar Flow وهيديك Cadence Targets مبنية على مستواك.",
  },
  {
    brand: "Coros",
    icon: "🏔️",
    color: "border-zinc-500/20 bg-zinc-500/5",
    tagColor: "text-zinc-300 bg-zinc-400/10 border-zinc-400/30",
    models: "Pace 3 / Apex 2 / Apex 2 Pro / Vertix 2S",
    features: [
      { label: "Cadence Display", value: "✅ Real-time على الـ Watch" },
      { label: "Cadence Alert", value: "✅ في كل الـ Models" },
      { label: "Running Dynamics", value: "✅ مع Coros Pod 2" },
      { label: "Cadence Graph", value: "✅ في Coros App" },
      { label: "Metronome", value: "✅ Built-in في كل الـ Models" },
      { label: "Cadence History", value: "✅ تتبع كامل في Coros App" },
    ],
    verdict:
      "أفضل Battery Life في الفئة، الـ Pace 3 بسعر منافس جداً مع كل الـ Cadence Features المهمة.",
    tip: "الـ Coros Pod 2 بيديك Ground Contact Time وVertical Oscillation بدون الحاجة لـ Chest Strap.",
  },
];

const improvementPlan = [
  {
    week: "الأسبوع 1-2",
    icon: "📊",
    color: "border-zinc-700",
    title: "Measure First",
    steps: [
      "اعمل Easy Run عادي بدون ما تفكر في الـ Cadence",
      "شوف الـ Average Cadence بتاعك في الـ App",
      "دي هي الـ Baseline بتاعتك",
    ],
    note: "معظم الـ Beginners بيبدأوا بـ 155-165 spm، ده طبيعي تماماً.",
  },
  {
    week: "الأسبوع 3-4",
    icon: "🎵",
    color: "border-yellow-500/30",
    title: "Metronome Training",
    steps: [
      "فعّل الـ Metronome على الـ Watch بتاعك",
      "اضبطه على Cadence الحالية + 5 spm بس",
      "اتدرب معاه 10 دقايق في كل Run",
    ],
    note: "متزودش أكتر من 5-10 spm كل أسبوعين، الزيادة السريعة بتسبب Injury.",
  },
  {
    week: "الأسبوع 5-8",
    icon: "📈",
    color: "border-blue-500/30",
    title: "Progressive Increase",
    steps: [
      "زود الـ Metronome بـ 5 spm كل أسبوعين",
      "ركز على Short & Quick Steps مش Long Strides",
      "اتخيل إنك بتجري على جمر، خطواتك خفيفة وسريعة",
    ],
    note: "في الأسبوع ده هتبدأ تحس بفرق حقيقي في الـ Efficiency.",
  },
  {
    week: "الأسبوع 9-12",
    icon: "🎯",
    color: "border-green-500/30",
    title: "Target 175-180 spm",
    steps: [
      "هتوصل لـ 175-180 spm بشكل طبيعي",
      "الـ Metronome مش ضروري في كل Run دلوقتي",
      "راجع الـ Data كل أسبوع في الـ App",
    ],
    note: "بعد 12 أسبوع، الـ 180 spm هتبقى طبيعية ومش محتاج تفكر فيها.",
  },
];

const myths = [
  {
    myth: "لازم توصل لـ 180 spm بالظبط",
    truth:
      "الـ 180 هي الـ Target المثالية، بس 175-185 spm كلها Optimal Range. متوسطش على رقم بالظبط.",
    icon: "❌",
  },
  {
    myth: "الـ Cadence الأعلى دايماً أحسن",
    truth:
      "فوق الـ 185 spm للـ Amateur مش بيضيف حاجة، وممكن يتعبك أكتر. الـ 180 هي الـ Sweet Spot.",
    icon: "❌",
  },
  {
    myth: "الـ Cadence بتتغير مع السرعة",
    truth:
      "صح! الـ Elite Runners بيزودوا الـ Cadence مع السرعة. في الـ Easy Runs ممكن تكون 170-175 وده طبيعي.",
    icon: "✅",
  },
  {
    myth: "تقدر تحسن الـ Cadence في أسبوع",
    truth:
      "الـ Cadence Improvement محتاج 8-12 أسبوع على الأقل. الجسم محتاج وقت يتأقلم على الـ New Pattern.",
    icon: "❌",
  },
];

const faqs = [
  {
    q: "إيه هو الـ Running Cadence بالظبط؟",
    a: "الـ Running Cadence هو عدد الخطوات في الدقيقة (Steps Per Minute / spm). لو عملت 90 خطوة بالرجل اليمين في دقيقة، الـ Total Cadence بتاعك هو 180 spm.",
  },
  {
    q: "ليه الـ 180 spm تحديداً؟",
    a: "في 1984، الـ Coach الأمريكي Jack Daniels لاحظ إن كل الـ Elite Runners في الأوليمبياد كانوا بيجروا بـ 180 spm أو أكتر. من ساعتها، الـ 180 بقت الـ Gold Standard للـ Running Efficiency.",
  },
  {
    q: "إزاي أعرف الـ Cadence بتاعتي دلوقتي؟",
    a: "أي Garmin أو Polar أو Coros بيقيس الـ Cadence تلقائياً. بعد أي Run، افتح الـ App وشوف الـ Average Cadence في الـ Run Details.",
  },
  {
    q: "هل تحسين الـ Cadence بيخليني أسرع؟",
    a: "مش مباشرةً، بس بيخليك أكفأ. نفس السرعة بـ Effort أقل، يعني تقدر تجري لفترة أطول بنفس الطاقة. وده بيترجم لـ Better Race Times على المدى البعيد.",
  },
  {
    q: "الـ Cadence بتتغير في الـ Uphill والـ Downhill؟",
    a: "أيوه! في الـ Uphill طبيعي الـ Cadence ترتفع شوية مع قصر الـ Stride. في الـ Downhill ركز على الـ Cadence عشان تقلل الـ Impact على الـ Knees.",
  },
];

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */

export default function RunningCadencePage() {
  return (
    // ✅ dir="rtl" على الـ main — بيحل 90% من المشاكل دفعة واحدة
    <main className="w-full bg-zinc-950 min-h-screen text-white" dir="rtl">

      {/* ===== HERO ===== */}
      <section className="w-full border-b border-zinc-800 py-20 px-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">

          {/* Breadcrumb — LTR لأنه English بحت */}
          <div
            dir="ltr"
            className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wide flex-wrap"
          >
            <Link href="/" className="hover:text-white transition-colors duration-200">
              Home
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-white transition-colors duration-200">
              Blog
            </Link>
            <span>/</span>
            <span className="text-zinc-400">Running Cadence</span>
          </div>

          {/* Badge */}
          <span className="self-start text-xs font-bold uppercase tracking-wide text-green-500 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
            Training Guide
          </span>

          {/* H1 */}
          <h1 className="text-4xl md:text-5xl font-black uppercase leading-tight">
            Running Cadence 🏃
            <br />
            <span className="text-red-500">ليه الـ 180 Steps/Min مهمة؟</span>
          </h1>

          {/* Meta row — LTR لأنه English بحت */}
          <div
            dir="ltr"
            className="flex items-center gap-4 text-xs text-zinc-500 flex-wrap"
          >
            <span>⏱ 7 min read</span>
            <span>•</span>
            <span>🏃 Training Guide</span>
            <span>•</span>
            <span>Updated 2026</span>
          </div>

          {/* Key Stat Callout */}
          <div className="bg-red-600/10 border border-red-500/20 rounded-2xl p-5 flex items-start gap-4">
            <span className="text-3xl shrink-0">📊</span>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-bold text-white">
                الـ Magic Number: 180 spm
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                الـ Elite Runners بيجروا بـ 180 Steps Per Minute أو أكتر.
                معظم الـ Beginners بيبدأوا بـ 155-165 spm، والفرق ده بيكلفهم
                طاقة زيادة وبيزود خطر الـ Injury.
              </p>
            </div>
          </div>

          {/* Table of Contents */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
              📋 Table of Contents
            </p>
            {[
              { href: "#what-is-cadence", label: "إيه هو الـ Cadence؟" },
              { href: "#cadence-zones", label: "الـ Cadence Zones" },
              { href: "#watch-features", label: "إزاي تتابع الـ Cadence بالـ Watch بتاعك" },
              { href: "#improvement-plan", label: "خطة تحسين الـ Cadence في 12 أسبوع" },
              { href: "#myths", label: "الـ Myths الشائعة" },
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

      {/* ===== ARTICLE BODY ===== */}
      {/* ✅ تصحيح mx-rtl → mx-auto */}
      <article className="max-w-3xl mx-auto px-6 py-16 flex flex-col gap-20">

        {/* ── WHAT IS CADENCE ── */}
        <section id="what-is-cadence" className="flex flex-col gap-6">
          <h2 className="text-2xl font-black uppercase text-white">
            إيه هو الـ Running Cadence؟ 🤔
          </h2>

          <p className="text-zinc-400 leading-relaxed text-sm">
            الـ Running Cadence هو ببساطة عدد الخطوات اللي بتخطيها في الدقيقة الواحدة.
            بيتقاس بـ{" "}
            <span className="text-white font-bold">Steps Per Minute (spm)</span>{" "}
            أو أحياناً{" "}
            <span className="text-white font-bold">Strides Per Minute</span>{" "}
            لو الـ Watch بيحسب كل رجل لوحدها.
          </p>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4">
            <p className="text-sm font-bold text-white">مثال بسيط:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { label: "خطوات الرجل اليمين", value: "90 خطوة/دقيقة", icon: "🦵" },
                { label: "خطوات الرجل الشمال", value: "90 خطوة/دقيقة", icon: "🦵" },
                { label: "Total Cadence", value: "180 spm ✅", icon: "🎯" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-zinc-800 rounded-xl p-3 flex flex-col gap-1 items-center text-center"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <p className="text-xs text-zinc-500">{item.label}</p>
                  <p className="text-sm font-black text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-4 flex items-start gap-3">
            <span className="text-yellow-400 text-lg shrink-0">💡</span>
            <p className="text-sm text-zinc-300 leading-relaxed">
              <span className="font-bold text-yellow-400">ليه مهم؟ </span>
              الـ Cadence المنخفضة معناها Overstriding، يعني كل خطوة بتوقع قدامك
              بعيد عن جسمك. ده بيزود الـ Braking Force على كل خطوة، بيضيع طاقة،
              وبيزود الضغط على الـ Knees والـ Hips.
            </p>
          </div>
        </section>

        {/* ── CADENCE ZONES ── */}
        <section id="cadence-zones" className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white">
              الـ Cadence Zones 📊
            </h2>
            <p className="text-sm text-zinc-500">انت في أنهي Zone دلوقتي؟</p>
          </div>

          <div className="flex flex-col gap-3">
            {cadenceZones.map((zone) => (
              <div
                key={zone.label}
                className={`border rounded-2xl p-5 flex flex-col gap-3 ${zone.color}`}
              >
                {/* ✅ flex-row-reverse عشان الـ dot يفضل على اليمين */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full shrink-0 ${zone.dot}`} />
                    <p className="font-black text-sm uppercase">{zone.label}</p>
                  </div>
                  <p className="text-lg font-black text-white">{zone.range}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 border-t border-white/5">
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-zinc-500 uppercase tracking-wide">
                      التأثير
                    </p>
                    <p className="text-xs text-zinc-300">{zone.effect}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-zinc-500 uppercase tracking-wide">
                      النصيحة
                    </p>
                    <p className="text-xs text-zinc-300">{zone.tip}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── WATCH FEATURES ── */}
        <section id="watch-features" className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white">
              تتبع الـ Cadence بالـ Watch بتاعك ⌚
            </h2>
            <p className="text-sm text-zinc-500">
              Garmin، Polar، وCoros — كل واحد بيتابع الـ Cadence إزاي؟
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {watchFeatures.map((watch) => (
              <div
                key={watch.brand}
                className={`border rounded-2xl overflow-hidden ${watch.color}`}
              >
                {/* Header */}
                {/* ✅ dir="ltr" عشان الـ brand name + models تبقى LTR */}
                <div
                  dir="ltr"
                  className="flex items-center justify-between px-5 py-4 border-b border-white/5 flex-wrap gap-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{watch.icon}</span>
                    <div className="flex flex-col gap-1">
                      <p className="font-black text-white text-lg">{watch.brand}</p>
                      <span
                        className={`self-start text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${watch.tagColor}`}
                      >
                        {watch.models}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-px bg-white/5">
                  {watch.features.map((feat) => (
                    <div
                      key={feat.label}
                      className="bg-zinc-950/80 p-3 flex flex-col gap-1"
                    >
                      {/* label = English → ltr */}
                      <p
                        dir="ltr"
                        className="text-xs text-zinc-500 uppercase tracking-wide"
                      >
                        {feat.label}
                      </p>
                      {/* value = mixed → rtl */}
                      <p className="text-xs font-bold text-white">{feat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Verdict + Tip */}
                <div className="p-4 flex flex-col gap-3">
                  <div className="bg-zinc-900/80 rounded-xl p-3">
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      <span className="font-bold text-white">⚡ الحكم: </span>
                      {watch.verdict}
                    </p>
                  </div>
                  <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3">
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      <span className="font-bold text-yellow-400">💡 Tip: </span>
                      {watch.tip}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── IMPROVEMENT PLAN ── */}
        <section id="improvement-plan" className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white">
              خطة تحسين الـ Cadence في 12 أسبوع 📈
            </h2>
            <p className="text-sm text-zinc-500">
              خطوة خطوة، من الـ Baseline لـ 180 spm
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {improvementPlan.map((phase, i) => (
              <div
                key={i}
                className={`border rounded-2xl p-5 flex flex-col gap-4 bg-zinc-900/50 ${phase.color}`}
              >
                {/* ✅ dir="ltr" للـ week label + title عشان يبدأوا صح */}
                <div dir="ltr" className="flex items-center gap-3">
                  <span className="text-2xl">{phase.icon}</span>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wide">
                      {phase.week}
                    </p>
                    <p className="font-black text-white uppercase">{phase.title}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {phase.steps.map((step, j) => (
                    <div key={j} className="flex items-start gap-2">
                      {/* ✅ الرقم على اليسار في RTL context بيبقى صح تلقائياً */}
                      <span className="text-red-400 text-xs shrink-0 mt-0.5 font-bold">
                        {j + 1}.
                      </span>
                      <p className="text-xs text-zinc-400 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-zinc-800/50 rounded-xl p-3">
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    <span className="font-bold text-white">📌 </span>
                    {phase.note}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── MYTHS ── */}
        <section id="myths" className="flex flex-col gap-6">
          <h2 className="text-2xl font-black uppercase text-white">
            الـ Myths الشائعة عن الـ Cadence 🚫
          </h2>

          <div className="flex flex-col gap-4">
            {myths.map((item, i) => (
              <div
                key={i}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl shrink-0">{item.icon}</span>
                  <p className="font-bold text-white text-sm">{item.myth}</p>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed border-t border-zinc-800 pt-3">
                  <span className="text-green-400 font-bold">الحقيقة: </span>
                  {item.truth}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
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

        {/* ── CTA ── */}
        <section className="bg-gradient-to-br from-red-600/20 to-zinc-900 border border-red-500/20 rounded-2xl p-8 flex flex-col gap-5 items-center text-center">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🇪🇬</span>
            <span className="text-4xl">⌚</span>
          </div>
          <h3 className="text-xl font-black uppercase text-white">
            جاهز تتابع الـ Cadence بتاعك؟
          </h3>
          <p className="text-zinc-400 text-sm max-w-md leading-relaxed">
            كل الـ Watches اللي اتكلمنا عنها متاحة في Pulse Gear Egypt بأسعار
            مناسبة بالجنيه المصري. تواصل معانا وهنساعدك تختار الـ Watch المناسبة
            لمستواك وميزانيتك. 💪
          </p>
          {/* ✅ Buttons = LTR */}
          <div dir="ltr" className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/products"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wide transition-colors duration-200"
            >
              Browse Watches
            </Link>
            <Link
              href="/request-product"
              className="border border-zinc-600 text-zinc-300 hover:border-white hover:text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wide transition-colors duration-200"
            >
              Request a Product
            </Link>
          </div>
        </section>

        {/* ── RELATED ARTICLES ── */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-black uppercase text-white">
            اقرأ كمان 📚
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                href: "/blog/heart-rate-zones",
                icon: "📊",
                tag: "Training Guide",
                title: "Heart Rate Zones: اتدرب بذكاء مش بتعب",
              },
              {
                href: "/blog/zone-2-training",
                icon: "🫀",
                tag: "Training Guide",
                title: "Zone 2 Training: سر الـ Elite Athletes",
              },
            ].map((article) => (
              <Link
                key={article.href}
                href={article.href}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-5 flex flex-col gap-3 transition-colors duration-200 group"
              >
                <span className="text-2xl">{article.icon}</span>
                <p
                  dir="ltr"
                  className="text-xs font-bold uppercase tracking-wide text-red-400"
                >
                  {article.tag}
                </p>
                <p className="font-bold text-white text-sm group-hover:text-red-400 transition-colors duration-200">
                  {article.title}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* ── BACK TO BLOG ── */}
        <div dir="ltr" className="flex justify-center pt-4">
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