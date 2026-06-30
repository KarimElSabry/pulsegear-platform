import Link from "next/link";

const brands = [
  {
    name: "Garmin",
    slug: "garmin",
    description:
      "Industry-leading GPS running watches and heart rate monitors trusted by athletes worldwide.",
    tags: ["Running Watches", "Heart Rate Monitors"],
  },
  {
    name: "Polar",
    slug: "polar",
    description:
      "Pioneers in heart rate technology with premium sports watches and chest straps.",
    tags: ["Running Watches", "Heart Rate Monitors"],
  },
  {
    name: "Wahoo",
    slug: "wahoo",
    description:
      "Smart heart rate monitors built for serious runners and endurance athletes.",
    tags: ["Heart Rate Monitors"],
  },
  {
    name: "Magene",
    slug: "magene",
    description:
      "Reliable and affordable heart rate chest straps with professional-grade accuracy.",
    tags: ["Heart Rate Monitors"],
  },
  {
    name: "CooSpo",
    slug: "coospo",
    description:
      "Budget-friendly heart rate monitors without compromising on performance.",
    tags: ["Heart Rate Monitors"],
  },
  {
    name: "Moofit",
    slug: "moofit",
    description:
      "Compact and lightweight heart rate sensors designed for everyday training.",
    tags: ["Heart Rate Monitors"],
  },
];

export default function BrandsPage() {
  return (
    <main className="min-h-screen bg-[#111111] text-white px-6 py-16">

      {/* Header */}
      <div className="max-w-5xl mx-auto mb-12">
        <h1 className="text-4xl font-bold text-white">Brands</h1>
        <p className="mt-3 text-gray-400 text-lg">
          We carry the most trusted names in running and endurance sports.
        </p>
      </div>

      {/* Brands Grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {brands.map((brand) => (
          <div
            key={brand.slug}
            className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-white/30 transition-all duration-200"
          >
            {/* Brand Name */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-3">
                {brand.name}
              </h2>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {brand.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium bg-white/10 text-gray-300 px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p className="text-gray-400 text-sm leading-relaxed">
                {brand.description}
              </p>
            </div>

            {/* CTA Button */}
            <Link
              href={`/products?brand=${brand.name}`}
              className="mt-6 inline-block text-center bg-white text-black text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-200 transition-colors duration-200"
            >
              Shop {brand.name}
            </Link>
          </div>
        ))}
      </div>

    </main>
  );
}