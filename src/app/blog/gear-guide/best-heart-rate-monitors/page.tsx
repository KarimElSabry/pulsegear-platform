// src/app/blog/gear-guide/best-heart-rate-monitors/page.tsx

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Best Heart Rate Monitors 2026 | Pulse Gear Egypt Blog",
  description:
    "دليل Pulse Gear Egypt لاختيار Heart Rate Monitor مناسب ليك. مقارنة بين Chest Straps وأجهزة قياس ضربات القلب حسب الدقة، الاستخدام، التوافق والميزانية.",
  keywords: [
    "heart rate monitor Egypt",
    "heart rate strap Egypt",
    "chest strap Egypt",
    "Polar H9 Egypt",
    "Polar H10 Egypt",
    "Garmin HRM Egypt",
    "Wahoo heart rate monitor",
    "Magene heart rate monitor",
    "running gear Egypt",
    "Pulse Gear Egypt",
  ],
  openGraph: {
    title: "Best Heart Rate Monitors 2026 | Pulse Gear Egypt",
    description:
      "إزاي تختار Heart Rate Monitor مناسب ليك؟ مقارنة عملية بين Chest Straps وأجهزة قياس ضربات القلب.",
    type: "article",
  },
};

const chestStraps = [
  {
    rank: 1,
    name: "Polar H10",
    badge: "Best Overall",
    badgeColor:
      "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
    color: "border-yellow-500/30 bg-yellow-500/5",
    price: "حوالي 9,000 EGP",
    connectivity: "Bluetooth + ANT+",
    battery: "حوالي 400 ساعة",
    memory: "نعم",
    waterproof: "نعم",
    compatibility: "Garmin / Polar / Apps",
    pros: [
      "دقة ممتازة للـ Heart Rate Training",
      "ذاكرة داخلية لتسجيل التمرين",
      "يدعم Bluetooth وANT+",
      "مناسب للـ Running والـ Cycling والـ HIIT",
    ],
    cons: [
      "أغلى من الـ Entry-Level Straps",
      "مش كل المستخدمين محتاجين كل الـ Features الموجودة فيه",
    ],
    verdict:
      "اختيار قوي للعدائين والـ Athletes اللي عايزين بيانات Heart Rate موثوقة ويستخدموا التدريب بالـ Zones بشكل جاد.",
  },
  {
    rank: 2,
    name: "Garmin HRM-Pro Plus",
    badge: "Best for Garmin Users",
    badgeColor:
      "text-blue-400 bg-blue-400/10 border-blue-400/30",
    color: "border-blue-500/30 bg-blue-500/5",
    price: "Premium",
    connectivity: "Bluetooth + ANT+",
    battery: "بطارية طويلة",
    memory: "نعم",
    waterproof: "نعم",
    compatibility: "Garmin Ecosystem",
    pros: [
      "مناسب جدًا لمستخدمي Garmin",
      "يدعم Running Dynamics مع الأجهزة المتوافقة",
      "يدعم تخزين بيانات التمرين",
      "مفيد للعدائين الجادين",
    ],
    cons: [
      "السعر أعلى من الـ Entry-Level Straps",
      "جزء من قيمته يظهر مع Garmin Ecosystem",
    ],
    verdict:
      "لو عندك Garmin Watch بالفعل وعايز تستفيد من الـ Ecosystem بشكل أكبر، ده اختيار منطقي.",
  },
  {
    rank: 3,
    name: "Wahoo TRACKR HR",
    badge: "Best Rechargeable Option",
    badgeColor:
      "text-green-400 bg-green-400/10 border-green-400/30",
    color: "border-green-500/30 bg-green-500/5",
    price: "حوالي 8,500 EGP",
    connectivity: "Bluetooth + ANT+",
    battery: "100+ ساعة",
    memory: "حسب الاستخدام",
    waterproof: "مقاوم للماء",
    compatibility: "Wahoo / Garmin / Apps",
    pros: [
      "بطارية قابلة لإعادة الشحن",
      "مناسب للـ Running والـ Cycling",
      "يدعم Bluetooth وANT+",
      "اختيار جيد لو مش عايز بطاريات تقليدية",
    ],
    cons: [
      "أقل انتشارًا من Polar وGarmin",
      "اختيار الـ Ecosystem مهم قبل الشراء",
    ],
    verdict:
      "اختيار مناسب لو أهم حاجة عندك هي الراحة وإعادة الشحن بدل تغيير البطارية.",
  },
  {
    rank: 4,
    name: "Polar H9",
    badge: "Best Entry Level",
    badgeColor:
      "text-orange-400 bg-orange-400/10 border-orange-400/30",
    color: "border-orange-500/30 bg-orange-500/5",
    price: "حوالي 7,500 EGP",
    connectivity: "Bluetooth + ANT+",
    battery: "حوالي 400 ساعة",
    memory: "لا",
    waterproof: "نعم",
    compatibility: "Garmin / Polar / Apps",
    pros: [
      "بداية ممتازة لدخول عالم Chest Straps",
      "دقة مناسبة جدًا للتدريب بالـ Heart Rate",
      "Bluetooth وANT+",
      "مناسب للمبتدئين والعدائين اللي مش محتاجين Memory",
    ],
    cons: [
      "لا توجد ذاكرة داخلية",
      "يحتاج جهازًا متصلًا أثناء التمرين لتسجيل البيانات",
    ],
    verdict:
      "لو أول مرة تجرب Chest Strap ومش محتاج Features متقدمة، الـ H9 نقطة بداية قوية.",
  },
];

const quickPicks = [
  {
    need: "عايز أفضل اختيار شامل",
    pick: "Polar H10",
    reason: "دقة + Memory + توافق واسع",
  },
  {
    need: "عندي Garmin Watch",
    pick: "Garmin HRM-Pro Plus",
    reason: "تكامل قوي مع Garmin",
  },
  {
    need: "عايز Rechargeable Strap",
    pick: "Wahoo TRACKR HR",
    reason: "بطارية قابلة لإعادة الشحن",
  },
  {
    need: "أول مرة أشتري Chest Strap",
    pick: "Polar H9",
    reason: "بداية قوية بدون Features زائدة",
  },
];

const faqs = [
  {
    q: "هل أحتاج Heart Rate Strap لو عندي Smartwatch؟",
    a: "مش بالضرورة. لو استخدامك Fitness عام أو Easy Runs، الـ Optical HR في الساعة ممكن يكون كافي. لكن لو بتتمرن باستخدام Heart Rate Zones أو بتعمل Intervals وHIIT أو بتحضر لسباق، الـ Chest Strap بيديك قراءة أسرع وأكثر ثباتًا خصوصًا أثناء تغير شدة التمرين.",
  },
  {
    q: "ليه Chest Strap أدق من الـ Optical HR؟",
    a: "الـ Smartwatch بتستخدم Optical Sensors لقياس تدفق الدم من خلال الجلد، بينما الـ Chest Strap يقيس النشاط الكهربائي للقلب. ده بيخلي الـ Chest Strap مناسب جدًا للحالات اللي فيها Heart Rate بيتغير بسرعة زي Intervals وSprints.",
  },
  {
    q: "هل Polar H9 يشتغل مع Garmin؟",
    a: "الـ Polar H9 بيدعم Bluetooth وANT+، وبالتالي يمكن استخدامه مع أجهزة وتطبيقات متوافقة. لكن لازم تتأكد من Compatibility الخاصة بموديل Garmin بتاعك قبل الشراء.",
  },
  {
    q: "هل Polar H10 مناسب للـ Cycling؟",
    a: "أيوه. الـ Chest Straps مناسبة جدًا للـ Running والـ Cycling والـ HIIT لأنها بتوفر Heart Rate Data مستمرة أثناء التمرين.",
  },
  {
    q: "هل Chest Strap مناسب للمبتدئين؟",
    a: "أيوه، لكن مش لازم تشتري أغلى موديل. لو لسه بتبدأ ومحتاج فقط بيانات Heart Rate موثوقة، Entry-Level Strap زي Polar H9 ممكن يكون كافي جدًا.",
  },
  {
    q: "هل أحتاج Chest Strap لو أنا بجري مرتين أو ثلاثة في الأسبوع؟",
    a: "مش بالضرورة. لو هدفك مجرد الحركة واللياقة العامة، ممكن تبدأ بالـ Watch أو Phone الموجود عندك. الـ Chest Strap يصبح أكثر فائدة لما تبدأ تستخدم Heart Rate Zones أو Structured Training.",
  },
  {
    q: "إيه أهم حاجة أركز عليها قبل شراء Chest Strap؟",
    a: "ركز على ثلاثة أشياء: Compatibility مع ساعتك أو الـ App، طريقة الاتصال Bluetooth أو ANT+، والـ Features اللي تحتاجها فعلًا مثل Memory أو Running Dynamics أو Rechargeable Battery.",
  },
  {
    q: "أقدر أطلب موديل مش موجود على الموقع؟",
    a: "أيوه. Pulse Gear عنده Product Request functionality، فتقدر تبعت الموديل اللي بتدور عليه وإحنا نشوف إمكانية توفيره ليك.",
  },
];

export default function BestHeartRateMonitorsPage() {
  return (
    <main className="w-full bg-zinc-950 min-h-screen text-white">
      {/* HERO */}
      <section className="w-full border-b border-zinc-800 py-20 px-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wide flex-wrap">
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
              Best Heart Rate Monitors
            </span>
          </div>

          <span className="self-start text-xs font-bold uppercase tracking-wide text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full">
            Gear Guide 2026
          </span>

          <h1 className="text-4xl md:text-5xl font-black uppercase leading-tight">
            Best Heart Rate Monitors
            <br />
            <span className="text-red-500">
              How to Choose the Right One
            </span>
          </h1>

          <p
            className="text-lg text-zinc-400 leading-relaxed"
            dir="auto"
          >
            مش كل Runner محتاج أغلى Heart Rate Monitor في السوق.
            المهم تعرف أنت محتاج إيه فعلًا، وهل الـ Chest Strap
            هيفرق في تدريبك ولا الـ Watch الموجودة عندك كفاية.
          </p>

          <div className="flex items-center gap-4 text-xs text-zinc-500 flex-wrap">
            <span>8 min read</span>
            <span>•</span>
            <span>Gear Guide</span>
            <span>•</span>
            <span>Updated 2026</span>
          </div>

          {/* Main Insight */}
          <div className="bg-red-600/10 border border-red-500/20 rounded-2xl p-5 flex flex-col gap-2">
            <p className="text-sm font-bold text-red-400" dir="auto">
              أهم سؤال قبل ما تشتري
            </p>

            <p
              className="text-sm text-zinc-300 leading-relaxed"
              dir="auto"
            >
              هل أنت محتاج Accuracy أعلى لأنك بتتدرب بالـ Heart Rate
              Zones، ولا أنت لسه في مرحلة إنك تبني عادة الجري؟
              لو الإجابة الثانية، مش لازم تشتري Gear غالي من البداية.
            </p>
          </div>

          {/* Pulse Gear Banner */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-start gap-3">
            <span className="text-2xl shrink-0">🇪🇬</span>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-bold text-white" dir="auto">
                Pulse Gear Egypt
              </p>

              <p
                className="text-xs text-zinc-400 leading-relaxed"
                dir="auto"
              >
                بنساعد العدائين في مصر يختاروا Training Gear مناسب
                لمستواهم وميزانيتهم، مع إمكانية طلب منتجات مش موجودة
                حاليًا على الموقع.
              </p>
            </div>
          </div>

          {/* Table of Contents */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
              Table of Contents
            </p>

            {[
              {
                href: "#why-heart-rate",
                label: "ليه Heart Rate Monitoring مهم؟",
              },
              {
                href: "#chest-straps",
                label: "Best Chest Straps",
              },
              {
                href: "#quick-picks",
                label: "اختار بسرعة",
              },
              {
                href: "#how-to-choose",
                label: "إزاي تختار؟",
              },
              {
                href: "#faq",
                label: "الأسئلة الشائعة",
              },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors duration-200 group"
              >
                <span className="w-1 h-1 rounded-full bg-zinc-600 group-hover:bg-red-500 transition-colors duration-200 shrink-0" />
                <span dir="auto">{item.label}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ARTICLE */}
      <article className="max-w-3xl mx-auto px-6 py-16 flex flex-col gap-20">
        {/* WHY HEART RATE */}
        <section
          id="why-heart-rate"
          className="flex flex-col gap-6"
        >
          <h2 className="text-2xl font-black uppercase text-white" dir="auto">
            ليه Heart Rate Monitoring مهم؟ ❤️
          </h2>

          <div className="flex flex-col gap-5">
            <p
              className="text-zinc-400 leading-relaxed"
              dir="auto"
            >
              واحدة من أكبر مشاكل العدائين هي إنهم أحيانًا بيجروا
              الـ Easy Runs أسرع من اللازم، أو مش عارفين إذا كانوا
              فعلًا في الـ Zone المطلوبة.
            </p>

            <p
              className="text-zinc-400 leading-relaxed"
              dir="auto"
            >
              Heart Rate Monitoring بيساعدك تحول التدريب من مجرد
              إحساس بالجهد إلى بيانات تقدر تعتمد عليها.
            </p>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <p
                className="text-sm text-zinc-300 leading-relaxed"
                dir="auto"
              >
                الفكرة مش إنك تشتري جهاز عشان تجمع أرقام أكتر.
                الفكرة إن البيانات تساعدك تعرف إمتى تزود شدة التمرين
                وإمتى تهدي وتحافظ على الـ Recovery.
              </p>
            </div>
          </div>
        </section>

        {/* CHEST STRAPS */}
        <section
          id="chest-straps"
          className="flex flex-col gap-8"
        >
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black uppercase text-white">
              Best Chest Straps
            </h2>

            <p
              className="text-sm text-zinc-500"
              dir="auto"
            >
              أفضل الاختيارات لو هدفك Heart Rate Training أكثر دقة
              واتصال موثوق.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {chestStraps.map((strap) => (
              <div
                key={strap.name}
                className={`border rounded-2xl overflow-hidden ${strap.color}`}
              >
                {/* HEADER */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-black text-zinc-600">
                      #{strap.rank}
                    </span>

                    <div className="flex flex-col gap-2">
                      <p className="font-black uppercase text-white text-lg">
                        {strap.name}
                      </p>

                      <span
                        className={`self-start text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-full border ${strap.badgeColor}`}
                      >
                        {strap.badge}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xl md:text-2xl font-black text-white">
                      {strap.price}
                    </p>

                    <p
                      className="text-xs text-zinc-500"
                      dir="auto"
                    >
                      السعر استرشادي ويتغير حسب التوفر
                    </p>
                  </div>
                </div>

                {/* SPECS */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-zinc-800">
                  {[
                    {
                      label: "Connectivity",
                      value: strap.connectivity,
                    },
                    {
                      label: "Battery",
                      value: strap.battery,
                    },
                    {
                      label: "Memory",
                      value: strap.memory,
                    },
                    {
                      label: "Waterproof",
                      value: strap.waterproof,
                    },
                    {
                      label: "Compatibility",
                      value: strap.compatibility,
                    },
                  ].map((spec) => (
                    <div
                      key={spec.label}
                      className="bg-zinc-950 p-4 flex flex-col gap-1"
                    >
                      <p className="text-xs text-zinc-500 uppercase tracking-wide">
                        {spec.label}
                      </p>

                      <p
                        className="text-sm font-bold text-white"
                        dir="auto"
                      >
                        {spec.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* PROS CONS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                  <div className="flex flex-col gap-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-green-400">
                      Pros
                    </p>

                    {strap.pros.map((pro, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2"
                      >
                        <span className="text-green-400 text-xs mt-1 shrink-0">
                          +
                        </span>

                        <p
                          className="text-xs text-zinc-400 leading-relaxed"
                          dir="auto"
                        >
                          {pro}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-red-400">
                      Cons
                    </p>

                    {strap.cons.map((con, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2"
                      >
                        <span className="text-red-400 text-xs mt-1 shrink-0">
                          -
                        </span>

                        <p
                          className="text-xs text-zinc-400 leading-relaxed"
                          dir="auto"
                        >
                          {con}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* VERDICT */}
                <div className="px-6 pb-6">
                  <div className="bg-zinc-900 rounded-xl p-5 flex items-start gap-3">
                    <span className="text-lg shrink-0">⚡</span>

                    <p
                      className="text-sm text-zinc-300 leading-relaxed"
                      dir="auto"
                    >
                      <span className="font-bold text-white">
                        الحكم:
                      </span>{" "}
                      {strap.verdict}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* QUICK PICKS */}
        <section
          id="quick-picks"
          className="flex flex-col gap-6"
        >
          <h2 className="text-2xl font-black uppercase text-white">
            اختار بسرعة 🚀
          </h2>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 bg-zinc-800 px-5 py-3 gap-2">
              <p
                className="text-xs font-bold uppercase tracking-wide text-zinc-400"
                dir="auto"
              >
                احتياجك
              </p>

              <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
                الاختيار
              </p>

              <p
                className="text-xs font-bold uppercase tracking-wide text-zinc-400"
                dir="auto"
              >
                السبب
              </p>
            </div>

            {quickPicks.map((row, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-3 px-5 py-4 border-t border-zinc-800 hover:bg-zinc-800/50 transition-colors gap-2"
              >
                <p
                  className="text-sm text-zinc-400"
                  dir="auto"
                >
                  {row.need}
                </p>

                <p className="text-sm font-bold text-white">
                  {row.pick}
                </p>

                <p
                  className="text-sm text-red-400"
                  dir="auto"
                >
                  {row.reason}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* HOW TO CHOOSE */}
        <section
          id="how-to-choose"
          className="flex flex-col gap-6"
        >
          <h2 className="text-2xl font-black uppercase text-white" dir="auto">
            إزاي تختار الـ Heart Rate Monitor الصح؟ 🎯
          </h2>

          <div className="flex flex-col gap-4">
            {[
              {
                icon: "🌱",
                title: "لو أنت Beginner",
                body:
                  "ابدأ بالأساسيات. لو عندك Watch بالفعل، استخدمها الأول. لو بدأت تهتم بالـ Heart Rate Zones، Entry-Level Chest Strap ممكن يكون أول Upgrade منطقي.",
              },
              {
                icon: "❤️",
                title: "لو هدفك Zone Training",
                body:
                  "اختيار Chest Strap موثوق هيكون أكثر منطقية لأنك بتعتمد على Heart Rate Data أثناء التدريب بدل الاعتماد على الإحساس فقط.",
              },
              {
                icon: "🏃",
                title: "لو بتتمرن Intervals أو HIIT",
                body:
                  "الـ Rapid Changes في Heart Rate هي واحدة من الحالات اللي Chest Strap فيها يكون مفيد جدًا مقارنة بالـ Wrist Optical Sensors.",
              },
              {
                icon: "🚴",
                title: "لو بتعمل Cycling",
                body:
                  "ركز على Compatibility مع الـ Bike Computer أو الـ Training App اللي بتستخدمه، وتأكد إن الـ Strap يدعم Bluetooth أو ANT+ المطلوب.",
              },
              {
                icon: "⌚",
                title: "لو عندك Garmin",
                body:
                  "لو أنت بالفعل داخل Garmin Ecosystem، اختار Strap يحقق أكبر استفادة من الـ Features المتاحة على ساعتك.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-start gap-4"
              >
                <span className="text-2xl shrink-0">
                  {item.icon}
                </span>

                <div className="flex flex-col gap-2">
                  <p
                    className="font-bold text-white text-sm"
                    dir="auto"
                  >
                    {item.title}
                  </p>

                  <p
                    className="text-xs text-zinc-400 leading-relaxed"
                    dir="auto"
                  >
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CUSTOMER PROBLEM */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4">
          <h2 className="text-xl font-black text-white">
            هل فعلًا محتاج Chest Strap؟
          </h2>

          <p
            className="text-sm text-zinc-400 leading-relaxed"
            dir="auto"
          >
            لو لسه بتسأل السؤال ده، متشتريش على طول.
            جرّب الأول تفهم طريقة تدريبك، وهل أنت بتستخدم Heart Rate
            Zones فعلًا، وهل الـ Optical Sensor الموجود عندك بيحقق
            احتياجاتك.
          </p>

          <p
            className="text-sm text-zinc-400 leading-relaxed"
            dir="auto"
          >
            الهدف من الـ Gear مش إنك تجمع أجهزة أكتر.
            الهدف إن الجهاز يساعدك تتدرب بشكل أذكى.
          </p>
        </section>

        {/* FAQ */}
        <section
          id="faq"
          className="flex flex-col gap-6"
        >
          <h2 className="text-2xl font-black uppercase text-white">
            الأسئلة الشائعة ❓
          </h2>

          <div className="flex flex-col gap-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3"
              >
                <p
                  className="font-bold text-white text-sm"
                  dir="auto"
                >
                  س: {faq.q}
                </p>

                <p
                  className="text-xs text-zinc-400 leading-relaxed border-t border-zinc-800 pt-3"
                  dir="auto"
                >
                  <span className="text-red-400 font-bold">
                    ج:
                  </span>{" "}
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-red-600/20 to-zinc-900 border border-red-500/20 rounded-2xl p-8 flex flex-col gap-5 items-center text-center">

          <h3
            className="text-xl font-black uppercase text-white"
            dir="auto"
          >
            اختار الـ Gear اللي يخدم تدريبك
          </h3>

          <p
            className="text-zinc-400 text-sm max-w-md leading-relaxed"
            dir="auto"
          >
            مش متأكد أنهي Heart Rate Monitor مناسب ليك؟
            شوف المنتجات المتاحة أو ابعتلنا الموديل اللي بتدور عليه.
            تقدر كمان تطلب Product مش موجود حاليًا على الموقع.
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

        {/* RELATED ARTICLES */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-black uppercase text-white">
            اقرأ كمان 📚
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                href: "/blog/gear-guide/beginners-guide",
                icon: "🌱",
                tag: "Gear Guide",
                title: "Beginner's Gear Guide",
              },
              {
                href: "/blog/gear-guide/best-chest-straps",
                icon: "❤️",
                tag: "Gear Guide",
                title: "Best Chest Straps",
              },
              {
                href: "/blog/training-guide/heart-rate-zones",
                icon: "📊",
                tag: "Training Guide",
                title: "Heart Rate Zones Explained",
              },
            ].map((article) => (
              <Link
                key={article.href}
                href={article.href}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-5 flex flex-col gap-3 transition-colors duration-200 group"
              >
                <span className="text-2xl">
                  {article.icon}
                </span>

                <p className="text-xs font-bold uppercase tracking-wide text-red-400">
                  {article.tag}
                </p>

                <p
                  className="font-bold text-white text-sm group-hover:text-red-400 transition-colors duration-200"
                  dir="auto"
                >
                  {article.title}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* BACK */}
        <div className="flex justify-center pt-4">
          <Link
            href="/blog/gear-guide"
            className="border border-zinc-700 hover:border-white text-zinc-400 hover:text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wide transition-all duration-200"
          >
            ← Back to Gear Guides
          </Link>
        </div>
      </article>
    </main>
  );
}