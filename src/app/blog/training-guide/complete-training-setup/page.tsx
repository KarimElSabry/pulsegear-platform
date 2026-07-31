// src/app/blog/complete-training-setup/page.tsx

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Complete Training Setup 2026 | Pulse Gear Egypt Blog",
  description:
    "الدليل الشامل لبناء أفضل Setup تدريبي في 2026 من الـ Gear للـ Plan للـ Recovery. متاح في Pulse Gear Egypt بأسعار مناسبة بالجنيه المصري.",
  openGraph: {
    title: "Complete Training Setup 2026 | Pulse Gear Egypt",
    description:
      "الدليل الشامل لبناء أفضل Setup تدريبي في 2026.",
    type: "article",
  },
};

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */

const setupLevels = [
  {
    level: "Starter Setup",
    icon: "🌱",
    tagline: "ابدأ صح بأقل تكلفة",
    color: "border-green-500/30 bg-green-500/5",
    titleColor: "text-green-400",
    total: "~3,500 EGP",
    gear: [
      {
        name: "Polar H9",
        role: "HR Monitor",
        price: "~3,000 EGP",
        essential: true,
        why: "أساس أي Setup، بدونه مش هتعرف تتدرب بالـ Zones الصح.",
      },
      {
        name: "Foam Roller",
        role: "Recovery",
        price: "~500 EGP",
        essential: true,
        why: "أهم Recovery Tool وأرخصه، استخدمه يومياً بعد كل تمرين.",
      },
      {
        name: "Polar Beat App",
        role: "Training App",
        price: "مجاناً",
        essential: true,
        why: "بيشتغل مع الـ H9 مباشرة، HR Zones وCalories وWorkout Summary.",
      },
    ],
    plan: [
      "3 أيام تدريب في الأسبوع، مش أكتر",
      "80% من التمرين في Zone 2",
      "20% في Zone 4-5",
      "Rest Day بعد كل يوم تمرين",
      "Foam Roller يومياً، 10 دقائق",
    ],
  },
  {
    level: "Serious Setup",
    icon: "💪",
    tagline: "للـ Athlete الجاد",
    color: "border-blue-500/30 bg-blue-500/5",
    titleColor: "text-blue-400",
    total: "~16,500 EGP",
    gear: [
      {
        name: "Polar H10",
        role: "HR Monitor",
        price: "~4,500 EGP",
        essential: true,
        why: "الأدق في السوق مع HRV Tracking وذاكرة داخلية.",
      },
      {
        name: "Coros Pace 3",
        role: "GPS Watch",
        price: "~11,500 EGP",
        essential: true,
        why: "أفضل GPS Watch بسعر معقول، Dual GPS وBattery 38 ساعة.",
      },
      {
        name: "Foam Roller",
        role: "Recovery",
        price: "~500 EGP",
        essential: true,
        why: "Recovery أساسي، لازم يبقى في الـ Setup من اليوم الأول.",
      },
      {
        name: "Resistance Bands",
        role: "Warm-Up & Activation",
        price: "~500 EGP",
        essential: false,
        why: "للـ Activation قبل التمرين، بيقلل الإصابات بشكل ملحوظ.",
      },
    ],
    plan: [
      "4-5 أيام تدريب في الأسبوع",
      "80/20 Rule، 80% Zone 2 و20% High Intensity",
      "HRV Check كل صبح، لو نازل خفف التمرين",
      "Long Run أسبوعي في Zone 2",
      "Interval Session أسبوعية واحدة بس",
      "Foam Roller يومياً والـ Resistance Bands قبل التمرين",
    ],
  },
  {
    level: "Advanced Setup",
    icon: "🏆",
    tagline: "للـ Competitive Athlete",
    color: "border-yellow-500/30 bg-yellow-500/5",
    titleColor: "text-yellow-400",
    total: "~35,500 EGP",
    gear: [
      {
        name: "Polar H10",
        role: "HR Monitor",
        price: "~4,500 EGP",
        essential: true,
        why: "الأدق في السوق، أساسي في أي Advanced Setup.",
      },
      {
        name: "Garmin Forerunner 965",
        role: "GPS Watch",
        price: "~30,000 EGP",
        essential: true,
        why: "أفضل Running Watch، Training Readiness وHRV وOnboard Maps.",
      },
      {
        name: "Foam Roller",
        role: "Daily Recovery",
        price: "~500 EGP",
        essential: true,
        why: "Recovery يومي أساسي، مش اختياري.",
      },
      {
        name: "Resistance Bands",
        role: "Activation",
        price: "~500 EGP",
        essential: true,
        why: "Activation قبل كل تمرين، مهم للـ Injury Prevention.",
      },
    ],
    plan: [
      "5-6 أيام تدريب في الأسبوع",
      "Periodization، Base Phase وBuild Phase وPeak Phase",
      "HRV والـ Resting HR كل صبح",
      "Training Readiness من الـ Garmin، اتبعه",
      "2 Quality Sessions في الأسبوع، مش أكتر",
      "Long Run أسبوعي والـ Medium Long Run",
      "Recovery Week كل 3-4 أسابيع",
    ],
  },
  {
    level: "Pro Setup",
    icon: "🔥",
    tagline: "الـ Full Package",
    color: "border-red-500/30 bg-red-500/5",
    titleColor: "text-red-400",
    total: "~47,500 EGP",
    gear: [
      {
        name: "Polar H10",
        role: "HR Monitor",
        price: "~4,500 EGP",
        essential: true,
        why: "الأدق في السوق، أساسي في أي Pro Setup.",
      },
      {
        name: "Garmin Forerunner 965",
        role: "GPS Watch",
        price: "~30,000 EGP",
        essential: true,
        why: "أفضل Running Watch في السوق، مفيش بديل على المستوى ده.",
      },
      {
        name: "Theragun Prime",
        role: "Percussive Recovery",
        price: "~12,000 EGP",
        essential: true,
        why: "بيسرع الـ Recovery بشكل ملحوظ، ضروري في الـ High Volume Training.",
      },
      {
        name: "Foam Roller",
        role: "Daily Recovery",
        price: "~500 EGP",
        essential: true,
        why: "يكمّل الـ Theragun، استخدمه للـ Large Muscle Groups.",
      },
      {
        name: "Resistance Bands",
        role: "Activation",
        price: "~500 EGP",
        essential: true,
        why: "Activation قبل كل تمرين، مش اختياري على المستوى ده.",
      },
    ],
    plan: [
      "6 أيام تدريب في الأسبوع",
      "Double Sessions بعض الأيام",
      "HRV والـ Resting HR والـ Sleep Score كل يوم",
      "Theragun بعد كل Session شديدة",
      "Recovery Week كل 3 أسابيع",
      "Periodization كاملة، Base وBuild وPeak وTaper",
      "Race-Specific Training في الـ Peak Phase",
    ],
  },
];

const trainingPrinciples = [
  {
    icon: "📊",
    title: "80/20 Rule",
    color: "border-blue-500/30 bg-blue-500/5",
    titleColor: "text-blue-400",
    body: "80% من تمرينك في Zone 2 (سهل) و20% في Zone 4-5 (شديد). ده مش رأي، ده علم مثبت في الـ Elite Athletes.",
    tip: "لو بتحس إن كل تمارينك صعبة، أنت بتعمل كتير أوي في الـ Middle Zones. خفف.",
  },
  {
    icon: "💤",
    title: "Recovery = Training",
    color: "border-purple-500/30 bg-purple-500/5",
    titleColor: "text-purple-400",
    body: "الجسم بيتحسن في الـ Recovery مش في التمرين. النوم 8 ساعات والـ Foam Roller والـ Rest Days جزء من البرنامج مش كسل.",
    tip: "HRV نازل 3 أيام متتالية؟ خد Rest Day إجباري، جسمك بيقولك حاجة.",
  },
  {
    icon: "📈",
    title: "Progressive Overload",
    color: "border-green-500/30 bg-green-500/5",
    titleColor: "text-green-400",
    body: "زود الـ Volume بـ 10% بس كل أسبوع، مش أكتر. الزيادة السريعة هي السبب الأول للإصابات.",
    tip: "قاعدة الـ 10%: لو بتجري 30km في الأسبوع، الأسبوع الجاي 33km بس.",
  },
  {
    icon: "🎯",
    title: "Specificity",
    color: "border-orange-500/30 bg-orange-500/5",
    titleColor: "text-orange-400",
    body: "اتدرب على اللي عايز تتحسن فيه. لو هدفك الـ 5K، معظم تمرينك يكون Running. الـ Cross Training مفيد لكن مش بديل.",
    tip: "حدد هدفك الأول، Race أو Weight Loss أو General Fitness، وبني التمرين حواليه.",
  },
  {
    icon: "🔄",
    title: "Periodization",
    color: "border-red-500/30 bg-red-500/5",
    titleColor: "text-red-400",
    body: "قسّم تدريبك في Phases، Base Phase (بناء الـ Aerobic Base) ثم Build Phase (زيادة الـ Intensity) ثم Peak Phase (قبل السباق).",
    tip: "Recovery Week كل 3-4 أسابيع، خفف الـ Volume بـ 30-40% وخلي الـ Intensity.",
  },
];

const weeklySchedules = [
  {
    level: "Starter — 3 أيام",
    icon: "🌱",
    color: "border-green-500/30",
    days: [
      { day: "الاثنين", session: "Easy Run، 30 دقيقة Zone 2", icon: "🏃" },
      { day: "الثلاثاء", session: "Rest + Foam Roller", icon: "😴" },
      { day: "الأربعاء", session: "Easy Run، 30 دقيقة Zone 2", icon: "🏃" },
      { day: "الخميس", session: "Rest + Foam Roller", icon: "😴" },
      { day: "الجمعة", session: "Easy Run، 40 دقيقة Zone 2", icon: "🏃" },
      { day: "السبت", session: "Rest + Foam Roller", icon: "😴" },
      { day: "الأحد", session: "Complete Rest", icon: "🌙" },
    ],
  },
  {
    level: "Serious — 5 أيام",
    icon: "💪",
    color: "border-blue-500/30",
    days: [
      { day: "الاثنين", session: "Easy Run، 45 دقيقة Zone 2", icon: "🏃" },
      { day: "الثلاثاء", session: "Interval Session، 4×1km Zone 4", icon: "⚡" },
      { day: "الأربعاء", session: "Recovery Run، 30 دقيقة Zone 1", icon: "🌿" },
      { day: "الخميس", session: "Strength + Resistance Bands", icon: "💪" },
      { day: "الجمعة", session: "Rest + Foam Roller", icon: "😴" },
      { day: "السبت", session: "Long Run، 90 دقيقة Zone 2", icon: "🏃" },
      { day: "الأحد", session: "Complete Rest", icon: "🌙" },
    ],
  },
  {
    level: "Advanced — 6 أيام",
    icon: "🏆",
    color: "border-yellow-500/30",
    days: [
      { day: "الاثنين", session: "Easy Run، 60 دقيقة Zone 2", icon: "🏃" },
      { day: "الثلاثاء", session: "Tempo Run، 20 دقيقة Zone 3-4", icon: "⚡" },
      { day: "الأربعاء", session: "Medium Long Run، 75 دقيقة Zone 2", icon: "🏃" },
      { day: "الخميس", session: "Strength + Activation", icon: "💪" },
      { day: "الجمعة", session: "Interval Session، 6×800m Zone 5", icon: "🔥" },
      { day: "السبت", session: "Long Run، 120 دقيقة Zone 2", icon: "🏃" },
      { day: "الأحد", session: "Complete Rest + Theragun", icon: "🌙" },
    ],
  },
];

const gearChecklist = [
  {
    category: "HR Monitoring",
    icon: "🫀",
    items: [
      { name: "Chest Strap (Polar H9 أو H10)", essential: true, price: "~3,000–4,500 EGP" },
      { name: "GPS Watch (Coros أو Garmin)", essential: false, price: "~11,500–30,000 EGP" },
    ],
  },
  {
    category: "Recovery",
    icon: "💆",
    items: [
      { name: "Foam Roller", essential: true, price: "~500 EGP" },
      { name: "Resistance Bands", essential: false, price: "~500 EGP" },
      { name: "Theragun Prime", essential: false, price: "~12,000 EGP" },
    ],
  },
  {
    category: "Apps & Software",
    icon: "📱",
    items: [
      { name: "Polar Beat (مجاناً)", essential: true, price: "مجاناً" },
      { name: "Garmin Connect (مجاناً)", essential: false, price: "مجاناً" },
      { name: "Strava (Free أو Premium)", essential: false, price: "مجاناً / ~250 EGP شهرياً" },
      { name: "TrainingPeaks", essential: false, price: "مجاناً / ~800 EGP شهرياً" },
    ],
  },
  {
    category: "Running Gear",
    icon: "👟",
    items: [
      { name: "Running Shoes مناسبة للقدم", essential: true, price: "~3,000–8,000 EGP" },
      { name: "Moisture-Wicking Socks", essential: true, price: "~200–500 EGP" },
      { name: "Running Shorts / Tights", essential: true, price: "~500–1,500 EGP" },
    ],
  },
];

const faqs = [
  {
    q: "من فين أبدأ لو عندي ميزانية محدودة؟",
    a: "Polar H9 والـ Foam Roller، حوالي 3,500 EGP بس. ده كل اللي محتاجه للبداية الصح. الـ GPS Watch جاي بعدين لما تثبت الـ Consistency.",
  },
  {
    q: "الـ 80/20 Rule ده حقيقي؟",
    a: "أيوه، مثبت علمياً في الـ Elite Athletes. معظم الناس بتتمرن كتير أوي في الـ Middle Zones (Zone 3) وده بيعمل Fatigue بدون Adaptation حقيقية.",
  },
  {
    q: "كام أسبوع لحد ما أشوف نتيجة؟",
    a: "الـ Aerobic Base بياخد 8-12 أسبوع تبدأ تحس بفرق حقيقي. الـ Consistency هي المفتاح، مش الـ Intensity.",
  },
  {
    q: "الـ Theragun يستحق فعلاً؟",
    a: "لو بتتمرن 5 أيام أو أكتر في الأسبوع، أيوه. لو أقل من كده، الـ Foam Roller كافي تماماً وأرخص بكتير.",
  },
  {
    q: "Garmin ولا Coros للـ Beginner؟",
    a: "Coros Pace 3، أفضل قيمة بكتير للـ Beginner. Dual GPS وBattery أطول بسعر أقل. الـ Garmin لما تكون جاهز للـ Upgrade.",
  },
  {
    q: "فين أقدر أشتري الـ Gear ده في مصر؟",
    a: "كل الـ Gear ده متاح في Pulse Gear Egypt بأسعار مناسبة بالجنيه المصري، تواصل معانا وهنساعدك تبني الـ Setup المناسب لمستواك وميزانيتك.",
  },
];

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */

export default function CompleteTrainingSetupPage() {
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
            <span className="text-zinc-400">Complete Training Setup</span>
          </div>

          <span className="self-start text-xs font-bold uppercase tracking-wide text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full">
            Complete Guide 2026
          </span>

          {/* ✅ Title split into two lines */}
          <h1 className="text-4xl md:text-5xl font-black uppercase leading-tight">
            Complete Training Setup 🔧
            <br />
            <span className="text-red-500">من الصفر للـ Pro</span>
          </h1>

          {/* ✅ dir="rtl" + no dashes */}
          <p className="text-lg text-zinc-400 leading-relaxed" dir="rtl">
            الدليل الشامل لبناء أفضل Setup تدريبي في 2026، من اختيار
            الـ Gear الصح للـ Training Plan للـ Recovery. كل حاجة محتاجها
            في مكان واحد. كل الـ Gear متاح في{" "}
            <span className="text-white font-bold">Pulse Gear Egypt</span>{" "}
            بأسعار مناسبة بالجنيه المصري. 🇪🇬
          </p>

          <div className="flex items-center gap-4 text-xs text-zinc-500 flex-wrap">
            <span>⏱ 12 min read</span>
            <span>•</span>
            <span>🔧 Complete Guide</span>
            <span>•</span>
            <span>Updated 2026</span>
          </div>

          {/* Pulse Gear Egypt Banner */}
          <div className="bg-red-600/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
            <span className="text-2xl shrink-0">🇪🇬</span>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-bold text-white">متاح في Pulse Gear Egypt</p>
              <p className="text-xs text-zinc-400 leading-relaxed" dir="rtl">
                كل الـ Gear في المقال ده بتقدر تطلبه عن طريق Pulse Gear Egypt
                بأسعار مناسبة بالجنيه المصري، بدون تعقيدات الاستيراد أو الوسطاء.
              </p>
            </div>
          </div>

          {/* Table of Contents */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
              📋 Table of Contents
            </p>
            {[
              { href: "#setup-levels", label: "الـ Setup Levels الأربعة" },
              { href: "#training-principles", label: "مبادئ التدريب الأساسية" },
              { href: "#weekly-schedules", label: "الجداول الأسبوعية" },
              { href: "#gear-checklist", label: "الـ Gear Checklist الكاملة" },
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

        {/* ─── SETUP LEVELS ─── */}
        <section id="setup-levels" className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white">
              الـ Setup Levels الأربعة 🎯
            </h2>
            <p className="text-sm text-zinc-500" dir="rtl">
              اختار الـ Level المناسب لمستواك وميزانيتك
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {setupLevels.map((setup) => (
              <div
                key={setup.level}
                className={`border rounded-2xl overflow-hidden ${setup.color}`}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 flex-wrap gap-3">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{setup.icon}</span>
                    <div>
                      <p className={`font-black uppercase text-lg ${setup.titleColor}`}>
                        {setup.level}
                      </p>
                      <p className="text-xs text-zinc-500" dir="rtl">{setup.tagline}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-white">{setup.total}</p>
                    <p className="text-xs text-zinc-500" dir="rtl">إجمالي الـ Setup</p>
                  </div>
                </div>

                {/* Gear Items */}
                <div className="flex flex-col divide-y divide-zinc-800">
                  {setup.gear.map((item) => (
                    <div key={item.name} className="p-5 flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white text-sm">{item.name}</p>
                          {item.essential && (
                            <span className="text-xs font-bold uppercase tracking-wide text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded-full">
                              أساسي
                            </span>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-black text-red-400">{item.price}</p>
                          <p className="text-xs text-zinc-600" dir="rtl">عبر Pulse Gear Egypt</p>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-500 uppercase tracking-wide">
                        {item.role}
                      </p>
                      <p className="text-xs text-zinc-400 leading-relaxed" dir="rtl">
                        {item.why}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Training Plan */}
                <div className="p-5 border-t border-zinc-800 bg-zinc-900/30">
                  <p className="text-xs font-bold uppercase tracking-wide text-zinc-400 mb-3">
                    📋 Training Plan للـ {setup.level}
                  </p>
                  <div className="flex flex-col gap-2">
                    {setup.plan.map((point, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-red-400 text-xs shrink-0 mt-0.5">•</span>
                        <p className="text-xs text-zinc-400 leading-relaxed" dir="rtl">
                          {point}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── TRAINING PRINCIPLES ─── */}
        <section id="training-principles" className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white">
              مبادئ التدريب الأساسية 📚
            </h2>
            <p className="text-sm text-zinc-500" dir="rtl">
              الـ Principles دي أهم من أي Gear، افهمها كويس
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {trainingPrinciples.map((principle) => (
              <div
                key={principle.title}
                className={`border rounded-2xl p-6 flex flex-col gap-4 ${principle.color}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{principle.icon}</span>
                  <p className={`font-black uppercase text-lg ${principle.titleColor}`}>
                    {principle.title}
                  </p>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed" dir="rtl">
                  {principle.body}
                </p>
                <div className="bg-zinc-900/50 border border-zinc-700/50 rounded-xl p-4 flex items-start gap-3">
                  <span className="text-yellow-400 shrink-0">💡</span>
                  <p className="text-xs text-zinc-400 leading-relaxed" dir="rtl">
                    {principle.tip}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── WEEKLY SCHEDULES ─── */}
        <section id="weekly-schedules" className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white">
              الجداول الأسبوعية 📅
            </h2>
            <p className="text-sm text-zinc-500" dir="rtl">
              جدول جاهز لكل مستوى، ابدأ بيه من بكرة
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {weeklySchedules.map((schedule) => (
              <div
                key={schedule.level}
                className={`border rounded-2xl overflow-hidden ${schedule.color} bg-zinc-900/30`}
              >
                {/* Schedule Header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800">
                  <span className="text-xl">{schedule.icon}</span>
                  <p className="font-black uppercase text-white" dir="rtl">
                    {schedule.level}
                  </p>
                </div>

                {/* Days */}
                <div className="flex flex-col divide-y divide-zinc-800">
                  {schedule.days.map((day) => (
                    <div
                      key={day.day}
                      className="flex items-center gap-4 px-5 py-3 hover:bg-zinc-800/30 transition-colors"
                    >
                      <span className="text-lg shrink-0">{day.icon}</span>
                      <p className="text-xs font-bold text-zinc-400 w-20 shrink-0" dir="rtl">
                        {day.day}
                      </p>
                      <p className="text-xs text-zinc-300" dir="rtl">{day.session}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── GEAR CHECKLIST ─── */}
        <section id="gear-checklist" className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white">
              الـ Gear Checklist الكاملة ✅
            </h2>
            <p className="text-sm text-zinc-500" dir="rtl">
              كل حاجة محتاجها، مرتبة حسب الأولوية
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {gearChecklist.map((category) => (
              <div
                key={category.category}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
              >
                {/* Category Header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800 bg-zinc-800/50">
                  <span className="text-xl">{category.icon}</span>
                  <p className="font-black uppercase text-white text-sm">
                    {category.category}
                  </p>
                </div>

                {/* Items */}
                <div className="flex flex-col divide-y divide-zinc-800">
                  {category.items.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between px-5 py-4 hover:bg-zinc-800/30 transition-colors gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${item.essential ? "border-red-500 bg-red-500/20" : "border-zinc-600"}`}>
                          {item.essential && (
                            <span className="text-red-400 text-xs">✓</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-white" dir="rtl">{item.name}</p>
                          {item.essential && (
                            <p className="text-xs text-red-400">أساسي</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-red-400">{item.price}</p>
                        <p className="text-xs text-zinc-600" dir="rtl">عبر Pulse Gear Egypt</p>
                      </div>
                    </div>
                  ))}
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
                <p className="font-bold text-white text-sm" dir="rtl">س: {faq.q}</p>
                <p className="text-xs text-zinc-400 leading-relaxed border-t border-zinc-800 pt-3" dir="rtl">
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
          <p className="text-zinc-400 text-sm max-w-md leading-relaxed" dir="rtl">
            في Pulse Gear Egypt، بنوفرلك أفضل أجهزة التدريب العالمية
            بأسعار مناسبة بالجنيه المصري، بدون تعقيدات الاستيراد أو
            الوسطاء. تواصل معانا وهنساعدك تبني الـ Complete Setup
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

        {/* Related Articles */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-black uppercase text-white">
            اقرأ كمان 📚
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { href: "/blog/best-heart-rate-monitors", icon: "🫀", tag: "Gear Guide", title: "Best Heart Rate Monitors 2026" },
              { href: "/blog/gear-guide/beginners-guide", icon: "🌱", tag: "Beginner", title: "Beginner's Gear Guide" },
              { href: "/blog/gear-guide/budget-vs-premium", icon: "💰", tag: "Comparison", title: "Budget vs Premium Gear" },
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