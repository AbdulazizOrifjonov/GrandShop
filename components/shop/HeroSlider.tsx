"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Send, ArrowRight, Sparkles } from "lucide-react";
import { Slider } from "@/types/database";

const DEFAULT_SLIDES: Slider[] = [
  {
    id: "def-1",
    title: "Eksklyuziv va Nafis Soatlar",
    subtitle: "Dunyoning yetakchi brendlaridan original mexanik va kvars soatlar. Har bir soniyangiz qadrli.",
    image_url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1920&auto=format&fit=crop",
    button_text: "Katalogni ko'rish",
    link: "/products",
    sort_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "def-2",
    title: "Rolex & Audemars Piguet",
    subtitle: "O'zbekiston bo'ylab 1 kunda bepul yetkazib berish va 12 oylik rasmiy kafolat.",
    image_url: "https://images.unsplash.com/photo-1547996160-71dfabb1a756?q=80&w=1920&auto=format&fit=crop",
    button_text: "Erkaklar soatlari",
    link: "/products?cat=erkaklar",
    sort_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "def-3",
    title: "Kuzgi Chegirmalar Mavsumi",
    subtitle: "Tanlangan barcha modellarga 30% gacha maxsus chegirmalar va sovg'alar.",
    image_url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1920&auto=format&fit=crop",
    button_text: "Aksiyalarni ko'rish",
    link: "/products?sale=1",
    sort_order: 3,
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
      className="relative w-full overflow-hidden bg-navy-950 text-white min-h-[400px] sm:min-h-[480px] md:min-h-[520px] lg:min-h-[580px] h-[58vh] max-h-[640px] flex items-center select-none"
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
              className="object-cover object-center opacity-65 scale-105 transition-transform duration-[6000ms] ease-out"
            />
          )}
          {/* Dark Luxury Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/60 to-transparent sm:bg-gradient-to-r sm:from-navy-950/95 sm:via-navy-950/70 sm:to-transparent" />

          <div className="container-shop relative flex h-full flex-col justify-center gap-3 sm:gap-4 py-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-gold-500/20 border border-gold-400/30 px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gold-400 w-fit backdrop-blur-xs">
              <Sparkles size={12} className="text-gold-400" />
              <span>GRAND WATCH COLLECTION</span>
            </div>

            <h1 className="max-w-xl font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-white drop-shadow-md">
              {slide.title}
            </h1>

            {slide.subtitle && (
              <p className="max-w-md text-xs sm:text-sm md:text-base text-white/80 leading-relaxed drop-shadow">
                {slide.subtitle}
              </p>
            )}

            {/* Action Buttons */}
            <div className="mt-2 sm:mt-4 flex flex-wrap items-center gap-2.5 sm:gap-4">
              <Link
                href={slide.link ?? "/products"}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 sm:px-7 py-2.5 sm:py-3.5 text-xs sm:text-sm font-bold text-navy-950 transition hover:bg-gold-500 hover:text-navy-950 shadow-lg active:scale-95"
              >
                <span>{slide.button_text || "Katalogni ko'rish"}</span>
                <ArrowRight size={15} />
              </Link>

              <a
                href="https://t.me/Grandwatch_Admin"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-navy-900/80 border border-white/25 px-4 sm:px-6 py-2.5 sm:py-3.5 text-xs sm:text-sm font-semibold text-white/90 hover:bg-white/15 hover:border-white/40 transition backdrop-blur-md shadow-md active:scale-95"
              >
                <Send size={14} className="text-sky-400" />
                <span>Telegram Maslahat</span>
              </a>
            </div>

            {/* Trust Stats on Desktop */}
            <div className="mt-6 hidden gap-8 text-xs sm:text-sm md:flex lg:gap-12 pt-4 border-t border-white/10 max-w-xl">
              <div>
                <div className="text-lg font-bold text-white">1000+</div>
                <div className="text-white/60 text-xs">Mijozlar</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">100%</div>
                <div className="text-white/60 text-xs">Asl mahsulotlar</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">12 Oy</div>
                <div className="text-white/60 text-xs">Rasmiy kafolat</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">24/7</div>
                <div className="text-white/60 text-xs">Yetkazib berish</div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {active.length > 1 && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          {/* Arrow Left */}
          <button
            onClick={handlePrev}
            aria-label="Oldingi slayd"
            className="pointer-events-auto absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white/30 active:scale-95 border border-white/20 shadow-md"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Arrow Right */}
          <button
            onClick={handleNext}
            aria-label="Keyingi slayd"
            className="pointer-events-auto absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white/30 active:scale-95 border border-white/20 shadow-md"
          >
            <ChevronRight size={20} />
          </button>

          {/* Indicator Pills */}
          <div className="pointer-events-auto absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {active.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setIndex(i)}
                aria-label={`Slayd ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? "w-7 sm:w-9 bg-gold-400 shadow-xs" : "w-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
