// src/components/layout/Header.tsx

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { label: "Products", href: "/products" },
  { label: "Brands", href: "/brands" },
  { label: "Sold", href: "/sold" },          // 🆕 ضفناها هنا
  { label: "Request Product", href: "/request-product" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "FAQ", href: "/faq" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full border-b border-white/10 bg-[#111111] sticky top-0 z-50">
      <div className="w-full px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Pulse Gear Logo"
            width={140}
            height={40}
            style={{ width: "auto", height: "auto" }}
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-lg font-medium text-gray-300 hover:text-white transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className={`block w-6 h-0.5 bg-gray-300 transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-6 h-0.5 bg-gray-300 transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-0.5 bg-gray-300 transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>

      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <nav className="md:hidden border-t border-white/10 px-6 py-4 flex flex-col gap-4 bg-[#111111]">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-lg font-medium text-gray-300 hover:text-white transition-colors duration-200"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}