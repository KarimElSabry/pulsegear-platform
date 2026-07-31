// src/app/blog/gear-guide/best-chest-straps/page.tsx

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "أفضل Chest Straps في 2026 | Pulse Gear Egypt",
  description:
    "مقارنة عملية لأفضل Heart Rate Chest Straps، من الاختيارات الاقتصادية إلى الخيارات المتقدمة، مع توضيح الفرق بين Polar وGarmin وWahoo.",
  keywords: [
    "best heart rate chest strap 2026",
    "best chest strap Egypt",
    "Polar H10 Egypt",
    "Polar H9 Egypt",
    "Garmin HRM Pro Plus Egypt",
    "Wahoo TICKR X",
    "heart rate monitor Egypt",
    "running gear Egypt",
    "Pulse Gear Egypt",
  ],
  openGraph: {
    title: "أفضل Chest Straps في 2026 | Pulse Gear Egypt",
    description:
      "دليل عملي لاختيار Heart Rate Chest Strap المناسب حسب احتياجك وميزانيتك.",
    type: "article",
  },
};

/* =========================================================
   DATA
========================================================= */

const straps = [
  {
    rank: 1,
    badge: "🥇 Best Overall",
    badgeColor:
      "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
    name: "Polar H10",
    tagline: "الخيار الأقوى لمن يريد دقة وموثوقية عالية",
    color: "border-yellow-500/30 bg-yellow-500/5",
    nameColor: "text-yellow-400",
    priceNote: "Premium option",
    specs: [
      { label: "Battery Life", value: "حتى 400 ساعة" },
      { label: "Connectivity", value: "Dual BLE + ANT+" },
      { label: "Waterproof", value: "IPX7، حتى 30 متر" },
      {
        label: "Memory",
        value: "يحفظ Session بدون الحاجة إلى Watch أثناء التسجيل",
      },
      {
        label: "Compatibility",
        value: "Garmin وPolar وWahoo وتطبيقات التدريب المتوافقة",
      },
    ],
    pros: [
      "دقة عالية جدًا في قياس Heart Rate",
      "يدعم Bluetooth وANT+",
      "يمكنه تسجيل Session بدون Watch متوافقة أثناء التمرين",
      "Soft Strap مريح للاستخدام أثناء الجري",
      "مناسب للـ Zone Training والـ Intervals والـ Endurance Training",
    ],
    cons: [
      "أعلى سعرًا من الخيارات الاقتصادية",
      "يحتاج إلى ترطيب منطقة الأقطاب قبل الاستخدام للحصول على أفضل اتصال",
      "لا يقدم Running Dynamics الخاصة بأنظمة Garmin",
    ],
    verdict:
      "لو أهم حاجة عندك هي جودة Heart Rate Data والاعتمادية، فالـ Polar H10 من أقوى الخيارات في الفئة. مناسب جدًا للـ runners اللي بدأوا يعتمدوا على Heart Rate Zones بشكل جاد.",
  },

  {
    rank: 2,
    badge: "🥈 Best for Garmin Users",
    badgeColor:
      "text-blue-400 bg-blue-400/10 border-blue-400/30",
    name: "Garmin HRM-Pro Plus",
    tagline: "للي عايز Heart Rate مع Running Dynamics",
    color: "border-blue-500/30 bg-blue-500/5",
    nameColor: "text-blue-400",
    priceNote: "Premium Garmin option",
    specs: [
      { label: "Battery Life", value: "حتى 500 ساعة" },
      { label: "Connectivity", value: "ANT+ + Bluetooth" },
      { label: "Waterproof", value: "IPX7" },
      {
        label: "Running Dynamics",
        value: "Cadence وGround Contact Time وStride Length وRunning Power",
      },
      {
        label: "Memory",
        value: "يمكنه تخزين بيانات التمرين بدون Watch",
      },
    ],
    pros: [
      "ممتاز لمستخدمي Garmin المتوافقين",
      "يدعم Running Dynamics",
      "يوفر Running Power بدون Footpod عند استخدام النظام المتوافق",
      "بطارية طويلة",
      "تكامل قوي مع Garmin Connect",
    ],
    cons: [
      "أغلى من الخيارات الأساسية",
      "بعض ميزات Running Dynamics تعتمد على وجود Garmin Watch متوافق",
      "لو كل احتياجك هو Heart Rate فقط، قد لا تحتاج كل هذه Features",
    ],
    verdict:
      "لو عندك Garmin Watch متوافق وعايز تستفيد من Running Dynamics، فالـ HRM-Pro Plus منطقي جدًا. أما لو هدفك الأساسي Heart Rate فقط، فممكن توفر وتختار Strap أبسط.",
  },

  {
    rank: 3,
    badge: "🥉 Best Value",
    badgeColor:
      "text-green-400 bg-green-400/10 border-green-400/30",
    name: "Wahoo TICKR X",
    tagline: "Features قوية بدون الوصول لسعر الفئة الأعلى",
    color: "border-green-500/30 bg-green-500/5",
    nameColor: "text-green-400",
    priceNote: "Value-focused option",
    specs: [
      { label: "Battery Life", value: "حتى 500 ساعة حسب المصدر الداخلي" },
      { label: "Connectivity", value: "Dual BLE + ANT+" },
      { label: "Waterproof", value: "IPX7" },
      { label: "Memory", value: "حتى 16 ساعة حسب بيانات المنتج" },
      {
        label: "Motion Data",
        value: "Cadence وReps وSteps",
      },
    ],
    pros: [
      "يدعم الاتصال بأكثر من جهاز",
      "ذاكرة داخلية كبيرة نسبيًا",
      "يوفر Motion Data إضافية",
      "مناسب للـ Running والـ Gym",
      "اختيار جيد لمن يريد Features أكثر من مجرد Heart Rate",
    ],
    cons: [
      "تجربة التطبيق ليست بالضرورة العامل الأقوى في الاختيار",
      "راحة الـ Strap قد تختلف من شخص لآخر",
      "لو هدفك فقط أعلى مستوى من Heart Rate Accuracy، توجد خيارات أقوى في القائمة",
    ],
    verdict:
      "لو عايز Chest Strap متعدد الاستخدامات ومش محتاج الدخول في فئة Garmin المتقدمة، فالـ TICKR X اختيار قوي خصوصًا لو هتستخدمه في Running وGym.",
  },

  {
    rank: 4,
    badge: "💰 Best Budget",
    badgeColor:
      "text-orange-400 bg-orange-400/10 border-orange-400/30",
    name: "Polar H9",
    tagline: "اختيار ممتاز لو عايز تبدأ بـ Heart Rate Training",
    color: "border-orange-500/30 bg-orange-500/5",
    nameColor: "text-orange-400",
    priceNote: "Budget-focused option",
    specs: [
      { label: "Battery Life", value: "حتى 400 ساعة" },
      { label: "Connectivity", value: "Bluetooth + ANT+" },
      { label: "Waterproof", value: "IPX7" },
      { label: "Memory", value: "لا توجد ذاكرة داخلية" },
      {
        label: "Compatibility",
        value: "يدعم العديد من الساعات والتطبيقات المتوافقة",
      },
    ],
    pros: [
      "قيمة قوية مقابل السعر",
      "مناسب جدًا للـ runners اللي بيبدأوا Heart Rate Training",
      "خفيف ومناسب للاستخدام اليومي",
      "يدعم Garmin وWahoo وتطبيقات التدريب المتوافقة",
      "أبسط من H10 لو مش محتاج كل الـ Features الإضافية",
    ],
    cons: [
      "لا توجد ذاكرة داخلية",
      "يحتاج إلى Watch أو Phone متوافق لتسجيل البيانات",
      "لا يقدم Running Dynamics المتقدمة",
    ],
    verdict:
      "لو أنت لسه بتبدأ وعايز تدخل عالم Heart Rate Training من غير ما تدفع في Features مش محتاجها، فالـ Polar H9 من الاختيارات المنطقية جدًا.",
  },
];

const quickPick = [
  {
    need: "عايز أقوى اختيار عام",
    pick: "Polar H10",
    icon: "🎯",
  },
  {
    need: "عندي Garmin وعايز Running Dynamics",
    pick: "Garmin HRM-Pro Plus",
    icon: "🏃",
  },
  {
    need: "عايز Features كثيرة وقيمة جيدة",
    pick: "Wahoo TICKR X",
    icon: "💡",
  },
  {
    need: "عايز تبدأ بأقل تكلفة ممكنة",
    pick: "Polar H9",
    icon: "💰",
  },
];

const decisionFactors = [
  {
    icon: "❤️",
    title: "Accuracy",
    description:
      "لو هدفك الأساسي هو Training by Heart Rate، جودة البيانات واستجابة الـ Sensor أهم من عدد الـ Features.",
  },
  {
    icon: "⌚",
    title: "Compatibility",
    description:
      "قبل الشراء، تأكد إن الـ Strap متوافق مع الـ Watch أو Training App اللي بتستخدمه.",
  },
  {
    icon: "📊",
    title: "Features",
    description:
      "لو محتاج Running Dynamics أو Memory أو Multi-device Connectivity، اختار Strap يوفر الوظائف دي فعلًا.",
  },
  {
    icon: "💰",
    title: "Budget",
    description:
      "مش لازم تشتري أغلى Strap. الاختيار الصح هو اللي يوفر البيانات اللي تحتاجها بدون دفع مقابل Features مش هتستخدمها.",
  },
];

const faqs = [
  {
    q: "هل أحتاج Chest Strap لو عندي Smartwatch؟",
    a: "لو استخدامك General Fitness، فالـ Optical Heart Rate في الـ Watch ممكن يكون كافي. لكن لو بتعمل Zone Training أو Intervals أو Marathon Training أو محتاج بيانات أكثر استجابة أثناء تغير شدة التمرين، فالـ Chest Strap ممكن يكون Upgrade مفيد.",
  },
  {
    q: "هل الـ Chest Strap يشتغل مع Garmin؟",
    a: "معظم الـ Straps المذكورة هنا تدعم طرق اتصال مثل Bluetooth وANT+. لكن التوافق النهائي يعتمد على موديل الـ Garmin والـ Features التي تريد استخدامها، لذلك يجب التأكد من مواصفات الجهازين قبل الشراء.",
  },
  {
    q: "هل الـ Polar H9 وH10 يشتغلوا مع أجهزة غير Polar؟",
    a: "نعم. قاعدة البيانات الداخلية تشير إلى أن H9 وH10 يدعمان Bluetooth وANT+، لذلك يمكن استخدامهما مع أجهزة وتطبيقات خارج منظومة Polar عندما يكون الجهاز الآخر متوافقًا.",
  },
  {
    q: "إيه الفرق الأساسي بين H9 وH10؟",
    a: "الـ H10 يضيف Features مثل الذاكرة الداخلية والاتصال المتعدد، بينما الـ H9 أبسط ومناسب لمن يريد Heart Rate Tracking بدون الحاجة إلى كل الإضافات.",
  },
  {
    q: "هل Chest Strap مناسب للمبتدئين؟",
    a: "نعم، ومش لازم تكون Professional Athlete. لو هدفك تتعلم تستخدم Heart Rate Zones وتفهم شدة تمرينك بشكل أفضل، ممكن يكون Chest Strap بداية مفيدة.",
  },
  {
    q: "هل كل Chest Straps مناسبة للسباحة؟",
    a: "لا. مقاومة المياه والـ Swimming Features تختلف من موديل لآخر. قاعدة البيانات الداخلية تشير إلى أن Polar H10 يمكنه تسجيل Heart Rate أثناء السباحة، بينما يجب التأكد من مواصفات أي Strap آخر قبل استخدامه في الماء.",
  },
  {
    q: "إيه أفضل Strap أبدأ بيه؟",
    a: "يعتمد على احتياجك. لو عايز خيار اقتصادي، Polar H9 مناسب. لو عايز Features أكثر وذاكرة داخلية، Polar H10 أقوى. ولو عندك Garmin وتهتم بـ Running Dynamics، فالـ Garmin HRM-Pro Plus يستحق النظر.",
  },
];

const relatedPosts = [
  {
    href: "/blog/gear-guide/best-gps-watches",
    emoji: "⌚",
    title: "أفضل GPS Watches في 2026",
    tag: "Gear Guide",
  },
  {
    href: "/blog/gear-review/heart-rate-strap-vs-optical",
    emoji: "⚡",
    title: "Chest Strap vs Optical HR",
    tag: "Gear Review",
  },
  {
    href: "/blog/training-guide/zone-2-training",
    emoji: "🫀",
    title: "Zone 2 Training",
    tag: "Training Guide",
  },
];

/* =========================================================
   COMPONENT
========================================================= */

export default function BestChestStrapsPage() {
  return (
    <main className="w-full bg-zinc-950 min-h-screen text-white">
      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="w-full border-b border-zinc-800 py-20 px-6">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          {/* Breadcrumb */}
          <div
            className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wide flex-wrap"
            dir="ltr"
          >
            <Link
              href="/"
              className="hover:text-white transition-colors duration-200"
            >
              Home
            </Link>

            <span>/</span>

            <Link
              href="/blog"
              className="hover:text-white transition-colors duration-200"
            >
              Blog
            </Link>

            <span>/</span>

            <Link
              href="/blog/gear-guide"
              className="hover:text-white transition-colors duration-200"
            >
              Gear Guide
            </Link>

            <span>/</span>

            <span className="text-zinc-400">
              Best Chest Straps
            </span>
          </div>

          {/* Labels */}
          <div
            className="flex items-center gap-3 flex-wrap"
            dir="ltr"
          >
            <span className="text-xs font-bold uppercase tracking-wide text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full">
              Gear Guide
            </span>

            <span className="text-xs font-bold uppercase tracking-wide text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full">
              Updated 2026
            </span>
          </div>

          {/* Title */}
          <h1
            className="text-4xl md:text-6xl font-black uppercase leading-tight"
            dir="ltr"
          >
            Best Chest Straps 🫀
            <br />

            <span
              className="text-red-500"
              dir="rtl"
            >
              أفضل Heart Rate Monitors للصدر
            </span>
          </h1>

          <p
            className="text-lg md:text-xl text-zinc-400 leading-relaxed max-w-3xl"
            dir="rtl"
          >
            لو بتدور على Chest Strap جديد، مش لازم تختار أغلى موديل.
            الاختيار الصح بيعتمد على الـ Accuracy والـ Compatibility
            والـ Features والميزانية.
            في الدليل ده هنقارن 4 اختيارات مختلفة ونوضح كل واحد مناسب لمين.
          </p>

          <div
            className="flex items-center gap-4 text-xs text-zinc-500 flex-wrap"
            dir="ltr"
          >
            <span>⏱ 7 min read</span>
            <span>•</span>
            <span>🫀 Gear Guide</span>
            <span>•</span>
            <span>Updated 2026</span>
          </div>

          {/* Trust Note */}
          <div className="bg-red-600/10 border border-red-500/20 rounded-2xl p-5 flex items-start gap-4">
            <span className="text-2xl shrink-0">
              🇪🇬
            </span>

            <div className="flex flex-col gap-2">
              <p
                className="text-sm font-bold text-white"
                dir="rtl"
              >
                قبل ما تشتري
              </p>

              <p
                className="text-xs text-zinc-400 leading-relaxed"
                dir="rtl"
              >
                الأسعار والتوفر ممكن يتغيروا، خصوصًا مع الاستيراد
                وتغير تكلفة الشراء. استخدم المقارنة دي لفهم الفرق بين
                الأجهزة، وبعدها راجع المنتجات المتاحة حاليًا على Pulse Gear.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          ARTICLE
      ===================================================== */}
      <article className="max-w-4xl mx-auto px-6 py-16 flex flex-col gap-16">
        {/* ===================================================
            QUICK PICK
        =================================================== */}
        <section className="flex flex-col gap-6">
          <div>
            <h2
              className="text-3xl font-black uppercase"
              dir="rtl"
            >
              اختار بسرعة ⚡
            </h2>

            <p
              className="text-sm text-zinc-500 mt-2"
              dir="rtl"
            >
              لو مش عايز تقرأ المقارنة كلها، ابدأ من هنا.
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4">
            {quickPick.map((item, index) => (
              <div
                key={item.need}
                className="flex items-center gap-4 border-b border-zinc-800 last:border-b-0 pb-4 last:pb-0"
              >
                <span className="text-xl shrink-0">
                  {item.icon}
                </span>

                <div
                  className="flex-1 flex flex-col gap-1"
                  dir="rtl"
                >
                  <p className="text-sm text-zinc-400">
                    {item.need}
                  </p>

                  <p className="font-black text-white">
                    {item.pick}
                  </p>
                </div>

                <span
                  className="text-xs text-zinc-600 shrink-0"
                  dir="ltr"
                >
                  #{index + 1}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ===================================================
            WHAT MATTERS
        =================================================== */}
        <section className="flex flex-col gap-6">
          <div>
            <h2
              className="text-2xl font-black uppercase"
              dir="rtl"
            >
              إيه اللي يهم فعلًا في الـ Chest Strap؟
            </h2>

            <p
              className="text-sm text-zinc-500 mt-2 leading-relaxed"
              dir="rtl"
            >
              متقارنش الأجهزة بعدد الـ Features فقط. اسأل نفسك إيه
              البيانات اللي محتاجها فعلًا في التدريب.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {decisionFactors.map((factor) => (
              <div
                key={factor.title}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3"
              >
                <span className="text-2xl">
                  {factor.icon}
                </span>

                <h3
                  className="font-black text-white"
                  dir="ltr"
                >
                  {factor.title}
                </h3>

                <p
                  className="text-sm text-zinc-500 leading-relaxed"
                  dir="rtl"
                >
                  {factor.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ===================================================
            COMPARISON
        =================================================== */}
        <section className="flex flex-col gap-8">
          <div>
            <h2
              className="text-3xl font-black uppercase"
              dir="rtl"
            >
              أفضل 4 Chest Straps
            </h2>

            <p
              className="text-sm text-zinc-500 mt-2"
              dir="rtl"
            >
              كل اختيار هنا مناسب لاحتياج مختلف.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {straps.map((strap) => (
              <section
                key={strap.name}
                className={`${strap.color} border rounded-3xl p-6 md:p-8 flex flex-col gap-6`}
              >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex flex-col gap-3">
                    <span
                      className={`self-start text-xs font-bold uppercase tracking-wide border px-3 py-1 rounded-full ${strap.badgeColor}`}
                      dir="ltr"
                    >
                      {strap.badge}
                    </span>

                    <div>
                      <p
                        className={`text-3xl md:text-4xl font-black ${strap.nameColor}`}
                        dir="ltr"
                      >
                        {strap.name}
                      </p>

                      <p
                        className="text-sm text-zinc-400 mt-1"
                        dir="rtl"
                      >
                        {strap.tagline}
                      </p>
                    </div>
                  </div>

                  <span
                    className="text-xs text-zinc-500 border border-zinc-800 bg-zinc-950/40 px-3 py-2 rounded-full self-start"
                    dir="ltr"
                  >
                    {strap.priceNote}
                  </span>
                </div>

                {/* Specs */}
                <div className="grid md:grid-cols-2 gap-3">
                  {strap.specs.map((spec) => (
                    <div
                      key={spec.label}
                      className="bg-zinc-950/40 border border-zinc-800/60 rounded-xl p-4"
                    >
                      <p
                        className="text-[10px] text-zinc-600 uppercase tracking-wide mb-1"
                        dir="ltr"
                      >
                        {spec.label}
                      </p>

                      <p
                        className="text-sm text-zinc-300 leading-relaxed"
                        dir="auto"
                      >
                        {spec.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Pros and Cons */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-5">
                    <p
                      className="text-xs font-bold uppercase tracking-wide text-green-400 mb-4"
                      dir="ltr"
                    >
                      Why Buy It
                    </p>

                    <div className="flex flex-col gap-3">
                      {strap.pros.map((pro) => (
                        <div
                          key={pro}
                          className="flex items-start gap-3"
                        >
                          <span className="text-green-400 text-xs mt-1 shrink-0">
                            ✓
                          </span>

                          <p
                            className="text-sm text-zinc-400 leading-relaxed"
                            dir="rtl"
                          >
                            {pro}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5">
                    <p
                      className="text-xs font-bold uppercase tracking-wide text-red-400 mb-4"
                      dir="ltr"
                    >
                      Things To Consider
                    </p>

                    <div className="flex flex-col gap-3">
                      {strap.cons.map((con) => (
                        <div
                          key={con}
                          className="flex items-start gap-3"
                        >
                          <span className="text-red-400 text-xs mt-1 shrink-0">
                            !
                          </span>

                          <p
                            className="text-sm text-zinc-400 leading-relaxed"
                            dir="rtl"
                          >
                            {con}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Verdict */}
                <div className="border-t border-zinc-800/70 pt-5">
                  <p
                    className="text-xs font-bold uppercase tracking-wide text-zinc-500 mb-2"
                    dir="ltr"
                  >
                    Our Take
                  </p>

                  <p
                    className="text-sm md:text-base text-zinc-300 leading-relaxed"
                    dir="rtl"
                  >
                    {strap.verdict}
                  </p>
                </div>
              </section>
            ))}
          </div>
        </section>

        {/* ===================================================
            SMARTWATCH QUESTION
        =================================================== */}
        <section className="flex flex-col gap-6">
          <div>
            <h2
              className="text-3xl font-black uppercase"
              dir="rtl"
            >
              طيب لو عندي Smartwatch بالفعل؟ ⌚
            </h2>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8">
            <p
              className="text-lg text-white font-bold leading-relaxed mb-4"
              dir="rtl"
            >
              مش معنى إنك عندك Smartwatch إنك لازم تشتري Chest Strap.
            </p>

            <p
              className="text-sm text-zinc-400 leading-relaxed"
              dir="rtl"
            >
              لو استخدامك General Fitness، فالـ Optical Heart Rate ممكن
              يكون كافي. لكن لما تدخل في Zone Training أو Intervals أو
              Marathon Preparation، سرعة واستقرار Heart Rate Data بيبقوا
              أهم، وهنا الـ Chest Strap ممكن يقدم قيمة أكبر.
            </p>

            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5">
                <p
                  className="font-bold text-white mb-2"
                  dir="ltr"
                >
                  Smartwatch may be enough
                </p>

                <p
                  className="text-sm text-zinc-500 leading-relaxed"
                  dir="rtl"
                >
                  General fitness، المشي، والجري السهل بدون اعتماد كبير
                  على Heart Rate Zones.
                </p>
              </div>

              <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5">
                <p
                  className="font-bold text-white mb-2"
                  dir="ltr"
                >
                  Chest Strap becomes more useful
                </p>

                <p
                  className="text-sm text-zinc-500 leading-relaxed"
                  dir="rtl"
                >
                  Intervals، HIIT، Zone Training، Marathon Preparation
                  والتمارين اللي فيها تغيرات سريعة في شدة المجهود.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            FAQ
        =================================================== */}
        <section className="flex flex-col gap-6">
          <div>
            <h2
              className="text-2xl font-black uppercase"
              dir="rtl"
            >
              الأسئلة الشائعة ❓
            </h2>

            <p
              className="text-sm text-zinc-500 mt-2"
              dir="rtl"
            >
              أهم الأسئلة اللي بتظهر قبل شراء Heart Rate Chest Strap.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 group"
              >
                <summary
                  className="cursor-pointer font-bold text-white list-none flex items-center justify-between gap-4"
                  dir="rtl"
                >
                  <span>{faq.q}</span>

                  <span className="text-zinc-500 group-open:text-red-400 transition-colors text-lg">
                    +
                  </span>
                </summary>

                <p
                  className="text-sm text-zinc-400 leading-relaxed mt-4 pt-4 border-t border-zinc-800"
                  dir="rtl"
                >
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* ===================================================
            CTA
        =================================================== */}
        <section className="bg-gradient-to-b from-red-600/10 to-transparent border border-red-500/20 rounded-3xl p-8 md:p-12 flex flex-col items-center text-center gap-5">
          <span className="text-4xl">
            🫀
          </span>

          <h2
            className="text-3xl md:text-4xl font-black text-white"
            dir="rtl"
          >
            لسه مش عارف تختار؟
          </h2>

          <p
            className="text-zinc-400 text-sm max-w-lg leading-relaxed"
            dir="rtl"
          >
            ابعتلنا نوع الـ Watch اللي بتستخدمها، نوع التمرين،
            وميزانيتك، وإحنا نساعدك تحدد أنسب Chest Strap ليك.
            ولو المنتج اللي بتدور عليه مش موجود حاليًا، تقدر تستخدم
            Request a Product ونشوف إمكانية توفيره.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/products"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wide transition-colors duration-200"
              dir="ltr"
            >
              Browse Products →
            </Link>

            <Link
              href="/request-product"
              className="border border-zinc-600 text-zinc-300 hover:border-white hover:text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wide transition-all duration-200"
              dir="ltr"
            >
              Request a Product
            </Link>
          </div>
        </section>

        {/* ===================================================
            RELATED
        =================================================== */}
        <section className="flex flex-col gap-6">
          <h2
            className="text-2xl font-black uppercase text-white"
            dir="rtl"
          >
            اقرأ كمان 📚
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedPosts.map((post) => (
              <Link
                key={post.href}
                href={post.href}
                className="group flex flex-col gap-3 bg-zinc-900 border border-zinc-800 hover:border-red-600 rounded-2xl p-5 transition-all duration-300"
              >
                <span className="text-3xl">
                  {post.emoji}
                </span>

                <span
                  className="text-xs font-bold uppercase tracking-wide text-red-500"
                  dir="ltr"
                >
                  {post.tag}
                </span>

                <h3
                  className="text-sm font-black text-white leading-tight group-hover:text-red-400 transition-colors duration-200"
                  dir="rtl"
                >
                  {post.title}
                </h3>

                <span
                  className="text-xs text-red-500 font-semibold"
                  dir="rtl"
                >
                  اقرأ المقال →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ===================================================
            BACK
        =================================================== */}
        <div className="flex justify-center pt-4">
          <Link
            href="/blog"
            className="border border-zinc-700 hover:border-white text-zinc-400 hover:text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wide transition-all duration-200"
            dir="ltr"
          >
            ← Back to Blog
          </Link>
        </div>
      </article>
    </main>
  );
}