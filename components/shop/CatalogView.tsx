"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, List, X, Menu, Filter } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Product } from "@/types/database";

const PAGE_SIZE = 12;

export function CatalogView({
  initialCategorySlug,
  initialSearch,
  saleOnly = false,
  title = "Barcha mahsulotlar",
}: {
  initialCategorySlug?: string;
  initialSearch?: string;
  saleOnly?: boolean;
  title?: string;
}) {
  const { products, categories } = useStore();
  const [categorySlug, setCategorySlug] = useState(initialCategorySlug ?? "all");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sort, setSort] = useState("popular");
  const [page, setPage] = useState(1);
  const [priceMax, setPriceMax] = useState(50000000);
  const [view, setView] = useState<"grid" | "list">("grid");

  const brands = useMemo(
    () => Array.from(new Set(products.map((p) => p.brand).filter(Boolean))) as string[],
    [products]
  );

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.is_active);

    if (categorySlug !== "all") {
      const cat = categories.find((c) => c.slug === categorySlug);
      list = list.filter((p) => p.category_id === cat?.id);
    }
    if (initialSearch) {
      const q = initialSearch.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || (p.brand ?? "").toLowerCase().includes(q)
      );
    }
    if (saleOnly) {
      list = list.filter((p) => p.discount || (p.old_price && p.old_price > p.price));
    }
    if (selectedBrands.length) {
      list = list.filter((p) => p.brand && selectedBrands.includes(p.brand));
    }
    list = list.filter((p) => p.price <= priceMax);

    if (sort === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "new") list = [...list].sort((a, b) => (a.is_new === b.is_new ? 0 : a.is_new ? -1 : 1));
    if (sort === "popular") list = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

    return list;
  }, [products, categories, categorySlug, initialSearch, saleOnly, selectedBrands, priceMax, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleBrand(b: string) {
    setPage(1);
    setSelectedBrands((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]));
  }

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  return (
    <div className="container-shop grid grid-cols-1 gap-8 py-8 lg:grid-cols-[260px_1fr] lg:items-start">
      {/* Mobile Filter Overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-navy-900/40 backdrop-blur-sm transition-opacity lg:hidden",
          mobileFiltersOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileFiltersOpen(false)}
      />

      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[280px] overflow-y-auto bg-white p-6 shadow-2xl transition-transform lg:static lg:w-auto lg:p-0 lg:shadow-none lg:z-auto lg:translate-x-0 lg:sticky lg:top-[100px] lg:block space-y-8 custom-scrollbar",
          mobileFiltersOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between lg:hidden mb-6">
          <h2 className="font-bold text-lg text-navy-900">Filterlar</h2>
          <button 
            onClick={() => setMobileFiltersOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-50 text-navy-900"
          >
            <X size={20} />
          </button>
        </div>

        <div>
          <h3 className="mb-3 font-semibold text-navy-900">Kategoriyalar</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <label className="flex cursor-pointer items-center justify-between">
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={categorySlug === "all"}
                    onChange={() => { setCategorySlug("all"); setPage(1); setMobileFiltersOpen(false); }}
                  />
                  Barchasi
                </span>
                <span className="text-navy-900/40">{products.length}</span>
              </label>
            </li>
            {categories.filter((c) => c.is_active).map((c) => (
              <li key={c.id}>
                <label className="flex cursor-pointer items-center justify-between">
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={categorySlug === c.slug}
                      onChange={() => { setCategorySlug(c.slug); setPage(1); setMobileFiltersOpen(false); }}
                    />
                    {c.name}
                  </span>
                  <span className="text-navy-900/40">
                    {products.filter((p) => p.category_id === c.id).length}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 font-semibold text-navy-900">Narx oralig'i</h3>
          <input
            type="range"
            min={0}
            max={50000000}
            step={100000}
            value={priceMax}
            onChange={(e) => { setPriceMax(Number(e.target.value)); setPage(1); }}
            className="w-full accent-navy-900"
          />
          <div className="mt-1 flex justify-between text-xs text-navy-900/50">
            <span>0 so'm</span>
            <span>{priceMax.toLocaleString("uz-UZ")} so'm</span>
          </div>
        </div>

        {brands.length > 0 && (
          <div>
            <h3 className="mb-3 font-semibold text-navy-900">Brend</h3>
            <ul className="space-y-2 text-sm">
              {brands.map((b) => (
                <li key={b}>
                  <label className="flex cursor-pointer items-center justify-between">
                    <span className="flex items-center gap-2">
                      <input type="checkbox" checked={selectedBrands.includes(b)} onChange={() => toggleBrand(b)} />
                      {b}
                    </span>
                    <span className="text-navy-900/40">
                      {
                        products.filter(
                          (p) =>
                            p.brand === b &&
                            (categorySlug === "all" || p.category_id === categories.find((c) => c.slug === categorySlug)?.id) &&
                            p.price <= priceMax &&
                            (!saleOnly || p.discount || (p.old_price && p.old_price > p.price))
                        ).length
                      }
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>

      <div>
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div>
              <h1 className="text-2xl font-bold text-navy-900">{title}</h1>
              <p className="text-sm text-navy-900/50">{filtered.length} ta mahsulot</p>
            </div>
            {/* Filter Toggle Mobile */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="flex h-10 items-center gap-2 rounded-xl border border-navy-200 bg-white px-4 text-sm font-semibold text-navy-900 shadow-sm transition hover:bg-navy-50 lg:hidden"
            >
              <Filter size={18} />
              Filterlar
            </button>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-lg border border-navy-100 px-3 py-2 text-sm"
            >
              <option value="popular">Saralash: Mashhurlik bo'yicha</option>
              <option value="new">Yangi mahsulotlar</option>
              <option value="price_asc">Narx: pastdan yuqoriga</option>
              <option value="price_desc">Narx: yuqoridan pastga</option>
            </select>
            <div className="flex overflow-hidden rounded-lg border border-navy-100">
              <button
                onClick={() => setView("grid")}
                className={`flex h-9 w-9 items-center justify-center ${view === "grid" ? "bg-navy-900 text-white" : "text-navy-900/50"}`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setView("list")}
                className={`flex h-9 w-9 items-center justify-center ${view === "list" ? "bg-navy-900 text-white" : "text-navy-900/50"}`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {pageItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-navy-100 py-20 text-center text-navy-900/50">
            Hech qanday mahsulot topilmadi.
          </div>
        ) : (
          <div
            className={
              view === "grid"
                ? "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 gap-responsive"
                : "flex flex-col gap-4"
            }
          >
            {pageItems.map((p: Product) => (
              <ProductCard key={p.id} product={p} variant={view === "list" ? "full" : "compact"} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-navy-100 disabled:opacity-30"
            >
              ‹
            </button>
            {(() => {
              let pages = [];
              if (totalPages <= 5) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
              } else {
                if (page <= 3) {
                  pages = [1, 2, 3, 4, '...', totalPages];
                } else if (page >= totalPages - 2) {
                  pages = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
                } else {
                  pages = [1, '...', page - 1, page, page + 1, '...', totalPages];
                }
              }
              return pages.map((p, i) => (
                p === '...' ? (
                  <span key={`dots-${i}`} className="flex h-9 w-4 sm:w-9 items-center justify-center text-navy-900/50">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm ${
                      page === p ? "bg-navy-900 text-white" : "border border-navy-100 text-navy-900"
                    }`}
                  >
                    {p}
                  </button>
                )
              ));
            })()}
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-navy-100 disabled:opacity-30"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
