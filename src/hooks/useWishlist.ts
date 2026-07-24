// src/hooks/useWishlist.ts

"use client";

import { useState, useEffect } from "react";
import { Product } from "@/types/product";

const WISHLIST_KEY = "pulsegear_wishlist";

export function useWishlist() {
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Load IDs from Local Storage
  useEffect(() => {
    const stored = localStorage.getItem(WISHLIST_KEY);
    if (stored) {
      setWishlistIds(JSON.parse(stored));
    }
  }, []);

  // ✅ Save IDs to Local Storage whenever they change
  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  // ✅ Fetch fresh product data whenever IDs change
  useEffect(() => {
    if (wishlistIds.length === 0) {
      setWishlist([]);
      return;
    }

    const fetchWishlistProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        wishlistIds.forEach((id) => params.append("ids", String(id)));

        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();
        setWishlist(data.data ?? data);
      } catch (err) {
        console.error("Failed to fetch wishlist products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [wishlistIds]);

  const isLoved = (id: number) => wishlistIds.includes(id);

  const toggleLove = (product: Product) => {
    if (!product.id) return;
    setWishlistIds((prev) =>
      isLoved(product.id!)
        ? prev.filter((id) => id !== product.id) // 💔 Remove
        : [...prev, product.id!]                  // ❤️ Add
    );
  };

  return { wishlist, wishlistIds, isLoved, toggleLove, loading };
}