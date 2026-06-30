"use client";

import { useWishlist } from "@/hooks/useWishlist";
import ProductCard from "@/components/product/ProductCard"; // ✅ غيرت المسار هنا
import Link from "next/link";

export default function WishlistPage() {
  const { wishlist } = useWishlist();

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-white mb-2">My Wishlist ❤️</h1>
      <p className="text-gray-500 mb-8">
        {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved
      </p>

      {wishlist.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">🤍</p>
          <p className="text-gray-500 text-lg mb-6">
            No items in your wishlist yet!
          </p>
          <Link
            href="/products"
            className="bg-red-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-700 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}