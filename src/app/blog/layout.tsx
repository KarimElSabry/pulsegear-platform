// src/app/blog/layout.tsx

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Blog | Pulse Gear",
    template: "%s | Pulse Gear Blog",
  },
  description:
    "Training tips, gear reviews, and heart rate guides from Pulse Gear.",
  openGraph: {
    siteName: "Pulse Gear",
    type: "website",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950">
      {children}
    </div>
  );
}