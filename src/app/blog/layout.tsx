// src/app/blog/layout.tsx

import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = "https://pulsegear-platform.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "Blog | Pulse Gear",
    template: "%s | Pulse Gear Blog",
  },
  description:
    "Training tips, gear reviews, and heart rate guides from Pulse Gear Egypt.",
  keywords: [
    "heart rate monitor",
    "running gear Egypt",
    "GPS watch Egypt",
    "Pulse Gear Egypt",
    "training tips",
    "gear reviews",
    "heart rate zones",
    "chest strap",
    "Garmin Egypt",
    "Polar Egypt",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    siteName: "Pulse Gear",
    type: "website",
    url: `${SITE_URL}/blog`,
    images: [
      {
        url: `${SITE_URL}/og-blog.jpg`,
        width: 1200,
        height: 630,
        alt: "Pulse Gear Egypt Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Pulse Gear",
    description:
      "Training tips, gear reviews, and heart rate guides from Pulse Gear Egypt.",
    images: [`${SITE_URL}/og-blog.jpg`],
  },
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
};

const categories = [
  {
    href: "/blog",
    label: "All",
  },
  {
    href: "/blog/training-guide",
    label: "Training",
  },
  {
    href: "/blog/gear-guide",
    label: "Gear Guides",
  },
  {
    href: "/blog/gear-review",
    label: "Reviews",
  },
];

const popularPosts = [
  {
    href: "/blog/gear-guide/best-heart-rate-monitors",
    label: "Best Heart Rate Monitors 2026",
  },
  {
    href: "/blog/gear-guide/beginners-guide",
    label: "Beginner's Gear Guide",
  },
  {
    href: "/blog/training-guide/heart-rate-zones",
    label: "Heart Rate Zones Explained",
  },
];

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* =====================================================
          BLOG NAVIGATION
      ===================================================== */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/70 bg-zinc-950/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
          {/* Brand / Breadcrumb */}
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide">
            <Link
              href="/"
              className="font-bold text-white transition-colors hover:text-red-400"
            >
              Pulse Gear
            </Link>

            <span className="text-zinc-700">/</span>

            <Link
              href="/blog"
              className="text-zinc-400 transition-colors hover:text-white"
            >
              Blog
            </Link>
          </div>

          {/* Categories */}
          <nav
            aria-label="Blog categories"
            className="hidden items-center gap-1 md:flex"
          >
            {categories.map((category) => (
              <Link
                key={category.href}
                href={category.href}
                className="rounded-full px-3 py-1.5 text-xs font-medium text-zinc-500 transition-all duration-200 hover:bg-zinc-900 hover:text-white"
              >
                {category.label}
              </Link>
            ))}
          </nav>

          {/* Shop CTA */}
          <Link
            href="/products"
            className="hidden items-center gap-2 text-xs font-bold uppercase tracking-wide text-red-400 transition-colors hover:text-red-300 sm:flex"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
            Shop Gear
          </Link>
        </div>

        {/* Mobile categories */}
        <nav
          aria-label="Mobile blog categories"
          className="border-t border-zinc-900 px-6 py-2 md:hidden"
        >
          <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto">
            {categories.map((category) => (
              <Link
                key={category.href}
                href={category.href}
                className="shrink-0 rounded-full px-3 py-1.5 text-xs text-zinc-500 transition-colors hover:bg-zinc-900 hover:text-white"
              >
                {category.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      {/* =====================================================
          PAGE CONTENT
      ===================================================== */}
      <main className="flex-1">{children}</main>

      {/* =====================================================
          BLOG FOOTER
      ===================================================== */}
      <footer className="mt-auto w-full border-t border-zinc-800/70 bg-zinc-950">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <div className="flex max-w-sm flex-col gap-3">
            <p className="text-sm font-black uppercase tracking-wide text-white">
              Pulse Gear{" "}
              <span className="text-red-500">Egypt</span>
            </p>

            <p
              className="text-sm leading-relaxed text-zinc-500"
              dir="rtl"
            >
              بنساعدك تختار الـ Gear الصح، تفهم بيانات تمرينك،
              وتتمرن بشكل أذكى. مع منتجات تدريب متاحة في مصر.
            </p>

            <Link
              href="/products"
              className="mt-1 w-fit text-xs font-bold uppercase tracking-wide text-red-400 transition-colors hover:text-red-300"
            >
              Explore the Gear →
            </Link>
          </div>

          {/* Popular Posts */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
              Popular Posts
            </p>

            {popularPosts.map((post) => (
              <Link
                key={post.href}
                href={post.href}
                className="text-xs text-zinc-500 transition-colors hover:text-white"
              >
                → {post.label}
              </Link>
            ))}
          </div>

          {/* Shop CTA */}
          <div className="flex max-w-xs flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
              Ready to Gear Up?
            </p>

            <p
              className="text-xs leading-relaxed text-zinc-500"
              dir="rtl"
            >
              لقيت الـ Gear اللي محتاجه؟ أو مش لاقي اللي بتدور عليه؟
              تقدر تشوف المنتجات الحالية أو تطلب منتج مخصوص.
            </p>

            <div className="flex flex-col gap-2">
              <Link
                href="/products"
                className="rounded-full bg-red-600 px-5 py-2.5 text-center text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-red-700"
              >
                Browse Products →
              </Link>

              <Link
                href="/request-product"
                className="rounded-full border border-zinc-700 px-5 py-2.5 text-center text-xs font-bold uppercase tracking-wide text-zinc-400 transition-all hover:border-zinc-500 hover:text-white"
              >
                Request a Product
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-zinc-900 px-6 py-4">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-zinc-600">
              © {new Date().getFullYear()} Pulse Gear Egypt. All rights reserved.
            </p>

            <div className="flex items-center gap-4">
              <Link
                href="/privacy"
                className="text-xs text-zinc-600 transition-colors hover:text-zinc-400"
              >
                Privacy Policy
              </Link>

              <Link
                href="/terms"
                className="text-xs text-zinc-600 transition-colors hover:text-zinc-400"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}