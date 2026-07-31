// src/app/blog/training-guide/page.tsx

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Training Guide | Pulse Gear Egypt Blog",
  description:
    "دليل التدريب الشامل: تعرف على Heart Rate Zones وZone 2 والـ Recovery والـ Running Cadence. اتعلم إزاي تتمرن بذكاء.",
  openGraph: {
    title: "Training Guide | Pulse Gear Egypt Blog",
    description:
      "دليل التدريب الشامل: اتعلم إزاي تتمرن بذكاء.",
    type: "website",
  },
};

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */

const articles = [
  {
    href: "/blog/training-guide/heart-rate-zones",
    icon: "📊",
    tag: "Foundation",
    tagColor: "text-red-400 bg-red-500/10 border-red-500/20",
    title: "اتدرب بذكاء: Heart Rate Zones",
    desc: "الـ 5 Zones اللي كل Runner لازم يعرفها. إزاي تحسب الـ Zones بتاعتك وإزاي تستخدمها في التمرين.",
    readTime: "7 min",
    level: "Beginner",
    levelColor: "text-green-400",
    featured: true,
  },
  {
    href: "/blog/training-guide/zone-2-training",
    icon: "🫀",
    tag: "Deep Dive",
    tagColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    title: "سر الـ Elite Athletes: Zone 2 Training",
    desc: "ليه 80% من تدريب الـ Elite Athletes بيحصل في Zone 2؟ العلم وراء الـ Aerobic Base وإزاي تبنيه.",
    readTime: "8 min",
    level: "Intermediate",
    levelColor: "text-yellow-400",
    featured: true,
  },
  {
    href: "/blog/training-guide/sleep-recovery",
    icon: "😴",
    tag: "Recovery",
    tagColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    title: "الجزء اللي بتتجاهله: Sleep & Recovery",
    desc: "الجسم بيتحسن في الـ Recovery مش في التمرين. ليه النوم هو الـ Performance Enhancer الأقوى.",
    readTime: "8 min",
    level: "All Levels",
    levelColor: "text-zinc-400",
    featured: true,
  },
  {
    href: "/blog/training-guide/running-cadence",
    icon: "🏃",
    tag: "Technique",
    tagColor: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    title: "الخطوة الصح: Running Cadence",
    desc: "إزاي تحسن الـ Running Form بتاعك عن طريق الـ Cadence. الـ 180 SPM وليه هو الـ Target.",
    readTime: "6 min",
    level: "Beginner",
    levelColor: "text-green-400",
    featured: false,
  },
  {
    href: "/blog/training-guide/complete-training-setup",
    icon: "🔧",
    tag: "Complete Guide",
    tagColor: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    title: "كل حاجة في مكان واحد: Complete Training Setup",
    desc: "من الـ HR Zones للـ Recovery للـ Gear، الدليل الشامل لبناء Training System كامل.",
    readTime: "12 min",
    level: "All Levels",
    levelColor: "text-zinc-400",
    featured: false,
  },
];

const concepts = [
  {
    icon: "📊",
    title: "HR Zones",
    desc: "5 مناطق لضربات القلب، كل Zone ليه هدف تدريبي مختلف.",
    href: "/blog/training-guide/heart-rate-zones",
  },
  {
    icon: "🫀",
    title: "Zone 2",
    desc: "60-70% من الـ Max HR، أساس الـ Aerobic Fitness. 80% من تدريبك هنا.",
    href: "/blog/training-guide/zone-2-training",
  },
  {
    icon: "📈",
    title: "HRV",
    desc: "Heart Rate Variability، أهم مؤشر للـ Recovery والـ Readiness.",
    href: "/blog/training-guide/sleep-recovery",
  },
  {
    icon: "🏃",
    title: "Cadence",
    desc: "عدد الخطوات في الدقيقة، الـ Target هو 170-180 SPM.",
    href: "/blog/training-guide/running-cadence",
  },
  {
    icon: "⚡",
    title: "Training Load",
    desc: "مجموع الضغط التدريبي على جسمك، لازم تتابعه عشان تتجنب الـ Overtraining.",
    href: "/blog/training-guide/complete-training-setup",
  },
  {
    icon: "😴",
    title: "Recovery",
    desc: "الجسم بيتحسن في الراحة مش في التمرين. Rest Days مش كسل.",
    href: "/blog/training-guide/sleep-recovery",
  },
];

const learningPath = [
  {
    step: "01",
    color: "border-green-500/30 bg-green-500/5 text-green-400",
    title: "ابدأ بالـ HR Zones",
    desc: "افهم الـ 5 Zones واحسب الـ Max HR بتاعك.",
    href: "/blog/training-guide/heart-rate-zones",
    cta: "اقرأ الأول →",
  },
  {
    step: "02",
    color: "border-blue-500/30 bg-blue-500/5 text-blue-400",
    title: "اتعلم Zone 2",
    desc: "افهم ليه Zone 2 هو أساس كل Training Plan ناجح.",
    href: "/blog/training-guide/zone-2-training",
    cta: "اقرأ تاني →",
  },
  {
    step: "03",
    color: "border-purple-500/30 bg-purple-500/5 text-purple-400",
    title: "حسّن الـ Recovery",
    desc: "النوم والـ HRV وأدوات الـ Recovery، كل حاجة محتاج تعرفها.",
    href: "/blog/training-guide/sleep-recovery",
    cta: "اقرأ تالت →",
  },
  {
    step: "04",
    color: "border-orange-500/30 bg-orange-500/5 text-orange-400",
    title: "حسّن الـ Form",
    desc: "الـ Cadence والـ Running Technique، الخطوة الصح.",
    href: "/blog/training-guide/running-cadence",
    cta: "اقرأ رابع →",
  },
  {
    step: "05",
    color: "border-yellow-500/30 bg-yellow-500/5 text-yellow-400",
    title: "اربط كل حاجة ببعض",
    desc: "كل حاجة في مكان واحد: Complete Training Setup.",
    href: "/blog/training-guide/complete-training-setup",
    cta: "اقرأ أخيراً →",
  },
];

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */

export default function TrainingGuideHubPage() {
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
            <span className="text-zinc-400">Training Guide</span>
          </div>

          <span className="self-start text-xs font-bold uppercase tracking-wide text-purple-500 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
            Training Guide
          </span>

          <h1 className="text-4xl md:text-5xl font-black uppercase leading-tight">
            Training Guide 📊
            <br />
            <span className="text-red-500">اتدرب بذكاء، مش بجهد</span>
          </h1>

          <p className="text-lg text-zinc-400 leading-relaxed max-w-2xl" dir="rtl">
            مش كل التمارين بتفيد بنفس القدر. الـ Science بتقول إن
            الطريقة اللي بتتمرن بيها أهم من الوقت اللي بتقضيه في
            التمرين. هنا هتلاقي كل حاجة محتاج تعرفها عشان تتمرن صح.
          </p>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            {[
              { value: `${articles.length}`, label: "مقالات" },
              { value: "5", label: "HR Zones" },
              { value: "80%", label: "Zone 2 Training" },
              { value: "8-10h", label: "النوم المثالي" },
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
        </div>
      </section>

      {/* ══════════════════════════════════════
          BODY
      ══════════════════════════════════════ */}
      <div className="max-w-4xl mx-auto px-6 py-16 flex flex-col gap-20">

        {/* ─── LEARNING PATH ─── */}
        <section className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white">
              الـ Learning Path 🗺️
            </h2>
            <p className="text-sm text-zinc-500" dir="rtl">
              لو مش عارف تبدأ من فين، اتبع الترتيب ده
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {learningPath.map((step) => (
              <Link
                key={step.step}
                href={step.href}
                className={`border rounded-2xl p-5 flex items-center gap-5 hover:border-zinc-600 transition-all duration-200 group ${step.color.split(" ").slice(0, 2).join(" ")}`}
              >
                <span className={`text-3xl font-black shrink-0 ${step.color.split(" ")[2]}`}>
                  {step.step}
                </span>
                <div className="flex-1 flex flex-col gap-1">
                  <p className="font-black text-white text-sm uppercase tracking-wide group-hover:text-red-400 transition-colors duration-200" dir="rtl">
                    {step.title}
                  </p>
                  <p className="text-xs text-zinc-500" dir="rtl">
                    {step.desc}
                  </p>
                </div>
                <span className="text-xs text-zinc-500 group-hover:text-white transition-colors duration-200 shrink-0 hidden md:block">
                  {step.cta}
                </span>
              </Link>
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
              ابدأ بالمقالات دي، هي الأساس اللي كل حاجة تانية بتبني عليه
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featured.map((article) => (
              <Link
                key={article.href}
                href={article.href}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-6 flex flex-col gap-4 transition-all duration-200 group"
              >
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
                  <p className="font-black text-white text-sm uppercase tracking-wide leading-snug group-hover:text-red-400 transition-colors duration-200" dir="rtl">
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
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-black uppercase text-white">
                مقالات تانية 📚
              </h2>
            </div>

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
                    <p className="font-black text-white text-sm uppercase tracking-wide group-hover:text-red-400 transition-colors duration-200" dir="rtl">
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

        {/* ─── KEY CONCEPTS ─── */}
        <section className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white">
              المفاهيم الأساسية 🧠
            </h2>
            <p className="text-sm text-zinc-500" dir="rtl">
              المصطلحات اللي هتقابلها في كل مقال، افهمها من الأول
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {concepts.map((concept) => (
              <Link
                key={concept.title}
                href={concept.href}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-5 flex items-start gap-4 transition-all duration-200 group"
              >
                <span className="text-2xl shrink-0">{concept.icon}</span>
                <div className="flex flex-col gap-1">
                  <p className="font-black text-white text-sm uppercase tracking-wide group-hover:text-red-400 transition-colors duration-200">
                    {concept.title}
                  </p>
                  <p className="text-xs text-zinc-500 leading-relaxed" dir="rtl">
                    {concept.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── GARMIN TIE-IN ─── */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⌚</span>
            <div>
              <p className="font-black text-white uppercase tracking-wide" dir="rtl">
                تابع تدريبك بـ Garmin
              </p>
              <p className="text-xs text-zinc-500" dir="rtl">
                الـ Garmin Watches بتجيب الـ Data اللي في المقالات دي على معصمك
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { feature: "HR Zones", watch: "كل الـ Garmin Watches", icon: "📊" },
              { feature: "HRV Status", watch: "Forerunner 265 / 965", icon: "📈" },
              { feature: "Training Readiness", watch: "Forerunner 965 / Fenix 7", icon: "🎯" },
            ].map((item) => (
              <div
                key={item.feature}
                className="bg-zinc-800 rounded-xl p-3 flex items-center gap-3"
              >
                <span className="text-lg">{item.icon}</span>
                <div>
                  <p className="text-xs font-bold text-white">{item.feature}</p>
                  <p className="text-xs text-zinc-500" dir="rtl">{item.watch}</p>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/blog/gear-guide/best-gps-watches"
            className="self-start text-xs font-bold text-red-400 hover:text-red-300 uppercase tracking-wide transition-colors duration-200"
          >
            شوف أفضل GPS Watches →
          </Link>
        </section>

        {/* ─── CTA ─── */}
        <section className="bg-gradient-to-br from-red-600/20 to-zinc-900 border border-red-500/20 rounded-2xl p-8 flex flex-col gap-5 items-center text-center">
          <span className="text-4xl">🇪🇬</span>
          <h3 className="text-xl font-black uppercase text-white" dir="rtl">
            Pulse Gear Egypt: الـ Gear اللي يكمّل تدريبك
          </h3>
          <p className="text-zinc-400 text-sm max-w-md leading-relaxed" dir="rtl">
            Garmin Watches، Polar Heart Rate Monitors، وكل أدوات التدريب
            اللي بنتكلم عنها في المقالات دي، متاحة في Pulse Gear Egypt
            بأسعار مناسبة بالجنيه المصري. 💪
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/products"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wide transition-colors duration-200"
            >
              Browse Products
            </Link>
            <Link
              href="/blog/gear-guide/beginners-guide"
              className="border border-zinc-600 text-zinc-300 hover:border-white hover:text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wide transition-colors duration-200"
            >
              Beginner's Guide →
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
                href: "/blog/gear-guide",
                icon: "🎒",
                tag: "Gear Guide",
                title: "اختار الـ Gear الصح",
                desc: "دليل شامل لاختيار أفضل Gear لمستواك وميزانيتك.",
                color: "text-green-400",
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
                <p className="font-black text-white text-sm uppercase tracking-wide group-hover:text-red-400 transition-colors duration-200" dir="rtl">
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