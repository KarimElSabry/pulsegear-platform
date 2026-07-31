// src/app/blog/zone-2-training/page.tsx

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Zone 2 Training: سر الـ Elite Athletes | Pulse Gear Blog",
  description:
    "ليه الـ Elite Athletes بيقضوا 80% من تدريبهم في الـ Zone 2 وإزاي تعمل زيهم.",
  openGraph: {
    title: "Zone 2 Training: سر الـ Elite Athletes",
    description:
      "ليه الـ Elite Athletes بيقضوا 80% من تدريبهم في الـ Zone 2 وإزاي تعمل زيهم.",
    type: "article",
  },
};

const benefits = [
  {
    icon: "🔥",
    title: "Fat Burning",
    desc: "جسمك بيعتمد على الدهون كـ Fuel الأساسي في الـ Zone 2 مش الكربوهيدرات. ده بيخليك أكفأ على المسافات الطويلة.",
  },
  {
    icon: "❤️",
    title: "Cardiac Output",
    desc: "بيكبّر حجم الـ Left Ventricle وبيضخ دم أكتر في كل نبضة، يعني قلبك بيشتغل أذكى مش أصعب.",
  },
  {
    icon: "⚡",
    title: "Mitochondria Density",
    desc: "بتزيد عدد وكفاءة الـ Mitochondria في خلاياك، محطات الطاقة اللي بتحولك من Runner عادي لـ Machine.",
  },
  {
    icon: "🏃",
    title: "Lactate Clearance",
    desc: "جسمك بيتعلم يتخلص من الـ Lactic Acid أسرع، يعني تتعب أبطأ وتقدر تستمر أطول.",
  },
  {
    icon: "🛡️",
    title: "Faster Recovery",
    desc: "بيقلل الـ Inflammation ويسرع الـ Recovery بين الـ Sessions، يعني تقدر تتدرب أكتر.",
  },
  {
    icon: "📈",
    title: "VO2 Max Improvement",
    desc: "الـ Aerobic Base القوي هو الأساس اللي بيرفع الـ VO2 Max على المدى البعيد مش الـ Intervals بس.",
  },
];

const athletes = [
  {
    name: "Eliud Kipchoge",
    sport: "Marathon Runner 🏃",
    zone2: "80%",
    fact: "أسرع راجل في تاريخ الـ Marathon، 80% من تدريبه Zone 2 هادي.",
  },
  {
    name: "Tadej Pogačar",
    sport: "Pro Cyclist 🚴",
    zone2: "75%",
    fact: "بطل Tour de France، بيقضي معظم وقت التدريب في Zone 2.",
  },
  {
    name: "Kristian Blummenfelt",
    sport: "Olympic Triathlete 🏊",
    zone2: "85%",
    fact: "بطل Olympic Triathlon، معروف بـ Zone 2 Volume العالي جداً.",
  },
];

const weekPlan = [
  { day: "الاثنين", session: "Zone 2 Run", duration: "45 دقيقة", type: "easy" },
  { day: "الثلاثاء", session: "Rest أو Zone 1 Walk", duration: "30 دقيقة", type: "rest" },
  { day: "الأربعاء", session: "Zone 2 Cycling", duration: "60 دقيقة", type: "easy" },
  { day: "الخميس", session: "Zone 4 Intervals", duration: "30 دقيقة", type: "hard" },
  { day: "الجمعة", session: "Zone 2 Run", duration: "45 دقيقة", type: "easy" },
  { day: "السبت", session: "Long Zone 2 Run", duration: "90 دقيقة", type: "easy" },
  { day: "الأحد", session: "Complete Rest", duration: "يوم راحة", type: "rest" },
];

const talkTest = [
  { icon: "🎵", test: "تقدر تغني؟", result: "Zone 1 — سهل أوي، زود السرعة شوية", color: "text-green-400" },
  { icon: "💬", test: "تقدر تتكلم جمل كاملة؟", result: "✅ Zone 2 — ده المكان الصح!", color: "text-blue-400" },
  { icon: "😤", test: "بتتكلم كلمتين بس؟", result: "Zone 3–4 — تقيل أوي، هدّي", color: "text-orange-400" },
  { icon: "😵", test: "مش قادر تتكلم خالص؟", result: "Zone 5 — أقصى مجهود", color: "text-red-400" },
];

const relatedPosts = [
  {
    slug: "heart-rate-zones",
    emoji: "📊",
    title: "Heart Rate Zones: اتدرب بذكاء مش بتعب",
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

export default function Zone2TrainingPage() {
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
            <span className="text-zinc-400">Zone 2 Training</span>
          </div>

          {/* Tag */}
          <span className="self-start text-xs font-bold uppercase tracking-wide text-red-500 bg-red-500/10 px-3 py-1 rounded-full">
            Training Guide
          </span>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-black uppercase leading-tight">
            Zone 2 Training 🤫
            <br />
            <span className="text-red-500">سر الـ Elite Athletes</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-zinc-400 leading-relaxed" dir="rtl">
            لو شايف إن التدريب الصح لازم يكون مؤلم وصعب، إنت غلطان.
            الـ Zone 2 هو أهم Zone في تدريبك وهو الأبطأ والأسهل.
            وده مش رأيي، ده العلم. 🧬
          </p>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span>⏱ 6 min read</span>
            <span>•</span>
            <span>🏃 Training Guide</span>
            <span>•</span>
            <span>Pulse Gear Egypt</span>
          </div>

        </div>
      </section>

      {/* ===== ARTICLE BODY ===== */}
      <article className="max-w-3xl mx-auto px-6 py-16 flex flex-col gap-16">

        {/* ===== WHAT IS ZONE 2 ===== */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-black uppercase text-white">
            إيه هو الـ Zone 2 بالظبط؟ 🎯
          </h2>
          <p className="text-zinc-400 leading-relaxed" dir="rtl">
            الـ Zone 2 هو التدريب اللي بيحصل عند{" "}
            <span className="text-white font-bold">60–70% من الـ Max HR</span> بتاعك.
            ده المجهود اللي تقدر تتكلم فيه جمل كاملة بدون ما تلهث،
            يعني مريح بس مش سهل أوي.
          </p>

          {/* Talk Test */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="text-base font-black uppercase text-white">
              🗣️ الـ Talk Test — أسهل طريقة تعرف إنك في الـ Zone 2
            </h3>
            <div className="flex flex-col gap-3">
              {talkTest.map((item) => (
                <div key={item.test} className="flex items-start gap-4 bg-zinc-800 rounded-xl p-4">
                  <span className="text-xl shrink-0">{item.icon}</span>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-bold text-white" dir="rtl">{item.test}</p>
                    <p className={`text-sm ${item.color}`} dir="rtl">{item.result}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== 80/20 VISUAL ===== */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-black uppercase text-white">
            قاعدة الـ 80/20 📊
          </h2>
          <p className="text-zinc-400 leading-relaxed" dir="rtl">
            الـ Elite Athletes مش بيتدربوا بشدة كل يوم، بيوزعوا تدريبهم كده:
          </p>

          {/* Visual Bar */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex rounded-xl overflow-hidden h-14">
              <div
                className="bg-blue-500 flex items-center justify-center text-sm font-black text-white"
                style={{ width: "80%" }}
              >
                80% — Zone 1 & 2
              </div>
              <div
                className="bg-red-500 flex items-center justify-center text-sm font-black text-white"
                style={{ width: "20%" }}
              >
                20%
              </div>
            </div>
            <div className="flex justify-between text-xs text-zinc-400">
              <span>🔵 Easy & Aerobic Training</span>
              <span>🔴 Hard & Intense Training</span>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed" dir="rtl">
              💡 معظم الناس بتعمل العكس، بتتدرب بشدة كل يوم وبتتساءل ليه مش بتتحسن.
            </p>
          </div>
        </section>

        {/* ===== BENEFITS ===== */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-black uppercase text-white">
            ليه الـ Zone 2 مهم جداً؟ 💪
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{b.icon}</span>
                  <h3 className="text-sm font-black uppercase text-white">{b.title}</h3>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed" dir="rtl">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== ELITE ATHLETES ===== */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-black uppercase text-white">
            الـ Elite Athletes اللي بيثبتوا الكلام ده 🏆
          </h2>
          <div className="flex flex-col gap-4">
            {athletes.map((a) => (
              <div
                key={a.name}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-4"
              >
                <div className="flex-1 flex flex-col gap-1">
                  <p className="text-lg font-black uppercase text-white">{a.name}</p>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">{a.sport}</p>
                  <p className="text-sm text-zinc-400 leading-relaxed mt-2" dir="rtl">{a.fact}</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl px-6 py-4 text-center shrink-0">
                  <p className="text-3xl font-black text-red-400">{a.zone2}</p>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">Zone 2</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== COMMON MISTAKE ===== */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-black uppercase text-white">
            الغلطة اللي كلنا بنعملها 😅
          </h2>

          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl">❌</span>
              <div className="flex flex-col gap-2">
                <p className="font-black uppercase text-red-400">
                  الـ "Grey Zone" Trap — الـ Zone 3
                </p>
                <p className="text-sm text-zinc-400 leading-relaxed" dir="rtl">
                  معظم الناس بتتدرب في الـ Zone 3 طول الوقت، مش سهل ومش صعب.
                  ده بيخليك تتعب من غير ما تاخد الفايدة الكاملة من الـ Zone 2 أو الـ Zone 4.
                  بتدفع تمن التعب من غير ما تاخد الـ Adaptation.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-3">
            <p className="text-sm font-black uppercase text-white">✅ الحل الصح</p>
            <div className="flex rounded-xl overflow-hidden h-10">
              <div
                className="bg-blue-500/80 flex items-center justify-center text-xs font-bold text-white"
                style={{ width: "80%" }}
              >
                Zone 2 — 80%
              </div>
              <div
                className="bg-red-500/80 flex items-center justify-center text-xs font-bold text-white"
                style={{ width: "20%" }}
              >
                Zone 4–5
              </div>
            </div>
            <p className="text-sm text-zinc-400" dir="rtl">
              💡 اعمل الـ Easy Days سهلة فعلاً، واعمل الـ Hard Days صعبة فعلاً.
            </p>
          </div>
        </section>

        {/* ===== WEEKLY PLAN ===== */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-black uppercase text-white">
            خطة أسبوعية مقترحة للمبتدئين 📅
          </h2>
          <div className="flex flex-col gap-3">
            {weekPlan.map((day) => (
              <div
                key={day.day}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-wrap items-center gap-4"
              >
                <p className="font-black text-white w-24 shrink-0">{day.day}</p>
                <p className="text-zinc-300 font-semibold flex-1" dir="rtl">{day.session}</p>
                <p className="text-xs text-zinc-500">{day.duration}</p>
                <span
                  className={`text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full ${
                    day.type === "hard"
                      ? "bg-red-500/10 text-red-400"
                      : day.type === "rest"
                      ? "bg-zinc-800 text-zinc-500"
                      : "bg-blue-500/10 text-blue-400"
                  }`}
                >
                  {day.type === "hard" ? "Intense" : day.type === "rest" ? "Rest" : "Easy"}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-zinc-600" dir="rtl">
            ⚠️ ده مجرد مثال. اضبط الـ Volume على حسب مستواك الحالي.
          </p>
        </section>

        {/* ===== CTA ===== */}
        <section className="bg-gradient-to-br from-red-600/20 to-zinc-900 border border-red-500/20 rounded-2xl p-8 flex flex-col gap-4 items-center text-center">
          <span className="text-4xl">⌚</span>
          <h3 className="text-xl font-black uppercase text-white">
            عايز تتأكد إنك في الـ Zone 2 الصح؟
          </h3>
          <p className="text-zinc-400 text-sm max-w-md leading-relaxed" dir="rtl">
            محتاج Heart Rate Monitor دقيق عشان تتدرب في الـ Zone الصح.
            شوف مجموعتنا من الـ Chest Straps والـ GPS Watches.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/products"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wide transition-colors duration-200"
            >
              Browse Heart Rate Monitors
            </Link>
          </div>
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
                <h3 className="text-sm font-black uppercase text-white leading-tight group-hover:text-red-400 transition-colors duration-200" dir="rtl">
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