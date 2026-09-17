"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Slider } from "@/types/database";

export function HeroSlider({ sliders }: { sliders: Slider[] }) {
  const [index, setIndex] = useState(0);
  const active = sliders.filter((s) => s.is_active).sort((a, b) => a.sort_order - b.sort_order);

  useEffect(() => {
    if (active.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % active.length), 5000);
    return () => clearInterval(t);
  }, [active.length]);

  if (active.length === 0) return null;
  return (
    <section className="relative w-full overflow-hidden bg-navy-950 text-white hero-height">
      {active.map((slide, i) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              i === index ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0"
            }`}
          >
            {slide.image_url && (
              <Image
                src={slide.image_url}
                alt={slide.title}
                fill
                priority={i === 0}
                className="object-cover opacity-70"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-navy-950/90 via-navy-950/60 to-transparent" />

            <div className="container-shop relative flex h-full flex-col justify-center gap-5">
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/70 md:text-xs">
                Time defines you
              </p>
              <h1 className="max-w-xl font-serif text-3xl font-bold leading-tight md:text-5xl lg:text-6xl">
                {slide.title}
              </h1>
              {slide.subtitle && (
                <p className="max-w-md text-sm text-white/80 md:text-base">{slide.subtitle}</p>
              )}
              {slide.button_text && (
                <Link
                  href={slide.link ?? "/products"}
                  className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-navy-900 transition hover:bg-gold-500 hover:shadow-lg"
                >
                  {slide.button_text} →
                </Link>
              )}

              <div className="mt-8 hidden gap-8 text-sm md:flex lg:gap-12">
                <div>
                  <div className="text-xl font-bold">1000+</div>
                  <div className="text-white/60">Baxtli mijozlar</div>
                </div>
                <div>
                  <div className="text-xl font-bold">100%</div>
                  <div className="text-white/60">Original mahsulotlar</div>
                </div>
                <div>
                  <div className="text-xl font-bold">24/7</div>
                  <div className="text-white/60">Qo'llab-quvvatlash</div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {active.length > 1 && (
          <div className="absolute inset-0 z-20 pointer-events-none">
            <button
              onClick={() => setIndex((i) => (i - 1 + active.length) % active.length)}
              className="pointer-events-auto absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/25 md:left-6"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setIndex((i) => (i + 1) % active.length)}
              className="pointer-events-auto absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/25 md:right-6"
            >
              <ChevronRight size={20} />
            </button>
            <div className="pointer-events-auto absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2.5">
              {active.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === index ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </section>
  );
}
