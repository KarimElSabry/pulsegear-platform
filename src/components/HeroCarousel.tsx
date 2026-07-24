// src/app/components/HeroCarousel.tsx

"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useState } from "react";

const images = [
  { src: "/image.jpg", alt: "Athlete" },
  { src: "/hero1.jpg", alt: "Athlete 1" },
  { src: "/hero2.jpg", alt: "Athlete 2" },
  { src: "/hero3.jpg", alt: "Athlete 3" },
  { src: "/hero4.jpg", alt: "Athlete 4" },
  { src: "/hero5.jpg", alt: "Athlete 5" },
];

export default function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    [Autoplay({ delay: 3000, stopOnInteraction: false })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (index: number) => {
      if (!emblaApi) return;
      emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  return (
    <div className="flex-1 w-full relative rounded-3xl overflow-hidden">

      {/* Carousel Viewport */}
      <div className="overflow-hidden rounded-3xl" ref={emblaRef}>
        <div className="flex">
          {images.map((img, i) => (
            <div key={i} className="flex-[0_0_100%] min-w-0">
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-[500px] object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className={`transition-all duration-300 rounded-full
              ${
                i === selectedIndex
                  ? "bg-red-500 w-6 h-2.5"
                  : "bg-white/40 hover:bg-white/70 w-2.5 h-2.5"
              }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Ring Overlay */}
      <div className="absolute inset-0 rounded-3xl ring-1 ring-red-600/20 pointer-events-none" />

    </div>
  );
}