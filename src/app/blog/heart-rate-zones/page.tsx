// src/app/blog/heart-rate-zones/page.tsx

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Heart Rate Zones: اتدرب بذكاء مش بتعب | Pulse Gear Blog",
  description:
    "اتعلم الـ 5 Heart Rate Zones وإزاي تستخدمهم عشان تحسن تدريبك وتوصل لنتايج أسرع.",
  openGraph: {
    title: "Heart Rate Zones: اتدرب بذكاء مش بتعب",
    description:
      "اتعلم الـ 5 Heart Rate Zones وإزاي تستخدمهم عشان تحسن تدريبك.",
    type: "article",
  },
};

const zones = [
  {
    zone: "Zone 1",
    name: "Active Recovery",
    range: "50–60% Max HR",
    emoji: "🟢",
    color: "border-green-500/30 bg-green-500/5",
    badge: "text-green-400 bg-green-400/10",
    bar: "bg-green-500",
    barWidth: "20%",
    description:
      "مجهود خفيف جداً. جسمك بيتعافى وبيحرق الدهون كـ Fuel أساسي. تقدر تتكلم جمل كاملة بدون ما تلهث خالص.",
    example: "مشي خفيف، ركوب عجلة هادي",
    benefit: "Recovery + Fat Burning",
  },
  {
    zone: "Zone 2",
    name: "Aerobic Base",
    range: "60–70% Max HR",
    emoji: "🔵",
    color: "border-blue-500/30 bg-blue-500/5",
    badge: "text-blue-400 bg-blue-400/10",
    bar: "bg-blue-500",
    barWidth: "40%",
    description:
      "الـ Zone الأهم في التدريب. بتبني الـ Aerobic Base وبتحسن كفاءة الجسم في حرق الدهون. ده سر الـ Elite Athletes اللي محدش بيحكيه.",
    example: "جري هادي — تقدر تتكلم جمل قصيرة",
    benefit: "Endurance + Efficiency",
  },
  {
    zone: "Zone 3",
    name: "Aerobic Threshold",
    range: "70–80% Max HR",
    emoji: "🟡",
    color: "border-yellow-500/30 bg-yellow-500/5",
    badge: "text-yellow-400 bg-yellow-400/10",
    bar: "bg-yellow-500",
    barWidth: "60%",
    description:
      "مجهود متوسط. التنفس بيتقل وبتتكلم كلمات بس مش جمل. بتحسن الـ Cardiovascular Efficiency. الـ Zone ده ممكن يبقى Trap لو اتدربت فيه أوي.",
    example: "Tempo Run، سباحة متوسطة",
    benefit: "Cardio Efficiency",
  },
  {
    zone: "Zone 4",
    name: "Lactate Threshold",
    range: "80–90% Max HR",
    emoji: "🟠",
    color: "border-orange-500/30 bg-orange-500/5",
    badge: "text-orange-400 bg-orange-400/10",
    bar: "bg-orange-500",
    barWidth: "80%",
    description:
      "مجهود عالي. جسمك بيبدأ يراكم الـ Lactic Acid. بتحسن السرعة والـ Race Performance. صعب تتكلم — بتتكلم كلمتين بس.",
    example: "Interval Training، Race Pace",
    benefit: "Speed + Performance",
  },
  {
    zone: "Zone 5",
    name: "Maximum Effort",
    range: "90–100% Max HR",
    emoji: "🔴",
    color: "border-red-500/30 bg-red-500/5",
    badge: "text-red-400 bg-red-400/10",
    bar: "bg-red-500",
    barWidth: "100%",
    description:
      "أقصى طاقة ممكنة. مش ممكن تستمر أكتر من دقيقتين أو تلاتة. بتبني الـ Peak Power والسرعة القصوى. مش للاستخدام اليومي.",
    example: "Sprints، Max Intervals",
    benefit: "Peak Power + Speed",
  },
];

const trainingDays = [
  {
    label: "Easy Days",
    zones: "Zone 1–2",
    percentage: "80%",
    tip: "روح أبطأ مما تتخيل. معظم الناس بتغلط هنا.",
    color: "border-blue-500/30 bg-blue-500/5",
    textColor: "text-blue-400",
  },
  {
    label: "Tempo Days",
    zones: "Zone 3",
    percentage: "10%",
    tip: "مجهود متحكم فيه. مش سهل ومش صعب جداً.",
    color: "border-yellow-500/30 bg-yellow-500/5",
    textColor: "text-yellow-400",
  },
  {
    label: "Hard Days",
    zones: "Zone 4–5",
    percentage: "10%",
    tip: "اديها كل حاجة. جسمك هيتكيف ويبقى أقوى.",
    color: "border-red-500/30 bg-red-500/5",
    textColor: "text-red-400",
  },
];

const mistakes = [
  {
    mistake: "التدريب في الـ Zone 3 طول الوقت",
    fix: "الـ Zone 3 مش سهل ومش صعب — بيتعبك من غير ما يفيدك كتير. اتجنبه كـ Default.",
  },
  {
    mistake: "ما بتدربش في الـ Zone 2 كفاية",
    fix: "الـ Zone 2 بيبدو بطيء أوي، بس ده هو الأساس الحقيقي للـ Endurance.",
  },
  {
    mistake: "كل يوم تدريب شديد",
    fix: "جسمك بيتحسن في وقت الراحة مش في وقت التدريب. الـ Recovery جزء من الـ Training.",
  },
];

const ageExamples = [
  { age: 20, maxHR: 200 },
  { age: 30, maxHR: 190 },
  { age: 40, maxHR: 180 },
  { age: 50, maxHR: 170 },
];

const relatedPosts = [
  {
    slug: "zone-2-training",
    emoji: "🫀",
    title: "Zone 2 Training: سر الـ Elite Athletes",
    tag: "Training Guide",
  },
  {
    slug: "heart-rate-strap-vs-optical",
    emoji: "⚡",
    title: "Heart Rate Strap vs Optical: أيهما أدق؟",
    tag: "Gear Review",
  },
  {
    slug: "garmin-vs-polar",
    emoji: "🥊",
    title: "Garmin vs Polar: أنهي الأحسن ليك؟",
    tag: "Gear Review",
  },
];

export default function HeartRateZonesPage() {
  return (
    <main className="w-full bg-zinc-950 min-h-screen text-white">

      {/* ===== HERO ===== */}
      <section className="w-full border-b border-zinc-800 py-20 px-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wide">
            <Link href="/" className="hover:text-white transition-colors duration-200">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-white transition-colors duration-200">Blog</Link>
            <span>/</span>
            <span className="text-zinc-400">Heart Rate Zones</span>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wide text-red-500 bg-red-500/10 px-3 py-1 rounded-full">
              Training Guide
            </span>
            <span className="text-xs font-bold uppercase tracking-wide text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full">
              ⭐ Pillar Article
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-black uppercase leading-tight">
            Heart Rate Zones 🎯
            <br />
            <span className="text-red-500">اتدرب بذكاء مش بتعب</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-zinc-400 leading-relaxed">
            معظم الناس بتتدرب غلط — بتتعب أوي في الأيام السهلة وبتفضل ضعيفة
            في الأيام الصعبة. الـ Heart Rate Zones هي الحل اللي هيغير
            طريقة تدريبك خالص. 🔄
          </p>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span>⏱ 8 min read</span>
            <span>•</span>
            <span>🏃 Training Guide</span>
            <span>•</span>
            <span>Pulse Gear Egypt</span>
          </div>

        </div>
      </section>

      {/* ===== ARTICLE BODY ===== */}
      <article className="max-w-3xl mx-auto px-6 py-16 flex flex-col gap-16">

        {/* ===== WHAT ARE ZONES ===== */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-black uppercase text-white">
            إيه هي الـ Heart Rate Zones؟ 🤔
          </h2>
          <p className="text-zinc-400 leading-relaxed">
            الـ Heart Rate Zones هي نطاقات شدة بناءً على الـ{" "}
            <span className="text-white font-bold">Maximum Heart Rate (Max HR)</span> بتاعك.
            كل Zone بتحفز تكيفات فسيولوجية مختلفة في جسمك —
            يعني كل Zone بتخلي جسمك يتحسن في حاجة مختلفة.
          </p>
          <p className="text-zinc-400 leading-relaxed">
            التدريب من غير Zones زي إنك تقود عربية من غير عداد السرعة —
            ممكن توصل، بس مش هتعرف إنت بتتحرك بكفاءة ولا لأ.
          </p>

          {/* Callout */}
          <div className="bg-zinc-900 border border-red-500/30 rounded-2xl p-6 flex items-start gap-4">
            <span className="text-2xl shrink-0">💡</span>
            <div className="flex flex-col gap-1">
              <p className="font-black uppercase text-white text-sm">حقيقة مهمة</p>
              <p className="text-zinc-400 text-sm leading-relaxed">
                الـ Elite Athletes بيقضوا{" "}
                <span className="text-white font-bold">80% من تدريبهم</span>{" "}
                في الـ Zone 1 و Zone 2 فقط. مش كل يوم شدة عالية!
              </p>
            </div>
          </div>
        </section>

        {/* ===== MAX HR FORMULA ===== */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-black uppercase text-white">
            إزاي تحسب الـ Max HR بتاعك؟ 🧮
          </h2>

          {/* Formula Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
            <p className="text-xs uppercase tracking-widest text-zinc-500">المعادلة</p>
            <p className="text-3xl md:text-4xl font-black text-white">
              Max HR = 220 − عمرك
            </p>
            <div className="border-t border-zinc-800 pt-4 w-full flex flex-col gap-1">
              <p className="text-xs text-zinc-500">مثال عملي</p>
              <p className="text-lg font-bold text-zinc-300">
                لو عندك 30 سنة → Max HR = 190 bpm
              </p>
            </div>
          </div>

          {/* Age Examples */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ageExamples.map((ex) => (
              <div
                key={ex.age}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col items-center gap-1"
              >
                <p className="text-xs text-zinc-500">عمر {ex.age}</p>
                <p className="text-3xl font-black text-white">{ex.maxHR}</p>
                <p className="text-xs text-zinc-600">bpm</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-zinc-600">
            ⚠️ دي تقديرات. الـ Lab Stress Test بيدي أدق نتيجة، بس المعادلة دي كويسة لمعظم الناس.
          </p>
        </section>

        {/* ===== THE 5 ZONES ===== */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-black uppercase text-white">
            الـ 5 Heart Rate Zones بالتفصيل 📊
          </h2>

          <div className="flex flex-col gap-4">
            {zones.map((z) => (
              <div
                key={z.zone}
                className={`border rounded-2xl p-6 flex flex-col gap-4 ${z.color}`}
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{z.emoji}</span>
                    <div>
                      <p className="font-black uppercase text-white">
                        {z.zone} — {z.name}
                      </p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${z.badge}`}>
                        {z.range}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-zinc-400 leading-relaxed">{z.description}</p>

                {/* Details */}
                <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
                  <span>📍 <span className="text-zinc-400">{z.example}</span></span>
                  <span>✅ <span className="text-zinc-400">{z.benefit}</span></span>
                </div>

                {/* Bar */}
                <div className="w-full bg-zinc-800 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${z.bar} transition-all`}
                    style={{ width: z.barWidth }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== 80/20 RULE ===== */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-black uppercase text-white">
            قاعدة الـ 80/20: سر الـ Elite Athletes 🏆
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {trainingDays.map((day) => (
              <div
                key={day.label}
                className={`border rounded-2xl p-6 flex flex-col items-center gap-3 text-center ${day.color}`}
              >
                <p className={`text-4xl font-black ${day.textColor}`}>{day.percentage}</p>
                <p className="font-black uppercase text-white text-sm">{day.label}</p>
                <p className={`text-xs font-bold ${day.textColor}`}>{day.zones}</p>
                <p className="text-xs text-zinc-500 leading-relaxed">{day.tip}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== COMMON MISTAKES ===== */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-black uppercase text-white">
            أكتر الأخطاء الشائعة ⚠️
          </h2>
          <div className="flex flex-col gap-3">
            {mistakes.map((item) => (
              <div
                key={item.mistake}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-start gap-4"
              >
                <span className="text-xl shrink-0">❌</span>
                <div className="flex flex-col gap-1">
                  <p className="font-bold text-white text-sm">{item.mistake}</p>
                  <p className="text-sm text-zinc-400 leading-relaxed">💡 {item.fix}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="bg-gradient-to-br from-red-600/20 to-zinc-900 border border-red-500/20 rounded-2xl p-8 flex flex-col gap-4 items-center text-center">
          <span className="text-4xl">⌚</span>
          <h3 className="text-xl font-black uppercase text-white">
            جاهز تتدرب بالـ Heart Rate Zones؟
          </h3>
          <p className="text-zinc-400 text-sm max-w-md leading-relaxed">
            محتاج Heart Rate Monitor دقيق عشان تتدرب في الـ Zone الصح.
            شوف مجموعتنا من الـ Chest Straps والـ GPS Watches.
          </p>
          <Link
            href="/products"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wide transition-colors duration-200"
          >
            Browse Heart Rate Monitors
          </Link>
        </section>

        {/* ===== RELATED POSTS ===== */}
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
                <h3 className="text-sm font-black uppercase text-white leading-tight group-hover:text-red-400 transition-colors duration-200">
                  {post.title}
                </h3>
                <span className="text-xs text-red-500 font-semibold">اقرأ المقال →</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ===== BACK ===== */}
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