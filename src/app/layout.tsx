import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pulse Gear Egypt",
  description:
    "Premium Running Watches, Heart Rate Monitors and Running Accessories for Egyptian Athletes.",
  verification: {
    google: "DG_mrFdxIOFCNw5RiQrc-yz5uG_YRsf26m4VZ1Dl44M",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col">

        <Header />

        <main className="flex-1">
          {children}
        </main>

        <Footer />

        <Analytics />
        <SpeedInsights />

      </body>
    </html>
  );
}