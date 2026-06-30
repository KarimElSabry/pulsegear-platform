"use client";

import { useState, useEffect } from "react";
import { Product } from "@/types/product";

const WISHLIST_KEY = "pulsegear_wishlist";

export function useWishlist() {
  const [wishlist, setWishlist] = useState<Product[]>([]);

  // تحميل الـ wishlist من Local Storage
  useEffect(() => {
    const stored = localStorage.getItem(WISHLIST_KEY);
    if (stored) {
      setWishlist(JSON.parse(stored));
    }
  }, []);

  // حفظ في Local Storage كل ما تتغير
  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  const isLoved = (id: string) => wishlist.some((p) => p.id === id);

  const toggleLove = (product: Product) => {
    setWishlist((prev) =>
      isLoved(product.id)
        ? prev.filter((p) => p.id !== product.id) // 💔 Unlove
        : [...prev, product]                       // ❤️ Love
    );
  };

  return { wishlist, isLoved, toggleLove };
}