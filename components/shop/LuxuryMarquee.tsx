"use client";

import React from "react";

const BRANDS = [
  "ROLEX",
  "PATEK PHILIPPE",
  "TISSOT",
  "OMEGA",
  "HUBLOT",
  "CASIO",
  "AUDEMARS PIGUET",
  "RADO",
  "LONGINES",
  "CARTIER",
  "BREITLING",
  "TAG HEUER",
  "BREGUET",
  "VACHERON CONSTANTIN",
];

export function LuxuryMarquee() {
  return (
    <section className="w-full bg-navy-950 py-3 border-y border-gold-500/25 overflow-hidden select-none shadow-sm">
      <div className="flex whitespace-nowrap animate-marquee">
        {BRANDS.map((brand, idx) => (
          <div key={`b1-${idx}`} className="flex items-center gap-5 mx-5 shrink-0">
            <span className="text-white/90 font-extrabold text-xs sm:text-sm tracking-[0.22em] uppercase font-mono hover:text-gold-400 transition-colors">
              {brand}
            </span>
            <span className="text-gold-400 text-xs select-none">✦</span>
          </div>
        ))}
        {BRANDS.map((brand, idx) => (
          <div key={`b2-${idx}`} className="flex items-center gap-5 mx-5 shrink-0">
            <span className="text-white/90 font-extrabold text-xs sm:text-sm tracking-[0.22em] uppercase font-mono hover:text-gold-400 transition-colors">
              {brand}
            </span>
            <span className="text-gold-400 text-xs select-none">✦</span>
          </div>
        ))}
      </div>
    </section>
  );
}
