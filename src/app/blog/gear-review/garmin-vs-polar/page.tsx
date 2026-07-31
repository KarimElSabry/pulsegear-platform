// src/app/blog/garmin-vs-polar/page.tsx

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Garmin vs Polar: أنهي الأحسن ليك؟ | Pulse Gear Blog",
  description:
    "مقارنة شاملة بين Garmin و Polar في الدقة والـ Features والـ Battery Life وأنهي يناسب نوع تدريبك.",
  openGraph: {
    title: "Garmin vs Polar: أنهي الأحسن ليك؟",
    description:
      "مقارنة شاملة بين Garmin و Polar في الدقة والـ Features وأنهي يناسب نوع تدريبك.",
    type: "article",
  },
};

const comparisonRows = [
  {
    category: "GPS Accuracy",
    icon: "📡",
    garmin: "Multi-Band GPS، الأدق في السوق حتى في الأماكن المغلقة والمدن الكبيرة. بيـ Lock على الـ Signal بسرعة جداً.",
    polar: "دقيق جداً وكويس بس بياخد وقت أطول شوية في الـ Signal Lock مقارنةً بـ Garmin.",
    winner: "garmin",
  },
  {
    category: "Heart Rate Accuracy",
    icon: "🫀",
    garmin: "الـ Optical HR كويس جداً وموثوق بس Polar لسه أدق منه في الـ Wrist-Based HR.",
    polar: "الأفضل في الـ Optical HR على الـ Wrist، تقنية PrecisionPrime بتديك دقة قريبة من الـ Chest Strap.",
    winner: "polar",
  },
  {
    category: "Training Features",
    icon: "💪",
    garmin: "Training Readiness والـ HRV Status والـ Race Predictor والـ Daily Suggested Workouts، أكتر Features في السوق بفرق كبير.",
    polar: "Running Program والـ Nightly Recharge والـ FitSpark Workout Guidance، ممتازة ومفيدة بس أقل عمقاً من Garmin.",
    winner: "garmin",
  },
  {
    category: "Battery Life",
    icon: "🔋",
    garmin: "الـ Battery Life من أحسن حاجة في Garmin، الـ GPS Mode بيديك من 20 لـ 150 ساعة أو أكتر حسب الموديل.",
    polar: "كويس ومحترم بس مش بنفس مستوى Garmin في الـ High-End Models.",
    winner: "garmin",
  },
  {
    category: "App & Ecosystem",
    icon: "📱",
    garmin: "Garmin Connect، الأغنى في الـ Data والـ Analytics. Third-Party Integration ممتاز مع Strava وTrainingPeaks وغيرهم.",
    polar: "Polar Flow، نظيفة وسهلة الاستخدام بس الـ Data أقل عمقاً وتفصيلاً من Garmin Connect.",
    winner: "garmin",
  },
  {
    category: "Design & Comfort",
    icon: "😌",
    garmin: "تصميم رياضي قوي ومتين، بعض الـ High-End Models زي الـ Fenix تقيلة شوية على المعصم.",
    polar: "أخف وأريح بشكل عام، مناسب للبس اليومي والتدريب بنفس الراحة.",
    winner: "polar",
  },
  {
    category: "Value for Money",
    icon: "💰",
    garmin: "الـ Features اللي بتاخدها مقابل السعر ممتازة خصوصاً في الـ Mid-Range Models زي الـ Forerunner Series.",
    polar: "الـ Mid-Range Models بتديك HR دقيق جداً بسعر أقل، Value كويسة لو الـ HR هو أهم حاجة عندك.",
    winner: "tie",
  },
];

const whoShouldBuy = [
  {
    brand: "Garmin",
    emoji: "⚡",
    color: "blue",
    profiles: [
      { icon: "🏃", text: "لو بتتدرب بجدية وعايز أعمق Training Data في السوق" },
      { icon: "📡", text: "لو الـ GPS Accuracy هي أهم حاجة عندك" },
      { icon: "🔋", text: "لو بتعمل Ultra Races أو Long Distance وعايز Battery تصحبك" },
      { icon: "📱", text: "لو عايز Ecosystem غني مع Strava وTrainingPeaks" },
      { icon: "🏅", text: "لو بتستعد لـ Marathon أو Triathlon وعايز كل الـ Tools" },
    ],
  },
  {
    brand: "Polar",
    emoji: "🫀",
    color: "red",
    profiles: [
      { icon: "🫀", text: "لو الـ Heart Rate Accuracy هي أهم حاجة عندك" },
      { icon: "😌", text: "لو عايز Watch خفيفة ومريحة في اليومي والتدريب" },
      { icon: "💡", text: "لو مبتدئ وعايز Watch تعلمك تتدرب صح من الأول" },
      { icon: "😴", text: "لو الـ Sleep Tracking والـ Recovery مهمين ليك" },
      { icon: "💰", text: "لو عايز HR دقيق جداً بـ Budget أقل من الـ Garmin المقابل" },
    ],
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
    slug: "heart-rate-strap-vs-optical",
    emoji: "⚡",
    title: "Heart Rate Strap vs Optical: أيهما أدق؟",
    tag: "Gear Review",
  },
];

export default function GarminVsPolarPage() {
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
            <span className="text-zinc-400">Garmin vs Polar</span>
          </div>

          {/* Tag */}
          <span className="self-start text-xs font-bold uppercase tracking-wide text-red-500 bg-red-500/10 px-3 py-1 rounded-full">
            Gear Review
          </span>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-black uppercase leading-tight">
            Garmin vs Polar 🥊
            <br />
            <span className="text-red-500">أنهي الأحسن ليك؟</span>
          </h1>

          {/* ✅ dir="rtl" + no dashes */}
          <p className="text-lg text-zinc-400 leading-relaxed" dir="rtl">
            Garmin والـ Polar، الاتنين Brands عملاقة في عالم الـ Running Watches.
            بس الفرق بينهم مش بس في الشكل أو السعر،
            كل واحد فيهم بيخدم نوع معين من الـ Runners.
            خليني أوريك الفرق الحقيقي عشان تختار صح. 🎯
          </p>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span>⏱ 7 min read</span>
            <span>•</span>
            <span>🏃 Gear Review</span>
            <span>•</span>
            <span>Pulse Gear Egypt</span>
          </div>

        </div>
      </section>

      {/* ===== ARTICLE BODY ===== */}
      <article className="max-w-3xl mx-auto px-6 py-16 flex flex-col gap-16">

        {/* ===== INTRO ===== */}
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-black uppercase text-white">
            الصراع الحقيقي 🥊
          </h2>
          <p className="text-zinc-400 leading-relaxed" dir="rtl">
            لو بتدور على Running Watch وضيّعت ساعات في المقارنات على الإنترنت،
            أنت مش لوحدك. Garmin والـ Polar من أكتر الـ Brands اللي بتتسأل عنهم
            وكلاهما بيستاهل كل جنيه فيه.
          </p>
          <p className="text-zinc-400 leading-relaxed" dir="rtl">
            بس الحقيقة؟ مفيش واحد فيهم أحسن بشكل مطلق.
            كل واحد فيهم بيتفوق في حاجات معينة،
            والاختيار الصح بيعتمد على{" "}
            <span className="text-white font-semibold">أنت عايز إيه بالظبط</span>.
          </p>
        </section>

        {/* ===== COMPARISON TABLE ===== */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-black uppercase text-white">
            المقارنة التفصيلية 📊
          </h2>
          <p className="text-zinc-400 leading-relaxed" dir="rtl">
            خلينا نقارن الاتنين في كل Category مهمة، وفي الآخر نشوف مين فاز. 👇
          </p>

          <div className="flex flex-col gap-4">
            {comparisonRows.map((row) => (
              <div
                key={row.category}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4"
              >
                {/* Category Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{row.icon}</span>
                    <h3 className="text-base font-black uppercase text-white">
                      {row.category}
                    </h3>
                  </div>
                  {row.winner === "garmin" && (
                    <span className="text-xs font-bold uppercase tracking-wide text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full">
                      ✅ Garmin يكسب
                    </span>
                  )}
                  {row.winner === "polar" && (
                    <span className="text-xs font-bold uppercase tracking-wide text-red-400 bg-red-400/10 px-3 py-1 rounded-full">
                      ✅ Polar يكسب
                    </span>
                  )}
                  {row.winner === "tie" && (
                    <span className="text-xs font-bold uppercase tracking-wide text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full">
                      🤝 تعادل
                    </span>
                  )}
                </div>

                {/* Garmin vs Polar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className={`rounded-xl p-4 flex flex-col gap-2 border ${row.winner === "garmin" ? "border-blue-500/30 bg-blue-500/5" : "border-zinc-700 bg-zinc-800/50"}`}>
                    <span className="text-xs font-bold uppercase tracking-wide text-blue-400">
                      ⚡ Garmin
                    </span>
                    <p className="text-sm text-zinc-300 leading-relaxed" dir="rtl">
                      {row.garmin}
                    </p>
                  </div>
                  <div className={`rounded-xl p-4 flex flex-col gap-2 border ${row.winner === "polar" ? "border-red-500/30 bg-red-500/5" : "border-zinc-700 bg-zinc-800/50"}`}>
                    <span className="text-xs font-bold uppercase tracking-wide text-red-400">
                      🫀 Polar
                    </span>
                    <p className="text-sm text-zinc-300 leading-relaxed" dir="rtl">
                      {row.polar}
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
            النتيجة النهائية 🏆
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {/* Garmin Score */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 flex flex-col items-center gap-3 text-center">
              <span className="text-4xl">⚡</span>
              <span className="text-lg font-black uppercase text-blue-400">Garmin</span>
              <div className="flex flex-col gap-1">
                <span className="text-4xl font-black text-white">4</span>
                <span className="text-xs text-zinc-400 uppercase tracking-wide">Categories Won</span>
              </div>
              <div className="flex flex-col gap-1 text-xs text-zinc-400 text-right w-full">
                <span>✅ GPS Accuracy</span>
                <span>✅ Training Features</span>
                <span>✅ Battery Life</span>
                <span>✅ App & Ecosystem</span>
              </div>
            </div>

            {/* Polar Score */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 flex flex-col items-center gap-3 text-center">
              <span className="text-4xl">🫀</span>
              <span className="text-lg font-black uppercase text-red-400">Polar</span>
              <div className="flex flex-col gap-1">
                <span className="text-4xl font-black text-white">2</span>
                <span className="text-xs text-zinc-400 uppercase tracking-wide">Categories Won</span>
              </div>
              <div className="flex flex-col gap-1 text-xs text-zinc-400 text-right w-full">
                <span>✅ Heart Rate Accuracy</span>
                <span>✅ Design & Comfort</span>
                <span>🤝 Value for Money</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-3">
            <p className="text-zinc-400 leading-relaxed text-sm" dir="rtl">
              <span className="text-white font-bold">الـ Numbers مش بتحكي الحكاية كلها.</span>{" "}
              Garmin فاز في عدد أكبر من الـ Categories،
              بس لو الـ Heart Rate Accuracy هي أهم حاجة عندك،
              Polar هيديك حاجة مش هتلاقيها في أي Watch تانية بنفس المستوى.
            </p>
          </div>
        </section>

        {/* ===== WHO SHOULD BUY ===== */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-black uppercase text-white">
            مين يشتري إيه؟ 🎯
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {whoShouldBuy.map((brand) => (
              <div
                key={brand.brand}
                className={`rounded-2xl p-6 flex flex-col gap-4 border ${
                  brand.color === "blue"
                    ? "bg-blue-500/5 border-blue-500/20"
                    : "bg-red-500/5 border-red-500/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{brand.emoji}</span>
                  <h3 className={`text-lg font-black uppercase ${
                    brand.color === "blue" ? "text-blue-400" : "text-red-400"
                  }`} dir="rtl">
                    اشتري {brand.brand} لو...
                  </h3>
                </div>
                <div className="flex flex-col gap-3">
                  {brand.profiles.map((p, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-lg shrink-0">{p.icon}</span>
                      <p className="text-sm text-zinc-300 leading-relaxed" dir="rtl">
                        {p.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== FINAL VERDICT ===== */}
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-black uppercase text-white">
            الكلام الأخير 🎤
          </h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col gap-4">
            <p className="text-zinc-300 leading-relaxed" dir="rtl">
              لو سألتني بصراحة؟{" "}
              <span className="text-white font-bold">Garmin هو الـ Default Choice</span>{" "}
              لأغلب الـ Runners، الـ Ecosystem الغني والـ GPS الدقيق والـ Training Features
              العميقة بتخليه الأنسب لأي حد بيتدرب بجدية.
            </p>
            <p className="text-zinc-300 leading-relaxed" dir="rtl">
              بس لو أنت شخص بيهتم بالـ Heart Rate فوق أي حاجة تانية،
              أو عايز Watch خفيفة ومريحة في اليومي،{" "}
              <span className="text-white font-bold">Polar هيبهرك</span>{" "}
              بدقة الـ HR وخفة الـ Design.
            </p>
            <p className="text-zinc-300 leading-relaxed" dir="rtl">
              في الآخر الاتنين Watches عملاقة، والغلط الوحيد هو إنك تختار
              بناءً على الـ Brand اسمه مش على احتياجاتك الحقيقية. 🎯
            </p>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="bg-gradient-to-br from-red-600/20 to-zinc-900 border border-red-500/20 rounded-2xl p-8 flex flex-col gap-4 items-center text-center">
          <span className="text-4xl">🏃</span>
          <h3 className="text-xl font-black uppercase text-white">
            عايز Garmin أو Polar؟
          </h3>
          <p className="text-zinc-400 text-sm max-w-md leading-relaxed" dir="rtl">
            عندنا في Pulse Gear مجموعة مختارة من الـ Running Watches،
            كلها أصلية 100% ومتاحة للشحن لأي مكان في مصر.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            <Link
              href="/products"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wide transition-colors duration-200"
            >
              Browse Running Watches
            </Link>
            <Link
              href="/request-product"
              className="border border-zinc-600 text-zinc-300 hover:border-white hover:text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wide transition-colors duration-200"
            >
              Request a Specific Model
            </Link>
          </div>
        </section>

        {/* ===== RELATED POSTS ===== */}
        <section className="flex flex-col gap-6">
          <h2 className="text-xl font-black uppercase text-white">
            اقرأ كمان 📚
          </h2>
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

        {/* ===== BACK TO BLOG ===== */}
        <div className="flex justify-center pt-4">
          <Link
            href="/blog"
            className="border border-zinc-700 hover:border-white text-zinc-400 hover:text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wide transition-all duration-200"
          >
            → Back to Blog
          </Link>
        </div>

      </article>
    </main>
  );
}