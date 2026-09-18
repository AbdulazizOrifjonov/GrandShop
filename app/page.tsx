"use client";

import { Truck, ShieldCheck, CreditCard, Headphones } from "lucide-react";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { HeroSlider } from "@/components/shop/HeroSlider";
import { CategoryCard } from "@/components/shop/CategoryCard";
import { SectionHeader } from "@/components/shop/SectionHeader";
import { ProductCard } from "@/components/shop/ProductCard";
import { SaleCountdown } from "@/components/shop/SaleCountdown";
import { useStore } from "@/lib/store";

const USPS = [
  { icon: Truck, title: "Bepul yetkazib berish", subtitle: "500 000 so'mdan" },
  { icon: ShieldCheck, title: "100% Original", subtitle: "Rasmiy kafolat" },
  { icon: CreditCard, title: "Qulay to'lov", subtitle: "Barcha usullar" },
  { icon: Headphones, title: "24/7 Qo'llab-quvvatlash", subtitle: "Doimo aloqada" },
];

import { useState, useEffect } from "react";

export default function Home() {
  const { products, categories, sliders } = useStore();
  const [page, setPage] = useState(1);

  const activeCategories = categories.filter((c) => c.is_active).slice(0, 6);
  const saleProducts = products
    .filter((p) => p.is_active && (p.discount || (p.old_price && p.old_price > p.price) || p.is_new))
    .slice(0, 10);
    
  const featured = products.filter((p) => p.is_active);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(featured.length / pageSize));
  const visibleFeatured = featured.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="min-h-screen bg-white">
      <Header active="/" />
      <HeroSlider sliders={sliders} />

      <section className="border-b border-navy-100 bg-navy-50">
        <div className="container-shop grid grid-cols-2 gap-6 py-6 md:grid-cols-4">
          {USPS.map((u) => (
            <div key={u.title} className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-navy-900 shadow-sm">
                <u.icon size={20} />
              </div>
              <div>
                <div className="text-sm font-semibold text-navy-900">{u.title}</div>
                <div className="text-xs text-navy-900/60">{u.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="container-shop py-10">
        <SectionHeader title="Mashhur kategoriyalar" href="/products" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {activeCategories.map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </div>
      </div>

      <div className="container-shop py-6">
        <SectionHeader title="Aksiya mahsulotlari" href="/products?sale=1" extra={<SaleCountdown />} />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {saleProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>

      <div className="container-shop py-6 pb-16">
        <SectionHeader title="Mashhur mahsulotlar" href="/products" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {visibleFeatured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
            <button
              disabled={page === 1}
              onClick={() => {
                setPage((p) => p - 1);
                window.scrollTo({ top: document.body.scrollHeight - 1200, behavior: "smooth" });
              }}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-navy-100 disabled:opacity-30"
            >
              ‹
            </button>
            {(() => {
              let startPage = Math.max(1, page - 3);
              let endPage = startPage + 6;
              if (endPage > totalPages) {
                endPage = totalPages;
                startPage = Math.max(1, endPage - 6);
              }
              const pages = [];
              for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
              }
              return pages.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPage(p);
                    window.scrollTo({ top: document.body.scrollHeight - 1200, behavior: "smooth" });
                  }}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm ${
                    page === p ? "bg-navy-900 text-white" : "border border-navy-100 text-navy-900"
                  }`}
                >
                  {p}
                </button>
              ));
            })()}
            <button
              disabled={page === totalPages}
              onClick={() => {
                setPage((p) => p + 1);
                window.scrollTo({ top: document.body.scrollHeight - 1200, behavior: "smooth" });
              }}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-navy-100 disabled:opacity-30"
            >
              ›
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
