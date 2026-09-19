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

import { useState, useMemo } from "react";
import { LuxuryMarquee } from "@/components/shop/LuxuryMarquee";

export default function Home() {
  const { products, categories, sliders } = useStore();
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const activeCategories = categories.filter((c) => c.is_active).slice(0, 6);
  const saleProducts = products
    .filter((p) => p.is_active && (p.discount || (p.old_price && p.old_price > p.price) || p.is_new))
    .slice(0, 10);
    
  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => p.is_active);
    if (selectedCategory !== "all") {
      list = list.filter((p) => p.category_id === selectedCategory);
    }
    return list;
  }, [products, selectedCategory]);

  const pageSize = 60;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const visibleFeatured = filteredProducts.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="min-h-screen bg-white">
      <Header active="/" />
      <HeroSlider sliders={sliders} />

      {/* Running Luxury Brand Ticker (khan.store style) */}
      <LuxuryMarquee />

      {/* Trust & Guarantee Badges */}
      <section className="border-b border-navy-100/80 bg-white py-6">
        <div className="container-shop grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {USPS.map((u) => (
            <div key={u.title} className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl bg-navy-50/60 border border-navy-100/70 hover:bg-navy-50 transition shadow-xs">
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-gold-400 shadow-xs">
                <u.icon size={20} className="sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="text-[12px] sm:text-sm font-bold text-navy-900 leading-snug">{u.title}</div>
                <div className="text-[10px] sm:text-xs text-navy-900/60 mt-0.5">{u.subtitle}</div>
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
        <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {saleProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>

      <div className="container-shop py-6 pb-16" id="featured">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <h2 className="text-xl sm:text-2xl font-extrabold text-navy-900">
            Barcha soatlar
          </h2>

          {/* Quick Category Filter Tabs (Khan Store style) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
            <button
              onClick={() => { setSelectedCategory("all"); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-full transition-all shrink-0 ${
                selectedCategory === "all"
                  ? "bg-navy-900 text-white shadow-xs"
                  : "bg-navy-50 text-navy-900/70 hover:bg-navy-100 hover:text-navy-900"
              }`}
            >
              Barchasi ({products.filter(p => p.is_active).length})
            </button>
            {activeCategories.map((cat) => {
              const count = products.filter(p => p.is_active && p.category_id === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setPage(1); }}
                  className={`px-3.5 py-1.5 rounded-full transition-all shrink-0 ${
                    selectedCategory === cat.id
                      ? "bg-navy-900 text-white shadow-xs"
                      : "bg-navy-50 text-navy-900/70 hover:bg-navy-100 hover:text-navy-900"
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {visibleFeatured.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {visibleFeatured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-navy-900/40 text-sm">
            Hozircha bu bo'limda soatlar mavjud emas
          </div>
        )}
        
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
            <button
              disabled={page === 1}
              onClick={() => {
                setPage((p) => p - 1);
                document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-navy-100 disabled:opacity-30"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => {
                    setPage(p);
                    document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm ${
                    page === p ? "bg-navy-900 text-white" : "border border-navy-100 text-navy-900"
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              disabled={page === totalPages}
              onClick={() => {
                setPage((p) => p + 1);
                document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' });
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
