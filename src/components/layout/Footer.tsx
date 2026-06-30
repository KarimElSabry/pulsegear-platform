import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { label: "Products", href: "/products" },
  { label: "Brands", href: "/brands" },
  { label: "Request Product", href: "/request-product" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "FAQ", href: "/faq" },
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-[#111111] mt-0">
      <div className="max-w-6xl mx-auto px-6 py-12">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Column 1 — Logo + Tagline */}
          <div className="flex flex-col gap-4">
            <Image
              src="/logo.png"
              alt="Pulse Gear Logo"
              width={120}
              height={36}
            />
            <p className="text-sm text-gray-400 leading-relaxed">
              Egypt's home for serious runners.
              We source, ship, and deliver the gear you need.
            </p>
          </div>

          {/* Column 2 — Navigation */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Navigation
            </h3>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Column 3 — Contact */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Get in Touch
            </h3>
            <a
              href="https://wa.me/+201205322444"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
            >
              💬 WhatsApp Us
            </a>
            <a
              href="https://instagram.com/pulsegear_egypt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
            >
              📸 Instagram
            </a>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Pulse Gear Egypt. All rights reserved.
          </p>
          <p className="text-xs text-gray-500">
            Built for runners. Powered by passion.
          </p>
        </div>

      </div>
    </footer>
  );
}