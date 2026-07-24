// src/components/StatsBar.tsx

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";

export default function StatsBar() {
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [soldProducts, setSoldProducts]   = useState<number>(0);
  const [totalLikes, setTotalLikes]       = useState<number>(0);
  const [loading, setLoading]             = useState(true);

  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });

  useEffect(() => {
    async function fetchStats() {
      const [
        { count: total },
        { count: sold },
        { count: likes },
      ] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }).eq("status", "sold"),
        supabase.from("product_likes").select("*", { count: "exact", head: true }),
      ]);

      setTotalProducts(total ?? 0);
      setSoldProducts(sold ?? 0);
      setTotalLikes(likes ?? 0);
      setLoading(false);
    }

    fetchStats();
  }, []);

  const stats = [
    { label: "Products Listed", value: totalProducts, suffix: "+", icon: "📦" },
    { label: "Products Sold",   value: soldProducts,  suffix: "+", icon: "✅" },
    { label: "Products Liked",  value: totalLikes,    suffix: "+", icon: "❤️" },
  ];

  return (
    <section
      ref={ref}
      className="w-full bg-zinc-900 border-t border-b border-zinc-800 py-10 px-6"
    >
      <div className="max-w-6xl mx-auto">

        {/* ===== TITLE ===== */}
        <div className="text-center mb-10">
          <span className="text-3xl font-bold uppercase tracking-widest text-red-500">
            Our Impact So Far
          </span>
          <h2 className="text-xl font-black text-white uppercase mt-1">
            Pulse Gear By The Numbers
          </h2>
        </div>

        {/* ===== STATS GRID ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-red-600 transition-colors duration-300"
            >
              <span className="text-4xl">{stat.icon}</span>
              <span className="text-4xl font-black text-white">
                {!loading && inView ? (
                  <CountUp
                    start={0}
                    end={stat.value}
                    duration={2}
                    suffix={stat.suffix}
                  />
                ) : (
                  <span className="opacity-0">0</span>
                )}
              </span>
              <span className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}