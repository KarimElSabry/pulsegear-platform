// src/app/blog/gear-review/running-shoes-guide/page.tsx

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Running Shoes Guide 2026 | Pulse Gear Egypt Blog",
  description:
    "إزاي تختار الجزمة الصح؟ الدليل الشامل لاختيار Running Shoes بناءً على الـ Gait والـ Terrain والـ Training Type.",
  openGraph: {
    title: "Running Shoes Guide 2026 | Pulse Gear Egypt Blog",
    description:
      "إزاي تختار الجزمة الصح؟ الدليل الشامل لاختيار Running Shoes.",
    type: "article",
  },
};

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */

const whyShoesMatter = [
  {
    icon: "🦴",
    title: "Injury Prevention",
    desc: "الجزمة الغلط هي السبب رقم 1 في إصابات الـ Runners. Shin Splints والـ Plantar Fasciitis والـ Knee Pain معظمهم بيجوا من جزمة مش مناسبة للـ Gait بتاعك.",
  },
  {
    icon: "⚡",
    title: "Running Economy",
    desc: "الـ Running Economy هو كمية الأكسجين اللي بتستهلكه في سرعة معينة. الجزمة الصح ممكن تحسن الـ Economy بنسبة 2-4%، ده فرق كبير في الـ Race.",
  },
  {
    icon: "🎯",
    title: "Comfort & Performance",
    desc: "الجزمة المريحة بتخليك تتمرن أكتر وأطول. الـ Discomfort بيشتت التركيز ويأثر على الـ Form، اللي بيأثر على الـ Performance.",
  },
  {
    icon: "💰",
    title: "Value for Money",
    desc: "الجزمة الصح بتدوم أطول وبتقلل تكلفة الإصابات والعلاج. استثمار في الجزمة الصح أرخص بكتير من العلاج الطبيعي.",
  },
];

const pronationTypes = [
  {
    type: "Neutral Pronation",
    icon: "✅",
    color: "border-green-500/30 bg-green-500/5",
    tagColor: "text-green-400",
    percentage: "~45% من الـ Runners",
    desc: "القدم بتلف للداخل بشكل طبيعي عند الـ Landing، الـ Weight Distribution متوازن.",
    signs: ["الـ Wear Pattern في النص من الـ Heel للـ Ball", "القوس طبيعي", "الركبة مش بتنحرف"],
    shoes: "Neutral Running Shoes، أي جزمة بدون Support إضافي",
    examples: "Nike Pegasus، Brooks Ghost، Saucony Ride",
  },
  {
    type: "Overpronation",
    icon: "⚠️",
    color: "border-blue-500/30 bg-blue-500/5",
    tagColor: "text-blue-400",
    percentage: "~35% من الـ Runners",
    desc: "القدم بتلف للداخل أكتر من اللازم، بيحط ضغط زيادة على الـ Arch والـ Knee.",
    signs: ["الـ Wear Pattern على الجانب الداخلي من الـ Heel", "القوس منخفض (Flat Feet)", "الركبة بتنحرف للداخل"],
    shoes: "Stability أو Motion Control Shoes، بيحتوي على Medial Post Support",
    examples: "Brooks Adrenaline GTS، ASICS Kayano، New Balance 860",
  },
  {
    type: "Supination (Underpronation)",
    icon: "🔴",
    color: "border-red-500/30 bg-red-500/5",
    tagColor: "text-red-400",
    percentage: "~20% من الـ Runners",
    desc: "القدم بتلف للخارج، بيحط ضغط على الجانب الخارجي من القدم والـ Ankle.",
    signs: ["الـ Wear Pattern على الجانب الخارجي من الـ Heel والـ Forefoot", "القوس مرتفع جداً", "Ankle Sprains متكررة"],
    shoes: "Neutral Shoes مع Cushioning عالي، مش محتاج Support لكن محتاج Shock Absorption",
    examples: "Brooks Glycerin، ASICS Nimbus، Hoka Clifton",
  },
];

const shoeCategories = [
  {
    category: "Daily Trainer",
    icon: "🏃",
    color: "border-zinc-600 bg-zinc-800/30",
    tagColor: "text-zinc-300",
    use: "80% من تدريبك: Easy Runs والـ Long Runs",
    drop: "8-12mm",
    cushioning: "Medium to High",
    weight: "250-300g",
    desc: "الجزمة الأساسية في الـ Rotation بتاعك. محتاج تكون مريحة، durable، ومناسبة لساعات طويلة.",
    examples: "Nike Pegasus 41، Brooks Ghost 16، ASICS Gel-Nimbus 26",
    tip: "محتاج جوز واحد على الأقل من الـ Daily Trainer. لو بتتمرن كتير، خد جوزين وبدّل بينهم عشان الـ Foam يتعافى.",
  },
  {
    category: "Speed / Race Day",
    icon: "⚡",
    color: "border-yellow-500/30 bg-yellow-500/5",
    tagColor: "text-yellow-400",
    use: "Tempo Runs والـ Intervals والـ Races",
    drop: "4-8mm",
    cushioning: "Low to Medium (Carbon Fiber Plate)",
    weight: "180-230g",
    desc: "الجزمة اللي بتلبسها لما تيجي تسرع. Carbon Fiber Plate بيحسن الـ Energy Return ويزود الـ Propulsion.",
    examples: "Nike Vaporfly 3، Adidas Adizero Adios Pro 3، ASICS Metaspeed Sky+",
    tip: "متلبسهاش في كل تمرين، وفّرها للـ Speed Work والـ Races. الـ Carbon Plate بيتعب الـ Calves لو اتلبس كتير.",
  },
  {
    category: "Trail Running",
    icon: "🏔️",
    color: "border-green-500/30 bg-green-500/5",
    tagColor: "text-green-400",
    use: "Off-Road والـ Trails والـ Uneven Terrain",
    drop: "4-8mm",
    cushioning: "Medium مع Rock Plate",
    weight: "280-340g",
    desc: "Aggressive Lugs للـ Grip على التراب والصخر، Rock Plate لحماية القدم، Upper أقوى للـ Durability.",
    examples: "Salomon Speedcross 6، Hoka Speedgoat 5، Brooks Cascadia 17",
    tip: "لو بتتمرن على Road والـ Trail، محتاج جوزين منفصلين. الـ Trail Shoes على الـ Road بتتبلى بسرعة.",
  },
  {
    category: "Stability / Support",
    icon: "🛡️",
    color: "border-blue-500/30 bg-blue-500/5",
    tagColor: "text-blue-400",
    use: "للـ Overpronators أو اللي عندهم Flat Feet",
    drop: "8-12mm",
    cushioning: "Medium مع Medial Post",
    weight: "260-310g",
    desc: "Medial Post أو Guide Rail بيمنع الـ Overpronation ويحمي الـ Knee والـ Ankle.",
    examples: "Brooks Adrenaline GTS 24، ASICS Kayano 31، New Balance 860v14",
    tip: "لو مش متأكد إنك Overpronator، اعمل Gait Analysis الأول. الـ Stability Shoes على الـ Neutral Foot ممكن تعمل مشاكل.",
  },
];

const keyMetrics = [
  {
    metric: "Heel-to-Toe Drop",
    icon: "📐",
    low: "0-4mm (Minimalist)",
    medium: "5-8mm (Moderate)",
    high: "9-12mm (Traditional)",
    what: "الفرق في الارتفاع بين الـ Heel والـ Forefoot. Drop منخفض = أكتر Natural، Drop مرتفع = أكتر Heel Strike Support.",
    tip: "لو بتتحول من Drop مرتفع لمنخفض، اعمل ده تدريجياً على مدى أشهر عشان تتجنب إصابات الـ Achilles.",
  },
  {
    metric: "Stack Height",
    icon: "📏",
    low: "أقل من 25mm",
    medium: "25-35mm",
    high: "أكتر من 35mm (Max Cushion)",
    what: "ارتفاع الـ Midsole تحت القدم. Stack مرتفع = أكتر Cushioning وحماية، Stack منخفض = أكتر Ground Feel.",
    tip: "الـ Max Cushion (Hoka) مناسب للـ Long Runs والـ Ultramarathons. للـ Speed Work، Stack أقل أفضل.",
  },
  {
    metric: "Upper Material",
    icon: "🧵",
    low: "Mesh: خفيف ومتنفس",
    medium: "Engineered Knit: مريح ومرن",
    high: "Ripstop / Reinforced: للـ Trail",
    what: "المادة اللي بتلف القدم. بتأثر على الـ Breathability والـ Durability والـ Fit.",
    tip: "للـ Hot Weather (مصر 😅)، Mesh Upper هو الأفضل للـ Breathability.",
  },
  {
    metric: "Midsole Foam",
    icon: "🧪",
    low: "EVA: تقليدي وأرخص",
    medium: "PEBA / Nylon Foam: خفيف وـ Responsive",
    high: "Carbon Fiber Plate: للـ Racing",
    what: "المادة اللي بتعمل الـ Cushioning. الـ PEBA Foam (زي Nike ZoomX وAdidas Lightstrike Pro) أخف وأكتر Energy Return.",
    tip: "الـ Carbon Plate مش للكل، محتاج تكون عندك Base Fitness كافية عشان تستفيد منه.",
  },
];

const shoeRotation = [
  {
    level: "المبتدئ",
    icon: "🌱",
    color: "border-green-500/30 bg-green-500/5",
    shoes: 1,
    recommendation: "جوز واحد Daily Trainer كويس",
    why: "في البداية، جوز واحد كافي. ركّز على الـ Consistency في التمرين الأول.",
    budget: "~3,000-5,000 EGP",
  },
  {
    level: "الـ Intermediate Runner",
    icon: "💪",
    color: "border-blue-500/30 bg-blue-500/5",
    shoes: 2,
    recommendation: "Daily Trainer + Speed Shoe",
    why: "لما تبدأ تعمل Speed Work والـ Easy Runs، جوزين بيخليك تتمرن أكتر بدون إصابات.",
    budget: "~8,000-15,000 EGP",
  },
  {
    level: "الـ Serious Runner",
    icon: "🏆",
    color: "border-yellow-500/30 bg-yellow-500/5",
    shoes: 3,
    recommendation: "Daily Trainer + Speed Shoe + Trail أو Recovery Shoe",
    why: "3 جزم بتغطي كل أنواع التمارين وبتطوّل عمر كل جزمة.",
    budget: "~20,000-35,000 EGP",
  },
];

const wearIndicators = [
  {
    sign: "الـ Midsole بقى صلب",
    icon: "🔴",
    action: "وقت الاستبدال، الـ Cushioning انتهى حتى لو الـ Upper كويس",
  },
  {
    sign: "الـ Outsole اتمسح في مناطق معينة",
    icon: "🟡",
    action: "راقب الـ Wear Pattern، بيقولك عن الـ Gait بتاعك",
  },
  {
    sign: "بتحس بوجع جديد بعد التمرين",
    icon: "🔴",
    action: "غالباً الجزمة خلصت، جسمك بيقولك قبل ما تشوف بعينيك",
  },
  {
    sign: "الـ Upper اتمزق أو اتفك",
    icon: "🟡",
    action: "ممكن تكمل لو الـ Midsole كويس، بس فكر في الاستبدال",
  },
  {
    sign: "عدت الـ 800 كيلومتر",
    icon: "🟢",
    action: "الـ General Rule: كل 600-800km استبدل الجزمة. بعض الجزم بتدوم أكتر.",
  },
];

const commonMistakes = [
  {
    mistake: "شراء الجزمة بناءً على الشكل بس",
    fix: "الجزمة الأجمل مش دايماً الأنسب. اعرف الـ Pronation Type بتاعك الأول.",
  },
  {
    mistake: "الـ Size الغلط: نفس مقاسك في الجزم العادية",
    fix: "الـ Running Shoes المفروض تاخد نص مقاس أكبر من الجزم العادية. القدم بتتمدد أثناء الجري.",
  },
  {
    mistake: "جزمة واحدة لكل أنواع التمارين",
    fix: "الـ Daily Trainer مش مناسب للـ Races، والـ Carbon Shoe مش مناسب للـ Easy Runs. Rotation ضروري.",
  },
  {
    mistake: "الاستمرار في الجزمة القديمة عشان لسه شكلها كويس",
    fix: "الـ Midsole بيتبلى قبل الـ Outsole. بعد 600-800km، الـ Cushioning خلص حتى لو الجزمة شايفها كويسة.",
  },
  {
    mistake: "تجاهل الـ Gait Analysis",
    fix: "Gait Analysis مجاني في كتير من محلات الـ Running. 10 دقائق بتوفرلك آلام وإصابات.",
  },
  {
    mistake: "شراء Carbon Plate Shoes من أول يوم",
    fix: "الـ Carbon Shoes محتاج Base Fitness. ابدأ بـ Daily Trainer وترقي للـ Carbon لما تكون جاهز.",
  },
];

const topPicks = [
  {
    category: "أفضل Daily Trainer",
    icon: "🏃",
    picks: [
      { name: "Nike Pegasus 41", why: "الأكتر Versatile، مناسب لكل الـ Runners", drop: "10mm", weight: "283g" },
      { name: "Brooks Ghost 16", why: "الأكتر Comfortable، مثالي للـ Long Runs", drop: "12mm", weight: "298g" },
      { name: "ASICS Gel-Nimbus 26", why: "الأكتر Cushioning، للـ Runners اللي بيتعبوا من الـ Knees", drop: "10mm", weight: "310g" },
    ],
  },
  {
    category: "أفضل Speed Shoe",
    icon: "⚡",
    picks: [
      { name: "Nike Vaporfly 3", why: "الأسرع في السوق، ZoomX Foam + Carbon Plate", drop: "8mm", weight: "195g" },
      { name: "Adidas Adizero Adios Pro 3", why: "مريح أكتر من الـ Vaporfly، مناسب للـ Half Marathon فأكتر", drop: "6mm", weight: "220g" },
      { name: "ASICS Metaspeed Sky+", why: "للـ Heel Strikers، أفضل Carbon Shoe لـ Cadence منخفض", drop: "5mm", weight: "215g" },
    ],
  },
  {
    category: "أفضل Budget Option",
    icon: "💰",
    picks: [
      { name: "Saucony Ride 17", why: "أفضل Daily Trainer بسعر معقول", drop: "8mm", weight: "275g" },
      { name: "New Balance Fresh Foam 880", why: "Cushioning ممتاز بسعر أقل من المنافسين", drop: "10mm", weight: "290g" },
      { name: "ASICS Gel-Kayano Lite 3", why: "Stability بسعر مناسب للـ Overpronators", drop: "10mm", weight: "285g" },
    ],
  },
];

const faqs = [
  {
    q: "إزاي أعرف الـ Pronation Type بتاعي؟",
    a: "3 طرق: 1) Wet Test: بلّل قدمك واوقف على ورقة، شكل الأثر بيقولك. 2) Shoe Wear Test: شوف الـ Wear Pattern في جزمتك القديمة. 3) Gait Analysis: أفضل طريقة، متاحة في محلات الـ Running المتخصصة.",
  },
  {
    q: "كام كيلومتر تدوم الجزمة؟",
    a: "600-800km للـ Daily Trainers. الـ Carbon Race Shoes بتدوم 300-500km. الـ Trail Shoes بتدوم أقل على الـ Road وأكتر على الـ Trail. الأهم: استمع لجسمك، لو حسيت بوجع جديد، الجزمة غالباً خلصت.",
  },
  {
    q: "هل الـ Carbon Plate Shoes تستاهل؟",
    a: "لو بتسابق وعندك Base Fitness كويسة، أيوه. الـ Studies بتقول إنها بتحسن الـ Running Economy بـ 4-6%. لكن للـ Easy Runs والـ Training، Daily Trainer أفضل وأأمن.",
  },
  {
    q: "ممكن ألبس نفس الجزمة للـ Gym والـ Running؟",
    a: "لأ! الـ Running Shoes مصممة للـ Forward Motion بس. في الـ Gym، محتاج Lateral Support اللي الـ Running Shoes مش بتوفره. جزمة Cross-Training منفصلة ضرورية.",
  },
  {
    q: "الـ Hoka مناسبة لكل الـ Runners؟",
    a: "الـ Hoka (Max Cushion) مناسبة جداً للـ Long Runs والـ Recovery Runs وللـ Runners اللي عندهم مشاكل في الـ Joints. مش مثالية للـ Speed Work بسبب الـ Stack المرتفع.",
  },
];

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */

export default function RunningShoeGuidePage() {
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
            <span className="text-zinc-400">Running Shoes Guide</span>
          </div>

          <span className="self-start text-xs font-bold uppercase tracking-wide text-orange-500 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
            Gear Review 2026
          </span>

          <h1 className="text-4xl md:text-5xl font-black uppercase leading-tight">
            Running Shoes Guide 👟
            <br />
            <span className="text-red-500">إزاي تختار الجزمة الصح؟</span>
          </h1>

          <p className="text-lg text-zinc-400 leading-relaxed" dir="rtl">
            الجزمة الغلط بتكسر الـ Runner، والجزمة الصح بتصنع الـ Race.
            مش بس عن الشكل أو الـ Brand، ده علم كامل. دليل شامل
            يخليك تختار بثقة. 🔬
          </p>

          <div className="flex items-center gap-4 text-xs text-zinc-500 flex-wrap">
            <span>⏱ 9 min read</span>
            <span>•</span>
            <span>👟 Gear Science</span>
            <span>•</span>
            <span>Updated 2026</span>
          </div>

          {/* Key Stat */}
          <div className="bg-orange-600/10 border border-orange-500/20 rounded-2xl p-4 flex items-start gap-3">
            <span className="text-2xl shrink-0">⚡</span>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-bold text-white" dir="rtl">
                الـ Numbers بتقول إيه؟
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed" dir="rtl">
                الـ Carbon Fiber Plate Shoes بتحسن الـ Running Economy بـ 4-6%.
                ده معناه إنك بتوفر طاقة في كل خطوة. في الـ Marathon، ده بيترجم
                لـ 2-4 دقائق أسرع. من الجزمة بس.
              </p>
            </div>
          </div>

          {/* Table of Contents */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
              📋 Table of Contents
            </p>
            {[
              { href: "#why-shoes", label: "ليه الجزمة مهمة؟" },
              { href: "#pronation", label: "الـ Pronation: أهم حاجة تعرفها" },
              { href: "#categories", label: "أنواع الـ Running Shoes" },
              { href: "#metrics", label: "الـ Key Metrics: Drop والـ Stack والـ Foam" },
              { href: "#rotation", label: "الـ Shoe Rotation: ليه محتاج أكتر من جوز؟" },
              { href: "#wear", label: "امتى تستبدل الجزمة؟" },
              { href: "#top-picks", label: "أفضل الخيارات في 2026" },
              { href: "#mistakes", label: "أكتر الأخطاء شيوعاً" },
              { href: "#faq", label: "الأسئلة الشائعة" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors duration-200 group"
                dir="rtl"
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

        {/* ─── WHY SHOES MATTER ─── */}
        <section id="why-shoes" className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white">
              ليه الجزمة مهمة؟ 👟
            </h2>
            <p className="text-sm text-zinc-500" dir="rtl">
              مش بس Comfort، الجزمة بتأثر على الـ Performance والـ Injury Risk
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {whyShoesMatter.map((item) => (
              <div
                key={item.title}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <p className="font-black text-white text-sm uppercase tracking-wide">
                    {item.title}
                  </p>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed" dir="rtl">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── PRONATION ─── */}
        <section id="pronation" className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white" dir="rtl">
              الـ Pronation: أهم حاجة تعرفها 🦶
            </h2>
            <p className="text-sm text-zinc-500" dir="rtl">
              قبل ما تشتري أي جزمة، لازم تعرف الـ Pronation Type بتاعك
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3">
            <p className="text-sm font-bold text-white" dir="rtl">
              إيه هو الـ Pronation؟
            </p>
            <p className="text-xs text-zinc-400 leading-relaxed" dir="rtl">
              الـ Pronation هو الطريقة اللي قدمك بتلف بيها للداخل عند الـ Landing.
              ده Biomechanical Movement طبيعي بيساعد في امتصاص الصدمات. المشكلة
              بتحصل لما القدم بتلف أكتر أو أقل من اللازم.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {pronationTypes.map((type) => (
              <div
                key={type.type}
                className={`border rounded-2xl overflow-hidden ${type.color}`}
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{type.icon}</span>
                    <p className={`font-black uppercase text-sm ${type.tagColor}`}>
                      {type.type}
                    </p>
                  </div>
                  <span className="text-xs text-zinc-500 bg-zinc-800 px-3 py-1 rounded-full">
                    {type.percentage}
                  </span>
                </div>
                <div className="p-5 flex flex-col gap-3">
                  <p className="text-xs text-zinc-400 leading-relaxed" dir="rtl">
                    {type.desc}
                  </p>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-bold text-white" dir="rtl">علامات:</p>
                    {type.signs.map((sign, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-red-400 text-xs shrink-0 mt-0.5">•</span>
                        <p className="text-xs text-zinc-400" dir="rtl">{sign}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-800 rounded-xl p-3" dir="rtl">
                    <span className="text-orange-400 font-bold">👟 الجزمة المناسبة: </span>
                    {type.shoes}
                  </p>
                  <p className="text-xs text-zinc-500" dir="rtl">
                    <span className="font-bold text-zinc-400">أمثلة: </span>
                    {type.examples}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── CATEGORIES ─── */}
        <section id="categories" className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white">
              أنواع الـ Running Shoes 🗂️
            </h2>
            <p className="text-sm text-zinc-500" dir="rtl">
              كل نوع ليه استخدام مختلف، اعرف محتاج إيه
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {shoeCategories.map((cat) => (
              <div
                key={cat.category}
                className={`border rounded-2xl overflow-hidden ${cat.color}`}
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat.icon}</span>
                    <p className={`font-black uppercase text-sm ${cat.tagColor}`}>
                      {cat.category}
                    </p>
                  </div>
                  <span className="text-xs text-zinc-500 bg-zinc-800 px-3 py-1 rounded-full" dir="rtl">
                    {cat.use}
                  </span>
                </div>
                <div className="p-5 flex flex-col gap-3">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Drop", value: cat.drop },
                      { label: "Cushioning", value: cat.cushioning },
                      { label: "Weight", value: cat.weight },
                    ].map((spec) => (
                      <div key={spec.label} className="bg-zinc-800 rounded-xl p-2 text-center">
                        <p className="text-xs text-zinc-500 uppercase tracking-wide">{spec.label}</p>
                        <p className="text-xs font-bold text-white mt-1">{spec.value}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed" dir="rtl">
                    {cat.desc}
                  </p>
                  <p className="text-xs text-zinc-500" dir="rtl">
                    <span className="font-bold text-zinc-400">أمثلة: </span>
                    {cat.examples}
                  </p>
                  <p className="text-xs text-zinc-400 leading-relaxed bg-orange-500/5 border border-orange-500/20 rounded-xl p-3" dir="rtl">
                    <span className="text-orange-400 font-bold">💡 Tip: </span>
                    {cat.tip}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── KEY METRICS ─── */}
        <section id="metrics" className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white">
              الـ Key Metrics 📐
            </h2>
            <p className="text-sm text-zinc-500" dir="rtl">
              الأرقام اللي لازم تفهمها قبل ما تشتري
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {keyMetrics.map((item) => (
              <div
                key={item.metric}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
              >
                <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800">
                  <span className="text-xl">{item.icon}</span>
                  <p className="font-black text-white text-sm uppercase tracking-wide">
                    {item.metric}
                  </p>
                </div>
                <div className="p-5 flex flex-col gap-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {[
                      { label: "Low", value: item.low, color: "text-green-400" },
                      { label: "Medium", value: item.medium, color: "text-yellow-400" },
                      { label: "High", value: item.high, color: "text-red-400" },
                    ].map((level) => (
                      <div key={level.label} className="bg-zinc-800 rounded-xl p-3">
                        <p className={`text-xs font-bold uppercase ${level.color}`}>{level.label}</p>
                        <p className="text-xs text-zinc-400 mt-1" dir="rtl">{level.value}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed" dir="rtl">
                    {item.what}
                  </p>
                  <p className="text-xs text-zinc-400 bg-zinc-800 rounded-xl p-3" dir="rtl">
                    <span className="text-orange-400 font-bold">💡 Tip: </span>
                    {item.tip}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── ROTATION ─── */}
        <section id="rotation" className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white" dir="rtl">
              الـ Shoe Rotation: ليه محتاج أكتر من جوز؟ 🔄
            </h2>
            <p className="text-sm text-zinc-500" dir="rtl">
              الـ Elite Athletes عندهم 3-5 جزم مختلفة، ومش بس عشان الموضة
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3">
            <p className="text-xs text-zinc-400 leading-relaxed" dir="rtl">
              الـ Midsole Foam محتاج 24-48 ساعة عشان يرجع لشكله الأصلي بعد التمرين.
              لو بتتمرن كل يوم بنفس الجزمة، الـ Foam مش بيتعافى كامل. الـ Rotation
              بيطوّل عمر الجزمة ويقلل الـ Injury Risk.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {shoeRotation.map((level) => (
              <div
                key={level.level}
                className={`border rounded-2xl overflow-hidden ${level.color}`}
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{level.icon}</span>
                    <p className="font-black text-white text-sm uppercase tracking-wide" dir="rtl">
                      {level.level}
                    </p>
                  </div>
                  <span className="text-sm font-black text-red-400">{level.budget}</span>
                </div>
                <div className="p-5 flex flex-col gap-2">
                  <p className="text-xs font-bold text-white" dir="rtl">
                    {level.shoes} جوز: {level.recommendation}
                  </p>
                  <p className="text-xs text-zinc-400 leading-relaxed" dir="rtl">
                    {level.why}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── WEAR INDICATORS ─── */}
        <section id="wear" className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white">
              امتى تستبدل الجزمة؟ ⏱️
            </h2>
            <p className="text-sm text-zinc-500" dir="rtl">
              الجزمة القديمة أخطر من الجزمة الغلط
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            {wearIndicators.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 px-5 py-4 border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition-colors"
              >
                <span className="text-xl shrink-0">{item.icon}</span>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-bold text-white" dir="rtl">{item.sign}</p>
                  <p className="text-xs text-zinc-400" dir="rtl">{item.action}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── TOP PICKS ─── */}
        <section id="top-picks" className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white">
              أفضل الخيارات في 2026 🏆
            </h2>
            <p className="text-sm text-zinc-500" dir="rtl">
              اختيارات مبنية على الـ Performance والـ Value
            </p>
          </div>
          <div className="flex flex-col gap-6">
            {topPicks.map((category) => (
              <div key={category.category} className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <h3 className="text-lg font-black uppercase text-white" dir="rtl">
                    {category.category}
                  </h3>
                </div>
                <div className="flex flex-col gap-3">
                  {category.picks.map((pick, i) => (
                    <div
                      key={pick.name}
                      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3"
                    >
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <p className="font-black text-white text-sm">{pick.name}</p>
                          {i === 0 && (
                            <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">
                              ⭐ Top Pick
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-full">
                            Drop: {pick.drop}
                          </span>
                          <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-full">
                            {pick.weight}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed" dir="rtl">
                        {pick.why}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── MISTAKES ─── */}
        <section id="mistakes" className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white">
              أكتر الأخطاء شيوعاً ⚠️
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            {commonMistakes.map((item, i) => (
              <div
                key={i}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl shrink-0">❌</span>
                  <p className="font-bold text-white text-sm" dir="rtl">
                    {item.mistake}
                  </p>
                </div>
                <div className="flex items-start gap-3 bg-green-500/5 border border-green-500/20 rounded-xl p-3">
                  <span className="text-green-400 text-xs font-bold shrink-0 mt-0.5">✅ الحل:</span>
                  <p className="text-xs text-zinc-400 leading-relaxed" dir="rtl">
                    {item.fix}
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
                <p className="font-bold text-white text-sm" dir="rtl">
                  س: {faq.q}
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed border-t border-zinc-800 pt-3" dir="rtl">
                  <span className="text-red-400 font-bold">ج: </span>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="bg-gradient-to-br from-red-600/20 to-zinc-900 border border-red-500/20 rounded-2xl p-8 flex flex-col gap-5 items-center text-center">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🇪🇬</span>
            <span className="text-4xl">👟</span>
          </div>
          <h3 className="text-xl font-black uppercase text-white" dir="rtl">
            الـ Gear الصح بسعر مناسب: Pulse Gear Egypt
          </h3>
          <p className="text-zinc-400 text-sm max-w-md leading-relaxed" dir="rtl">
            Garmin Watches، Polar Heart Rate Monitors، وكل أدوات التدريب
            اللي محتاجها، متاحة في Pulse Gear Egypt بأسعار مناسبة
            بالجنيه المصري. تواصل معانا وهنساعدك تختار الصح. 💪
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
              { href: "/blog/training-guide/heart-rate-zones", icon: "📊", tag: "Training Guide", title: "اتدرب بذكاء: Heart Rate Zones" },
              { href: "/blog/training-guide/sleep-recovery", icon: "😴", tag: "Training Guide", title: "الجزء اللي بتتجاهله: Sleep & Recovery" },
              { href: "/blog/gear-guide/beginners-guide", icon: "🌱", tag: "Gear Guide", title: "Beginner's Gear Guide 2026" },
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
                <p className="font-bold text-white text-sm group-hover:text-red-400 transition-colors duration-200" dir="rtl">
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