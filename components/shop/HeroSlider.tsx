"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Send, ArrowRight, Sparkles } from "lucide-react";
import { Slider } from "@/types/database";

const DEFAULT_SLIDES: Slider[] = [
  {
    id: "s1",
    title: "Rolex Oyster Perpetual",
    subtitle: "Dunyoning eng mashhur va nufuzli Shveysariya soatlari. Original sifat va 12 oy rasmiy kafolat.",
    image_url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1920&auto=format&fit=crop",
    button_text: "Katalogni ko'rish",
    link: "/products",
    sort_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "s2",
    title: "Audemars Piguet Royal Oak",
    subtitle: "O'zgacha geometrik luks dizayn va avtomatik mexanizm. Har bir erkak orzusidagi hashamat.",
    image_url: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1920&auto=format&fit=crop",
    button_text: "Erkaklar soatlari",
    link: "/products?cat=erkaklar",
    sort_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "s3",
    title: "Patek Philippe & Cartier",
    subtitle: "Shveysariya an'analari, aristokratik nafislik va mukammal aniqlik uyg'unligi.",
    image_url: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1920&auto=format&fit=crop",
    button_text: "Kolleksiyani ko'rish",
    link: "/products",
    sort_order: 3,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "s4",
    title: "Hublot Big Bang Series",
    subtitle: "Innovatsion keramika, titan korpus va xronograf funksiyalari. Jasur va zamonaviy obraz.",
    image_url: "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?q=80&w=1920&auto=format&fit=crop",
    button_text: "Brend soatlari",
    link: "/products",
    sort_order: 4,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "s5",
    title: "Tissot & Maxsus Chegirmalar",
    subtitle: "O'zbekiston bo'ylab 1 kunda bepul yetkazib berish. 30% gacha maxsus mavsumiy chegirmalar.",
    image_url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1920&auto=format&fit=crop",
    button_text: "Aksiyalarni ko'rish",
    link: "/products?sale=1",
    sort_order: 5,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export function HeroSlider({ sliders }: { sliders: Slider[] }) {
  const [index, setIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const active = useMemo(() => {
    const list = sliders?.filter((s) => s.is_active).sort((a, b) => a.sort_order - b.sort_order) || [];
    return list.length > 0 ? list : DEFAULT_SLIDES;
  }, [sliders]);

  useEffect(() => {
    if (active.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % active.length), 5500);
    return () => clearInterval(t);
  }, [active.length]);

  const handleNext = () => setIndex((i) => (i + 1) % active.length);
  const handlePrev = () => setIndex((i) => (i - 1 + active.length) % active.length);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) handleNext();
    if (distance < -50) handlePrev();
  };

  return (
    <section 
      className="relative w-full overflow-hidden bg-navy-950 text-white min-h-[300px] sm:min-h-[360px] md:min-h-[400px] lg:min-h-[440px] h-[44vh] max-h-[460px] select-none"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
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
              className="object-cover object-center opacity-85 scale-105 transition-transform duration-[6000ms] ease-out"
            />
          )}

          {/* Top & Bottom Vignettes (center stays clear for watch dial) */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-navy-950/80 via-transparent to-navy-950/90" />
          <div className="absolute inset-0 pointer-events-none sm:bg-gradient-to-r sm:from-navy-950/70 sm:via-transparent sm:to-transparent" />

          {/* Content: Justify Between (Title pushed TOP, Buttons pushed BOTTOM, Center CLEAR) */}
          <div className="container-shop relative flex h-full flex-col justify-between py-4 sm:py-6 pointer-events-none">
            {/* Top Section */}
            <div className="pointer-events-auto pt-1">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-navy-950/75 border border-gold-400/40 px-2.5 py-0.5 text-[9px] sm:text-[11px] font-bold uppercase tracking-widest text-gold-400 w-fit backdrop-blur-md shadow-xs">
                <Sparkles size={11} className="text-gold-400" />
                <span>GRAND WATCH COLLECTION</span>
              </div>

              <h1 className="mt-1.5 max-w-xl font-serif text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                {slide.title}
              </h1>
            </div>

            {/* Bottom Section (Buttons & Subtitle at bottom) */}
            <div className="pointer-events-auto pb-5 sm:pb-4 space-y-2">
              {slide.subtitle && (
                <p className="max-w-md text-[11px] sm:text-xs md:text-sm text-white/90 leading-snug drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)] line-clamp-1 sm:line-clamp-2">
                  {slide.subtitle}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <Link
                  href={slide.link ?? "/products"}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-navy-950 transition hover:bg-gold-500 hover:text-navy-950 shadow-md active:scale-95"
                >
                  <span>{slide.button_text || "Katalogni ko'rish"}</span>
                  <ArrowRight size={13} />
                </Link>

                <a
                  href="https://t.me/Grandwatch_Admin"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-navy-950/80 border border-white/30 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white/95 hover:bg-white/20 transition backdrop-blur-md shadow-md active:scale-95"
                >
                  <Send size={12} className="text-sky-400" />
                  <span>Telegram Maslahat</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}

      {active.length > 1 && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          {/* Arrow Left (Desktop only to prevent mobile text overlap) */}
          <button
            onClick={handlePrev}
            aria-label="Oldingi slayd"
            className="hidden md:flex pointer-events-auto absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white/30 active:scale-95 border border-white/20 shadow-md"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Arrow Right (Desktop only to prevent mobile text overlap) */}
          <button
            onClick={handleNext}
            aria-label="Keyingi slayd"
            className="hidden md:flex pointer-events-auto absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white/30 active:scale-95 border border-white/20 shadow-md"
          >
            <ChevronRight size={20} />
          </button>

          {/* Indicator Pills */}
          <div className="pointer-events-auto absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {active.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setIndex(i)}
                aria-label={`Slayd ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? "w-6 sm:w-8 bg-gold-400 shadow-xs" : "w-1.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
