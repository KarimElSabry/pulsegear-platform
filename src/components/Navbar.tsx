// src/components/Navbar.tsx

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b bg-white">

      {/* ─── Logo ───────────────────────────────── */}
      <Link href="/" className="text-xl font-bold text-gray-800">
        ⚡ Pulse Gear
      </Link>

      {/* ─── Links ──────────────────────────────── */}
      <div className="flex gap-6 text-sm font-medium text-gray-600">
        <Link href="/" className="hover:text-black transition">
          Home
        </Link>
        <Link href="/products" className="hover:text-black transition">
          Products
        </Link>

        {/* ✅ الجديد */}
        <Link href="/sold" className="hover:text-black transition">
          Sold Archive
        </Link>
      </div>

    </nav>
  );
}