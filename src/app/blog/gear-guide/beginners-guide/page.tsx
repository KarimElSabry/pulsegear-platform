// src/app/blog/gear-guide/beginners-guide/page.tsx

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Beginner's Gear Guide 2026 | Pulse Gear Egypt Blog",
  description:
    "دليل المبتدئين الشامل لاختيار أول Gear تدريبي ليك — متاح في Pulse Gear Egypt بأسعار مناسبة بالجنيه المصري.",
  openGraph: {
    title: "Beginner's Gear Guide 2026 | Pulse Gear Egypt",
    description:
      "دليل المبتدئين الشامل لاختيار أول Gear تدريبي ليك.",
    type: "article",
  },
};

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */

const starterPacks = [
  {
    tier: "الـ Absolute Beginner",
    icon: "🌱",
    tagline: "ابدأ بأقل تكلفة ممكنة",
    color: "border-green-500/30 bg-green-500/5",
    titleColor: "text-green-400",
    total: "~3,500 EGP",
    items: [
      {
        name: "Polar H9",
        role: "Chest Strap HR Monitor",
        price: "~3,000 EGP",
        why: "أرخص Chest Strap بدقة عالية — أفضل بكتير من الـ Optical HR في الموبايل.",
      },
      {
        name: "Foam Roller",
        role: "Recovery Tool",
        price: "~500 EGP",
        why: "أهم Recovery Tool وأرخصه — استخدمه يومياً بعد التمرين.",
      },
      {
        name: "Polar Beat App",
        role: "Training App",
        price: "مجاناً",
        why: "بيشتغل مع الـ H9 مباشرة — بيديك HR Zones وCalories وWorkout Summary.",
      },
    ],
  },
  {
    tier: "الـ Serious Beginner",
    icon: "💪",
    tagline: "جاهز تاخد التدريب بجدية",
    color: "border-blue-500/30 bg-blue-500/5",
    titleColor: "text-blue-400",
    total: "~15,000 EGP",
    items: [
      {
        name: "Polar H10",
        role: "Chest Strap HR Monitor",
        price: "~4,500 EGP",
        why: "الأدق في السوق — مع ذاكرة داخلية وHRV Tracking.",
      },
      {
        name: "Coros Pace 3",
        role: "GPS Watch",
        price: "~11,500 EGP",
        why: "أفضل GPS Watch بسعر معقول — Dual-Frequency GPS وBattery 38 ساعة.",
      },
      {
        name: "Foam Roller",
        role: "Recovery Tool",
        price: "~500 EGP",
        why: "Recovery أساسي — لازم يبقى عندك من اليوم الأول.",
      },
      {
        name: "Resistance Bands",
        role: "Warm-Up & Activation",
        price: "~500 EGP",
        why: "للـ Warm-Up والـ Activation قبل التمرين — بيقلل الإصابات.",
      },
    ],
  },
  {
    tier: "الـ Dedicated Athlete",
    icon: "🏆",
    tagline: "جاهز للمستوى الجاي",
    color: "border-yellow-500/30 bg-yellow-500/5",
    titleColor: "text-yellow-400",
    total: "~50,000 EGP",
    items: [
      {
        name: "Polar H10",
        role: "Chest Strap HR Monitor",
        price: "~4,500 EGP",
        why: "الأدق في السوق — أساسي في أي Setup جاد.",
      },
      {
        name: "Garmin Forerunner 965",
        role: "GPS Watch",
        price: "~30,000 EGP",
        why: "أفضل Running Watch — Training Readiness وHRV وOnboard Maps.",
      },
      {
        name: "Theragun Mini 2.0",
        role: "Percussive Recovery",
        price: "~10,000 EGP",
        why: "بيسرع الـ Recovery بشكل ملحوظ — مناسب بعد كل Session شديدة.",
      },
      {
        name: "Resistance Bands",
        role: "Warm-Up & Activation",
        price: "~500 EGP",
        why: "للـ Activation قبل التمرين — مهم جداً للـ Injury Prevention.",
      },
      {
        name: "Foam Roller",
        role: "Daily Recovery",
        price: "~500 EGP",
        why: "استخدمه يومياً — أرخص Recovery Tool وأكتر فائدة.",
      },
    ],
  },
];

const commonMistakes = [
  {
    icon: "❌",
    mistake: "شراء الـ GPS Watch الأول قبل الـ Chest Strap",
    fix: "ابدأ بـ Polar H9 (~3,000 EGP) — أدق وأرخص. الـ Watch جاي بعدين.",
  },
  {
    icon: "❌",
    mistake: "الاعتماد على الـ Optical HR في الـ HIIT",
    fix: "الـ Optical HR بيتأخر في التمارين الشديدة — الـ Chest Strap هو الحل الوحيد للدقة.",
  },
  {
    icon: "❌",
    mistake: "إهمال الـ Recovery Tools",
    fix: "الـ Recovery بنفس أهمية التمرين — Foam Roller بـ ~500 EGP يفرق فرق كبير.",
  },
  {
    icon: "❌",
    mistake: "شراء أغلى جهاز من أول يوم",
    fix: "ابدأ بالـ Starter Pack وترقي بالراحة — الـ Gear الغالي مش هيعوض التدريب الغلط.",
  },
  {
    icon: "❌",
    mistake: "تجاهل الـ HR Zones",
    fix: "اتعلم الـ 5 Zones الأول — ده أهم من أي Gear. Zone 2 هو أساس الـ Aerobic Fitness.",
  },
  {
    icon: "❌",
    mistake: "التمرين كل يوم بدون Rest Days",
    fix: "الجسم بيتحسن في الـ Recovery مش في التمرين — Rest Days مش كسل، ده جزء من البرنامج.",
  },
];

const firstWeekPlan = [
  {
    day: "اليوم 1",
    icon: "🎯",
    color: "border-red-500/30 bg-red-500/5",
    title: "Setup الـ Gear",
    tasks: [
      "حمّل Polar Beat أو Garmin Connect على موبايلك",
      "وصّل الـ Chest Strap بالـ App",
      "اعمل Resting HR Test الصبح بعد الاستيقاظ",
      "احسب الـ Max HR: 220 − عمرك",
    ],
  },
  {
    day: "اليوم 2",
    icon: "🏃",
    color: "border-green-500/30 bg-green-500/5",
    title: "أول Easy Run",
    tasks: [
      "البس الـ Chest Strap وابلله قبل اللبس",
      "ابدأ بـ 20-30 دقيقة في Zone 2 (60-70% Max HR)",
      "لو الـ HR طلع من Zone 2، امشي لحد ما يرجع",
      "بعد التمرين: Foam Roller على الـ Calves والـ Quads — 10 دقائق",
    ],
  },
  {
    day: "اليوم 3",
    icon: "😴",
    color: "border-purple-500/30 bg-purple-500/5",
    title: "Rest Day",
    tasks: [
      "راجع الـ Data من التمرين الأمبارح",
      "شوف الـ Average HR والـ Time in Zones",
      "Foam Roller خفيف — 10 دقائق",
      "نوم 8 ساعات على الأقل",
    ],
  },
  {
    day: "اليوم 4",
    icon: "⚡",
    color: "border-orange-500/30 bg-orange-500/5",
    title: "Interval Session خفيفة",
    tasks: [
      "Warm-Up: 10 دقائق في Zone 1-2",
      "4 × 1 دقيقة في Zone 4 مع 2 دقيقة راحة",
      "Cool-Down: 10 دقائق في Zone 1",
      "لاحظ الفرق في الـ HR بين الـ Intervals والـ Recovery",
    ],
  },
  {
    day: "اليوم 5",
    icon: "🌿",
    color: "border-green-500/30 bg-green-500/5",
    title: "Easy Recovery Run",
    tasks: [
      "20 دقيقة في Zone 1-2 بس — مش أكتر",
      "لو الـ HR مش راجع للـ Zone 1 في الـ Recovery، ده علامة على Fatigue",
      "Foam Roller بعد التمرين",
    ],
  },
  {
    day: "اليوم 6",
    icon: "🏋️",
    color: "border-blue-500/30 bg-blue-500/5",
    title: "Strength Session",
    tasks: [
      "Resistance Bands Activation: Glutes وHip Flexors — 10 دقائق",
      "Bodyweight Exercises: Squats، Lunges، Push-Ups",
      "راقب الـ HR — محاولش تعدي Zone 3",
      "Theragun أو Foam Roller بعد التمرين",
    ],
  },
  {
    day: "اليوم 7",
    icon: "🌙",
    color: "border-zinc-700/30 bg-zinc-800/30",
    title: "Complete Rest",
    tasks: [
      "راجع الـ Weekly Data كلها",
      "شوف الـ Resting HR — هل اتغير؟",
      "خطط للأسبوع الجاي",
      "نوم 8+ ساعات — أهم Recovery Tool",
    ],
  },
];

const keyTerms = [
  { term: "HR Zones", def: "5 مناطق لضربات القلب — Zone 1 (راحة) لـ Zone 5 (أقصى جهد). كل Zone ليه هدف تدريبي مختلف." },
  { term: "HRV", def: "Heart Rate Variability — الفرق الزمني بين الضربات. أهم مؤشر للـ Recovery والـ Readiness." },
  { term: "Resting HR", def: "ضربات القلب في الراحة التامة — قيسه الصبح قبل ما تقوم. الـ Athletes عادةً 40-60 BPM." },
  { term: "Zone 2", def: "60-70% من الـ Max HR — أساس الـ Aerobic Fitness. 80% من تدريبك المفروض يكون هنا." },
  { term: "Chest Strap", def: "جهاز قياس HR بيتلبس على الصدر — أدق بكتير من الـ Optical HR في الساعة." },
  { term: "Optical HR", def: "قياس HR عن طريق الضوء في الساعة — مناسب للـ Easy Sessions، مش دقيق في الـ HIIT." },
  { term: "Recovery", def: "فترة الراحة بين التمارين — الجسم بيتحسن هنا مش في التمرين نفسه." },
  { term: "Training Load", def: "مجموع الضغط التدريبي على جسمك — مهم تتابعه عشان متعملش Overtraining." },
];

const faqs = [
  {
    q: "أبدأ بـ Chest Strap ولا GPS Watch؟",
    a: "Chest Strap أول — أرخص وأدق. Polar H9 بـ ~3,000 EGP هو أفضل بداية. الـ GPS Watch جاي بعدين لما تعرف إيه اللي محتاجه.",
  },
  {
    q: "الـ Foam Roller مهم فعلاً؟",
    a: "أيوه — من أهم الـ Recovery Tools وأرخصها. بيقلل الـ DOMS (وجع العضلات بعد التمرين) ويحسن الـ Flexibility. استخدمه يومياً.",
  },
  {
    q: "إزاي أعرف الـ Max HR بتاعي؟",
    a: "الفورمولا البسيطة: 220 − عمرك. لكن الأدق هو الـ Max HR Test — ابقى اتكلم معانا في Pulse Gear Egypt وهنشرحلك إزاي.",
  },
  {
    q: "كام مرة في الأسبوع المفروض أتمرن؟",
    a: "للمبتدئ: 3-4 مرات في الأسبوع مع Rest Days بينهم. الـ Consistency أهم من الـ Frequency — 3 أيام منتظمين أحسن من 6 أيام متقطعين.",
  },
  {
    q: "فين أقدر أشتري الـ Gear ده في مصر؟",
    a: "كل الـ Gear ده متاح في Pulse Gear Egypt بأسعار مناسبة بالجنيه المصري — تواصل معانا وهنساعدك تختار الصح لمستواك وميزانيتك.",
  },
];

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */

export default function BeginnersGuide() {
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
            <span className="text-zinc-400">Beginner's Guide</span>
          </div>

          <span className="self-start text-xs font-bold uppercase tracking-wide text-green-500 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
            Beginner's Guide 2026
          </span>

          <h1 className="text-4xl md:text-5xl font-black uppercase leading-tight">
            Beginner's Gear Guide 🌱
            <br />
            <span className="text-red-500">ابدأ صح من أول يوم</span>
          </h1>

          <p className="text-lg text-zinc-400 leading-relaxed">
            مش محتاج تشتري كل حاجة من أول يوم — دليل المبتدئين
            بيوضحلك إيه اللي محتاجه فعلاً، إزاي تبدأ، وإزاي تترقى
            بالراحة. كل الـ Gear متاح في{" "}
            <span className="text-white font-bold">Pulse Gear Egypt</span>{" "}
            بأسعار مناسبة بالجنيه المصري. 🇪🇬
          </p>

          <div className="flex items-center gap-4 text-xs text-zinc-500 flex-wrap">
            <span>⏱ 10 min read</span>
            <span>•</span>
            <span>🌱 Beginner Friendly</span>
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
                كل الـ Gear في المقال ده بتقدر تطلبه عن طريق Pulse Gear Egypt
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
              { href: "#starter-packs", label: "الـ Starter Packs حسب المستوى" },
              { href: "#first-week", label: "خطة أول أسبوع" },
              { href: "#common-mistakes", label: "أكتر الأخطاء شيوعاً" },
              { href: "#key-terms", label: "المصطلحات الأساسية" },
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

        {/* ─── STARTER PACKS ─── */}
        <section id="starter-packs" className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white">
              الـ Starter Packs حسب المستوى 🎒
            </h2>
            <p className="text-sm text-zinc-500">
              اختار الـ Pack المناسب لمستواك — وترقي بالراحة
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {starterPacks.map((pack) => (
              <div
                key={pack.tier}
                className={`border rounded-2xl overflow-hidden ${pack.color}`}
              >
                {/* Pack Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 flex-wrap gap-3">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{pack.icon}</span>
                    <div>
                      <p className={`font-black uppercase text-lg ${pack.titleColor}`}>
                        {pack.tier}
                      </p>
                      <p className="text-xs text-zinc-500">{pack.tagline}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-white">{pack.total}</p>
                    <p className="text-xs text-zinc-500">إجمالي الـ Pack</p>
                  </div>
                </div>

                {/* Items */}
                <div className="flex flex-col divide-y divide-zinc-800">
                  {pack.items.map((item) => (
                    <div key={item.name} className="p-5 flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-bold text-white text-sm">{item.name}</p>
                          <p className="text-xs text-zinc-500 uppercase tracking-wide">
                            {item.role}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-black text-red-400">{item.price}</p>
                          <p className="text-xs text-zinc-600">عبر Pulse Gear Egypt</p>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">{item.why}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── FIRST WEEK PLAN ─── */}
        <section id="first-week" className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white">
              خطة أول أسبوع 📅
            </h2>
            <p className="text-sm text-zinc-500">
              خطوة خطوة — من أول يوم لآخر يوم في الأسبوع
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {firstWeekPlan.map((day) => (
              <div
                key={day.day}
                className={`border rounded-2xl overflow-hidden ${day.color}`}
              >
                <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800">
                  <span className="text-xl">{day.icon}</span>
                  <div>
                    <p className="font-black text-white">{day.day}</p>
                    <p className="text-xs text-zinc-500 uppercase tracking-wide">
                      {day.title}
                    </p>
                  </div>
                </div>
                <div className="p-5 flex flex-col gap-2">
                  {day.tasks.map((task, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-red-400 text-xs shrink-0 mt-0.5 font-bold">
                        {i + 1}.
                      </span>
                      <p className="text-xs text-zinc-400 leading-relaxed">{task}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── COMMON MISTAKES ─── */}
        <section id="common-mistakes" className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white">
              أكتر الأخطاء شيوعاً ⚠️
            </h2>
            <p className="text-sm text-zinc-500">
              اتعلم من غلطات الناس التانية — متعملهاش أنت
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {commonMistakes.map((item, i) => (
              <div
                key={i}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl shrink-0">{item.icon}</span>
                  <p className="font-bold text-white text-sm">{item.mistake}</p>
                </div>
                <div className="flex items-start gap-3 bg-green-500/5 border border-green-500/20 rounded-xl p-3">
                  <span className="text-green-400 text-xs font-bold shrink-0 mt-0.5">✅ الحل:</span>
                  <p className="text-xs text-zinc-400 leading-relaxed">{item.fix}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── KEY TERMS ─── */}
        <section id="key-terms" className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white">
              المصطلحات الأساسية 📖
            </h2>
            <p className="text-sm text-zinc-500">
              المصطلحات اللي هتسمعها كتير — افهمها من الأول
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            {keyTerms.map((item, i) => (
              <div
                key={i}
                className="flex flex-col md:flex-row gap-2 md:gap-6 px-5 py-4 border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition-colors"
              >
                <p className="text-sm font-black text-red-400 shrink-0 md:w-32">
                  {item.term}
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed">{item.def}</p>
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
            الوسطاء. تواصل معانا وهنساعدك تختار الـ Starter Pack
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
              { href: "/blog/gear-guide/budget-vs-premium", icon: "💰", tag: "Comparison", title: "Budget vs Premium Gear" },
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