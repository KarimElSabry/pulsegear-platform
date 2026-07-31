// src/app/blog/heart-rate-strap-vs-optical/page.tsx

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Heart Rate Strap vs Optical: أيهما أدق؟ | Pulse Gear Blog",
  description:
    "مقارنة تفصيلية بين الـ Chest Strap والـ Optical Heart Rate Monitor في الدقة والراحة وأيهما يناسبك.",
  openGraph: {
    title: "Heart Rate Strap vs Optical: أيهما أدق؟",
    description:
      "مقارنة تفصيلية بين الـ Chest Strap والـ Optical Heart Rate Monitor.",
    type: "article",
  },
};

const comparisonData = [
  {
    category: "Accuracy",
    icon: "🎯",
    strap: {
      rating: 5,
      note: "دقة طبية، بيقيس الـ Electrical Signal مباشرة من القلب. الأدق في السوق.",
    },
    optical: {
      rating: 3,
      note: "كويس في الحالات العادية بس بيغلط في الـ Intervals والـ Sprints.",
    },
    winner: "strap",
  },
  {
    category: "Comfort",
    icon: "😌",
    strap: {
      rating: 3,
      note: "محتاج تبلله قبل اللبس، ممكن يعمل احتكاك في الجلد بعد فترة.",
    },
    optical: {
      rating: 5,
      note: "زي الساعة العادية، مفيش إحساس بيه خالص طول اليوم.",
    },
    winner: "optical",
  },
  {
    category: "High Intensity Performance",
    icon: "⚡",
    strap: {
      rating: 5,
      note: "ممتاز في الـ HIIT والـ Sprints، بيتابع التغييرات السريعة فوراً.",
    },
    optical: {
      rating: 2,
      note: "بيتأخر في التسجيل، الـ Lag ممكن يوصل لـ 10–15 ثانية.",
    },
    winner: "strap",
  },
  {
    category: "Battery Life",
    icon: "🔋",
    strap: {
      rating: 5,
      note: "من 400 لـ 500 ساعة، بيستمر شهور من غير شحن.",
    },
    optical: {
      rating: 3,
      note: "من يوم لـ 7 أيام حسب الـ GPS والـ Features المفعّلة.",
    },
    winner: "strap",
  },
  {
    category: "Ease of Use",
    icon: "🔧",
    strap: {
      rating: 3,
      note: "محتاج تربطه صح وتبلله، خطوة إضافية قبل كل تمرين.",
    },
    optical: {
      rating: 5,
      note: "البسه وروح، مفيش إعداد أو تحضير.",
    },
    winner: "optical",
  },
  {
    category: "All-Day Tracking",
    icon: "📊",
    strap: {
      rating: 2,
      note: "مش مناسب للبس طول اليوم، صُمّم للتمرين بس.",
    },
    optical: {
      rating: 5,
      note: "ممتاز للـ 24/7 Tracking، HR والـ Sleep والـ HRV وكل حاجة.",
    },
    winner: "optical",
  },
];

const useCases = [
  {
    title: "اختار الـ Chest Strap لو...",
    icon: "💪",
    color: "border-blue-500/30 bg-blue-500/5",
    titleColor: "text-blue-400",
    cases: [
      "بتعمل HIIT أو Interval Training بجدية",
      "بتجري سباقات أو بتتدرب بـ Serious Level",
      "محتاج أدق قراءة ممكنة للـ HR",
      "عندك Arrhythmia أو مشاكل في القلب",
      "عايز Battery Life يستمر شهور",
    ],
  },
  {
    title: "اختار الـ Optical لو...",
    icon: "⌚",
    color: "border-purple-500/30 bg-purple-500/5",
    titleColor: "text-purple-400",
    cases: [
      "بتتمرن بشكل عام وغير متخصص",
      "عايز تتابع الـ HR والـ Sleep طول اليوم",
      "مش قادر تتحمل الـ Chest Strap",
      "بتعمل Yoga أو Pilates أو تمارين خفيفة",
      "عايز كل حاجة في جهاز واحد",
    ],
  },
];

const verdicts = [
  {
    icon: "🎯",
    text: "لو الدقة أهم حاجة ليك، Chest Strap بدون تفكير",
  },
  {
    icon: "😌",
    text: "لو الراحة والسهولة أهم، Optical Smartwatch",
  },
  {
    icon: "💪",
    text: "لو بتتدرب بجدية، Chest Strap للتمرين والـ Smartwatch لليوم كله",
  },
];

const relatedPosts = [
  {
    slug: "heart-rate-zones",
    emoji: "📊",
    title: "Heart Rate Zones: اتدرب بذكاء مش بتعب",
    tag: "Training Guide",
  },
  {
    slug: "zone-2-training",
    emoji: "🫀",
    title: "Zone 2 Training: سر الـ Elite Athletes",
    tag: "Training Guide",
  },
  {
    slug: "garmin-vs-polar",
    emoji: "🥊",
    title: "Garmin vs Polar: أنهي الأحسن ليك؟",
    tag: "Gear Review",
  },
];

function RatingDots({ rating, color }: { rating: number; color: string }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((dot) => (
        <div
          key={dot}
          className={`w-2.5 h-2.5 rounded-full transition-all ${
            dot <= rating ? color : "bg-zinc-700"
          }`}
        />
      ))}
    </div>
  );
}

export default function HeartRateStrapVsOpticalPage() {
  return (
    <main className="w-full bg-zinc-950 min-h-screen text-white">

      {/* ===== HERO ===== */}
      <section className="w-full border-b border-zinc-800 py-20 px-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wide">
            <Link href="/" className="hover:text-white transition-colors duration-200">
              Home
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-white transition-colors duration-200">
              Blog
            </Link>
            <span>/</span>
            <span className="text-zinc-400">Strap vs Optical</span>
          </div>

          {/* Tag */}
          <span className="self-start text-xs font-bold uppercase tracking-wide text-red-500 bg-red-500/10 px-3 py-1 rounded-full">
            Gear Review
          </span>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-black uppercase leading-tight">
            Chest Strap vs Optical ⚡
            <br />
            <span className="text-red-500">أيهما أدق وأنسب ليك؟</span>
          </h1>

          {/* ✅ dir="rtl" + no dashes */}
          <p className="text-lg text-zinc-400 leading-relaxed" dir="rtl">
            الـ Chest Strap أدق والـ Optical أسهل. بس الحقيقة مش بسيطة
            كده، الاختيار الصح بيعتمد على نوع تدريبك وأسلوب حياتك. 🎯
          </p>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span>⏱ 5 min read</span>
            <span>•</span>
            <span>⚡ Gear Review</span>
            <span>•</span>
            <span>Pulse Gear Egypt</span>
          </div>

        </div>
      </section>

      {/* ===== ARTICLE BODY ===== */}
      <article className="max-w-3xl mx-auto px-6 py-16 flex flex-col gap-16">

        {/* ===== HERO CARDS ===== */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 flex flex-col items-center gap-3 text-center">
            <span className="text-5xl">🫀</span>
            <p className="font-black uppercase text-blue-400 text-lg">Chest Strap</p>
            <p className="text-xs text-zinc-500">ECG-Level Accuracy</p>
            <div className="bg-zinc-900 rounded-xl p-3 w-full">
              <p className="text-xs text-zinc-500">بيقيس</p>
              <p className="text-sm font-bold text-white">Electrical Signal</p>
              <p className="text-xs text-zinc-500" dir="rtl">من القلب مباشرة</p>
            </div>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-6 flex flex-col items-center gap-3 text-center">
            <span className="text-5xl">⌚</span>
            <p className="font-black uppercase text-purple-400 text-lg">Optical Sensor</p>
            <p className="text-xs text-zinc-500">PPG Technology</p>
            <div className="bg-zinc-900 rounded-xl p-3 w-full">
              <p className="text-xs text-zinc-500">بيقيس</p>
              <p className="text-sm font-bold text-white">Blood Flow</p>
              <p className="text-xs text-zinc-500" dir="rtl">من الـ Wrist بالـ LED</p>
            </div>
          </div>
        </section>

        {/* ===== HOW THEY WORK ===== */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-black uppercase text-white">
            إزاي كل واحد بيشتغل؟ 🔬
          </h2>

          {/* Chest Strap */}
          <div className="bg-zinc-900 border border-blue-500/30 rounded-2xl p-6 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🫀</span>
              <div>
                <p className="font-black uppercase text-blue-400">Chest Strap</p>
                <p className="text-xs text-zinc-500">ECG / Electrocardiography</p>
              </div>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed" dir="rtl">
              الـ Chest Strap بيقيس الـ{" "}
              <span className="text-white font-bold">Electrical Signals</span>{" "}
              اللي القلب بيبعتها مع كل نبضة، نفس التقنية اللي بيستخدمها
              الأطباء في الـ ECG. ده بيديه دقة عالية جداً حتى في التمارين
              الشديدة لأنه مش بيتأثر بالحركة أو العرق.
            </p>
          </div>

          {/* Optical */}
          <div className="bg-zinc-900 border border-purple-500/30 rounded-2xl p-6 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">💡</span>
              <div>
                <p className="font-black uppercase text-purple-400">Optical Sensor</p>
                <p className="text-xs text-zinc-500">PPG / Photoplethysmography</p>
              </div>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed" dir="rtl">
              الـ Optical Sensor بيستخدم{" "}
              <span className="text-white font-bold">LED Light</span>{" "}
              بيضيء على الجلد ويقيس التغيير في الـ Blood Flow مع كل نبضة.
              الطريقة دي كويسة في الحالات العادية بس بتتأثر بالحركة والعرق
              ولون الجلد.
            </p>
          </div>
        </section>

        {/* ===== COMPARISON TABLE ===== */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-black uppercase text-white">
            المقارنة التفصيلية 📊
          </h2>

          <div className="flex flex-col gap-4">
            {comparisonData.map((row) => (
              <div
                key={row.category}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
              >
                {/* Row Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{row.icon}</span>
                    <p className="font-black uppercase text-white text-sm">
                      {row.category}
                    </p>
                  </div>
                  {row.winner === "strap" ? (
                    <span className="text-xs font-bold uppercase tracking-wide text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full">
                      ✅ Chest Strap يكسب
                    </span>
                  ) : (
                    <span className="text-xs font-bold uppercase tracking-wide text-purple-400 bg-purple-400/10 px-3 py-1 rounded-full">
                      ✅ Optical يكسب
                    </span>
                  )}
                </div>

                {/* Row Body */}
                <div className="grid grid-cols-1 md:grid-cols-2">
                  {/* Strap Side */}
                  <div
                    className={`p-5 flex flex-col gap-3 border-b md:border-b-0 md:border-l border-zinc-800 ${
                      row.winner === "strap" ? "bg-blue-500/5" : ""
                    }`}
                  >
                    <p className="text-xs font-bold uppercase tracking-wide text-blue-400">
                      🫀 Chest Strap
                    </p>
                    <RatingDots rating={row.strap.rating} color="bg-blue-500" />
                    <p className="text-sm text-zinc-400 leading-relaxed" dir="rtl">
                      {row.strap.note}
                    </p>
                  </div>

                  {/* Optical Side */}
                  <div
                    className={`p-5 flex flex-col gap-3 ${
                      row.winner === "optical" ? "bg-purple-500/5" : ""
                    }`}
                  >
                    <p className="text-xs font-bold uppercase tracking-wide text-purple-400">
                      ⌚ Optical
                    </p>
                    <RatingDots rating={row.optical.rating} color="bg-purple-500" />
                    <p className="text-sm text-zinc-400 leading-relaxed" dir="rtl">
                      {row.optical.note}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== SCORE SUMMARY ===== */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-black uppercase text-white">
            النتيجة الإجمالية 🏆
          </h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6">

            {/* Chest Strap Score */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🫀</span>
                  <p className="font-black uppercase text-blue-400">Chest Strap</p>
                </div>
                <span className="text-2xl font-black text-blue-400">4 / 6</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-blue-500 transition-all"
                  style={{ width: "67%" }}
                />
              </div>
              <p className="text-xs text-zinc-500" dir="rtl">
                يكسب في: Accuracy والـ High Intensity والـ Battery Life والـ Price
              </p>
            </div>

            <div className="border-t border-zinc-800" />

            {/* Optical Score */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⌚</span>
                  <p className="font-black uppercase text-purple-400">Optical Sensor</p>
                </div>
                <span className="text-2xl font-black text-purple-400">2 / 6</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-purple-500 transition-all"
                  style={{ width: "33%" }}
                />
              </div>
              <p className="text-xs text-zinc-500" dir="rtl">
                يكسب في: Comfort والـ Ease of Use والـ All-Day Tracking
              </p>
            </div>

          </div>
        </section>

        {/* ===== WHO SHOULD BUY ===== */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-black uppercase text-white">
            أيهما يناسبك؟ 🤔
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {useCases.map((uc) => (
              <div
                key={uc.title}
                className={`border rounded-2xl p-6 flex flex-col gap-4 ${uc.color}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{uc.icon}</span>
                  <h3 className={`text-sm font-black uppercase ${uc.titleColor}`} dir="rtl">
                    {uc.title}
                  </h3>
                </div>
                <div className="flex flex-col gap-3">
                  {uc.cases.map((c, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-green-400 text-sm shrink-0 mt-0.5">✓</span>
                      <p className="text-sm text-zinc-300 leading-relaxed" dir="rtl">{c}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== PRO TIP ===== */}
        <section className="bg-zinc-900 border border-yellow-500/30 rounded-2xl p-6 flex items-start gap-4">
          <span className="text-3xl shrink-0">💡</span>
          <div className="flex flex-col gap-2">
            <p className="font-black uppercase text-yellow-400 text-sm">
              Pro Tip: استخدم الاتنين مع بعض!
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed" dir="rtl">
              كتير من الـ Athletes المحترفين بيلبسوا الـ Chest Strap في
              التمارين الشديدة للدقة والـ Smartwatch في باقي اليوم لمتابعة
              الـ HR والـ Recovery. الـ Garmin والـ Polar بيدعموا الاتنين مع
              بعض في نفس الوقت، بيبعت الـ Chest Strap Data للـ Watch
              مباشرة عن طريق الـ Bluetooth.
            </p>
          </div>
        </section>

        {/* ===== FINAL VERDICT ===== */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-black uppercase text-white">
            الحكم النهائي ⚖️
          </h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4">
            {verdicts.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 border-b border-zinc-800 last:border-b-0 pb-4 last:pb-0"
              >
                <span className="text-2xl shrink-0">{item.icon}</span>
                <p className="text-zinc-300 leading-relaxed text-sm" dir="rtl">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="bg-gradient-to-br from-red-600/20 to-zinc-900 border border-red-500/20 rounded-2xl p-8 flex flex-col gap-4 items-center text-center">
          <span className="text-4xl">🛒</span>
          <h3 className="text-xl font-black uppercase text-white" dir="auto">
            جاهز تختار الـ Monitor المناسب ليك؟
          </h3>
          <p className="text-zinc-400 text-sm max-w-md leading-relaxed" dir="rtl">
            شوف مجموعتنا الكاملة من الـ Chest Straps والـ GPS Watches،
            كلها مختارة بعناية للـ Serious Athletes في مصر.
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
                <span className="text-xs text-red-500 font-semibold" dir="auto">
                  اقرأ المقال →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ===== BACK ===== */}
        <div className="flex justify-center pt-4">
          <Link
            href="/blog"
            className="border border-zinc-700 hover:border-white text-zinc-400 hover:text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wide transition-all duration-200"
          dir="auto">
            → Back to Blog
          </Link>
        </div>

      </article>
    </main>
  );
}