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
  { icon: Truck, title: "Yetkazib berish", subtitle: "Kelishilgan holda" },
  { icon: ShieldCheck, title: "100% Original", subtitle: "Rasmiy kafolat" },
  { icon: CreditCard, title: "Qulay to'lov", subtitle: "Barcha usullar" },
  { icon: Headphones, title: "24/7 Qo'llab-quvvatlash", subtitle: "Doimo aloqada" },
];

import { useState, useMemo } from "react";
import { LuxuryMarquee } from "@/components/shop/LuxuryMarquee";

const DEFAULT_CATEGORIES = [
  {
    id: "c1",
    name: "Erkaklar uchun",
    slug: "erkaklar",
    description: null,
    image_url: "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?q=80&w=800&auto=format&fit=crop",
    is_active: true,
    product_count: 0,
    created_at: "",
  },
  {
    id: "c2",
    name: "Ayollar uchun",
    slug: "ayollar",
    description: null,
    image_url: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=800&auto=format&fit=crop",
    is_active: true,
    product_count: 0,
    created_at: "",
  },
  {
    id: "c3",
    name: "Bolalar uchun",
    slug: "bolalar",
    description: null,
    image_url: "https://jcxuntvtoemnhnsxjwrh.supabase.co/storage/v1/object/public/shop-images/bot/1789815383399_0.jpg",
    is_active: true,
    product_count: 0,
    created_at: "",
  },
  {
    id: "c5",
    name: "Smart soatlar",
    slug: "smart-soatlar",
    description: null,
    image_url: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=800&auto=format&fit=crop",
    is_active: true,
    product_count: 0,
    created_at: "",
  },
  {
    id: "c7",
    name: "Aksessuarlar",
    slug: "aksessuarlar",
    description: null,
    image_url: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?q=80&w=800&auto=format&fit=crop",
    is_active: true,
    product_count: 0,
    created_at: "",
  },
];

export default function Home() {
  const { products, categories, sliders } = useStore();
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const activeCategories = categories.filter((c) => c.is_active);
  const displayCategories = activeCategories.length > 0 ? activeCategories : DEFAULT_CATEGORIES;
  // Duplicate for seamless 0% -> -50% infinite marquee loop
  const marqueeHalf = [...displayCategories, ...displayCategories];
  const marqueeCategories = [...marqueeHalf, ...marqueeHalf];
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

      {/* Mashhur kategoriyalar - Horizontal Continuous Non-stop Marquee */}
      <section className="py-8 bg-gradient-to-b from-white via-navy-50/25 to-white overflow-hidden border-b border-navy-100/60">
        <div className="container-shop mb-3">
          <SectionHeader title="Mashhur kategoriyalar" href="/products" />
        </div>
        <div className="relative w-full overflow-hidden select-none py-1">
          {/* Edge blur & gradient fade masks for smooth luxury transitions */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-24 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-24 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />

          {/* Running track moving continuously from right to left */}
          <div className="flex animate-marquee-cards gap-4 sm:gap-5 px-4">
            {marqueeCategories.map((c, idx) => (
              <CategoryCard key={`${c.id}-${idx}`} category={c} />
            ))}
          </div>
        </div>
      </section>

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
