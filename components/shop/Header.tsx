"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { Heart, Search, ShoppingCart, User, Menu, X, MapPin, CreditCard, Bell, Settings, HelpCircle, LogOut, Package, LayoutDashboard, Phone, Send, ShieldCheck } from "lucide-react";
import { Logo } from "./Logo";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function Header({
  active = "/",
  isAuthed: _isAuthed, // Ignored, we compute it internally
}: {
  active?: string;
  isAuthed?: boolean;
}) {
  const { itemCount } = useCart();
  const { ids } = useWishlist();
  const { products, profileSidebarOpen, setProfileSidebarOpen } = useStore();
  const { user, logout } = useAuth();
  const isAuthed = !!user;
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams?.get("q") || "";
  const [q, setQ] = useState(initialQ);
  const [focused, setFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setQ(searchParams?.get("q") || "");
  }, [searchParams]);

  const searchResults = useMemo(() => {
    if (!q.trim()) return [];
    const term = q.toLowerCase();
    return products.filter(p => p.is_active && (
      p.name.toLowerCase().includes(term) || 
      (p.brand ?? '').toLowerCase().includes(term)
    )).slice(0, 6);
  }, [q, products]);

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  return (
    <>
      <div className="h-[60px] sm:h-[106px] w-full shrink-0" />
      <header className="fixed left-0 top-0 w-full z-40 border-b border-navy-100 bg-white/95 backdrop-blur">
        {/* Top Announcement Bar (like khan.store) */}
        <div className="bg-navy-950 text-white/85 border-b border-navy-800 text-[11px] py-1 px-4 hidden sm:block">
          <div className="container-shop flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-gold-400 font-bold tracking-wider">✦ GRAND WATCH SHOP</span>
              <span className="text-white/30">|</span>
              <span className="text-white/75">Eksklyuziv va Sifatli Soatlar Do'koni</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <a href="tel:+998977657180" className="hover:text-gold-400 transition flex items-center gap-1">
                <span className="text-gold-400 font-semibold">+998 97 765 71 80</span>
              </a>
              <span className="text-white/30">|</span>
              <a href="https://t.me/+tX9dQIISDYFlYWVi" target="_blank" rel="noreferrer" className="hover:text-sky-300 transition text-sky-400 font-semibold flex items-center gap-1">
                <span>📢 Telegram Kanal</span>
              </a>
              <span className="text-white/30">|</span>
              <a href="https://t.me/Grandwatch_Admin" target="_blank" rel="noreferrer" className="hover:text-white transition text-white/70">
                Admin: @Grandwatch_Admin
              </a>
            </div>
          </div>
        </div>

        <div className="container-shop flex h-[60px] sm:h-[76px] items-center justify-between gap-3">
          {/* Left: Logo & Desktop Katalog */}
          <div className="flex items-center gap-3 lg:gap-6 lg:w-[280px] shrink-0">
            <Logo hideTextOnMobile={true} />

            <nav className="hidden lg:block ml-2">
              <Link
                href="/products"
                className="group flex items-center gap-2 rounded-full bg-navy-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-gold-500 hover:shadow-lg hover:-translate-y-0.5 touch-target"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="transition-transform group-hover:scale-110"
                >
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
                Katalog
              </Link>
            </nav>
          </div>

          {/* Center: Search (Desktop Only) */}
          <div className="relative hidden lg:flex flex-1 justify-center max-w-xl px-2 lg:px-8">
            <div className="relative w-full">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setFocused(false);
                  router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
                }}
                className={`flex w-full items-center gap-2 rounded-full px-4 py-2.5 transition-all ${
                  focused ? "bg-white shadow-md ring-2 ring-navy-900" : "bg-white border-2 border-navy-100 hover:border-navy-200"
                }`}
              >
                <button type="submit" className="text-navy-900/60 shrink-0 hover:text-navy-900 transition touch-target">
                  <Search size={18} />
                </button>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setTimeout(() => setFocused(false), 200)}
                  placeholder="Qidirish..."
                  className="w-full bg-transparent text-[15px] font-medium text-navy-900 outline-none placeholder:font-normal placeholder:text-navy-900/50 input-touch"
                  autoComplete="off"
                />
              </form>
              
              {focused && q.trim() && (
                <div 
                  onMouseDown={(e) => e.preventDefault()}
                  className="absolute top-[calc(100%+8px)] left-0 w-full rounded-2xl border border-navy-100 bg-white p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  {searchResults.length > 0 ? (
                    <div className="flex flex-col">
                      {searchResults.map(p => (
                        <Link 
                          key={p.id} 
                          href={`/products/${p.slug}`}
                          onClick={() => setFocused(false)}
                          className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-navy-50 transition touch-target"
                        >
                          {p.image ? (
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-navy-50 border border-navy-100/50">
                              <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                            </div>
                          ) : (
                            <div className="h-12 w-12 shrink-0 rounded bg-navy-50" />
                          )}
                          <div className="flex-1 overflow-hidden">
                            <p className="truncate text-sm font-bold text-navy-900">{p.name}</p>
                            <p className="text-sm font-medium text-navy-900/60 mt-0.5">{p.price.toLocaleString("uz-UZ")} so'm</p>
                          </div>
                        </Link>
                      ))}
                      <Link 
                        href={`/search?q=${encodeURIComponent(q)}`}
                        onClick={() => setFocused(false)}
                        className="mt-2 block rounded-xl bg-navy-900 p-2.5 text-center text-sm font-semibold text-white hover:bg-navy-800 transition shadow-sm touch-target"
                      >
                        Barcha natijalarni ko'rish
                      </Link>
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <Search size={24} className="mx-auto mb-2 text-navy-900/20" />
                      <p className="text-sm font-medium text-navy-900/50">Hech narsa topilmadi</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Icons (Desktop + Mobile Sleek Actions) */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3 lg:gap-6">
            {/* Mobile Call button */}
            <a
              href="tel:+998977657180"
              title="Qo'ng'iroq qilish: +998 97 765 71 80"
              className="flex lg:hidden h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 hover:bg-emerald-100 transition active:scale-95 shadow-xs"
            >
              <Phone size={16} />
            </a>

            {/* Mobile Search Toggle */}
            <button
              onClick={() => {
                setSearchOpen(!searchOpen);
                if (mobileMenuOpen) setMobileMenuOpen(false);
              }}
              className={cn(
                "flex h-9 w-9 lg:hidden items-center justify-center rounded-full transition active:scale-95 border",
                searchOpen
                  ? "bg-navy-900 text-white border-navy-900"
                  : "bg-navy-50/80 text-navy-900 border-navy-200/80 hover:bg-navy-100"
              )}
              aria-label="Qidirish"
            >
              {searchOpen ? <X size={17} /> : <Search size={17} />}
            </button>

            {/* Mobile Menu Toggle (Hamburger) */}
            <button
              className={cn(
                "flex lg:hidden h-9 w-9 items-center justify-center rounded-full border transition active:scale-95 shrink-0",
                mobileMenuOpen
                  ? "bg-navy-900 text-white border-navy-900"
                  : "bg-navy-50/80 text-navy-900 border-navy-200/80 hover:bg-navy-100"
              )}
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                if (searchOpen) setSearchOpen(false);
              }}
              aria-label={mobileMenuOpen ? "Yopish" : "Menyu ochish"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            {/* Desktop Wishlist */}
            <Link href="/wishlist" className="relative hidden md:flex items-center gap-2 text-navy-900 hover:text-gold-500 transition">
              <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-navy-50 touch-target">
                <Heart size={20} />
                {ids.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white shadow-sm">
                    {ids.length}
                  </span>
                )}
              </span>
              <span className="hidden text-sm font-bold lg:block">Sevimlilar</span>
            </Link>

            {/* Desktop Cart */}
            <Link href="/cart" className="relative hidden md:flex items-center gap-2 text-navy-900 hover:text-gold-500 transition">
              <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-navy-50 touch-target">
                <ShoppingCart size={20} />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white shadow-sm">
                  {itemCount}
                </span>
              </span>
              <span className="hidden text-sm font-bold lg:block">Savatcha</span>
            </Link>

            {/* Desktop Profile */}
            <Link href={isAuthed ? "/profile" : "/login"} className="hidden lg:flex items-center gap-2 text-navy-900 hover:text-gold-500 transition">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-50 overflow-hidden border border-navy-100 touch-target">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <User size={20} />
                )}
              </span>
              <span className="text-sm font-bold">
                {isAuthed ? (user?.fullName.split(" ")[0] || "Profil") : "Kirish"}
              </span>
            </Link>
          </div>
        </div>

        {/* Mobile Search Dropdown */}
        {searchOpen && (
          <div className="lg:hidden absolute left-0 top-[60px] sm:top-[76px] w-full bg-white/98 backdrop-blur-md border-b border-navy-100 shadow-xl z-50 p-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSearchOpen(false);
                router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
              }}
              className="flex w-full items-center gap-2 rounded-xl border border-navy-200 bg-navy-50/60 px-3 py-2"
            >
              <Search size={18} className="text-navy-900/60 shrink-0" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Soat modeli, brend nomi..."
                className="w-full bg-transparent text-sm font-medium text-navy-900 outline-none placeholder:text-navy-900/40"
                autoComplete="off"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => setQ("")}
                  className="p-1 text-navy-400 hover:text-navy-700"
                >
                  <X size={16} />
                </button>
              )}
              <button
                type="submit"
                className="rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-semibold text-white shadow-xs"
              >
                Qidirish
              </button>
            </form>

            {/* Live Search Results on Mobile */}
            {q.trim() && (
              <div className="mt-2.5 max-h-[55vh] overflow-y-auto divide-y divide-navy-50 rounded-xl border border-navy-100 bg-white p-2">
                {searchResults.length > 0 ? (
                  <>
                    {searchResults.map((p) => (
                      <Link
                        key={p.id}
                        href={`/products/${p.slug}`}
                        onClick={() => {
                          setSearchOpen(false);
                          setQ("");
                        }}
                        className="flex items-center gap-3 py-2 px-2 hover:bg-navy-50 transition rounded-lg"
                      >
                        {p.image ? (
                          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-navy-50 border border-navy-100/60">
                            <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                          </div>
                        ) : (
                          <div className="h-11 w-11 shrink-0 rounded-lg bg-navy-50" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-xs font-bold text-navy-900">{p.name}</p>
                          <p className="text-xs font-semibold text-navy-900/60 mt-0.5">
                            {p.price.toLocaleString("uz-UZ")} so'm
                          </p>
                        </div>
                      </Link>
                    ))}
                    <Link
                      href={`/search?q=${encodeURIComponent(q)}`}
                      onClick={() => {
                        setSearchOpen(false);
                        setQ("");
                      }}
                      className="mt-2 block rounded-lg bg-navy-900 py-2 text-center text-xs font-semibold text-white hover:bg-navy-800 transition"
                    >
                      Barcha natijalarni ko'rish
                    </Link>
                  </>
                ) : (
                  <p className="py-4 text-center text-xs text-navy-900/50">Mahsulot topilmadi</p>
                )}
              </div>
            )}
          </div>
        )}
      </header>

      {/* Sidebar (Drawer) */}
      <div className={cn(
        "fixed inset-0 z-[100] lg:hidden transition-all duration-300 ease-in-out",
        mobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"
      )}>
        {/* Backdrop */}
        <div 
          className={cn(
            "absolute inset-0 bg-navy-950/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out",
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setMobileMenuOpen(false)}
        />
        
        {/* Sidebar */}
        <div className={cn(
          "absolute left-0 top-0 bottom-0 w-[300px] max-w-[85vw] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex items-center justify-between p-4 border-b border-navy-100 shrink-0 bg-navy-50/40">
            <Logo hideTextOnMobile={false} />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-navy-200/80 text-navy-900 shadow-xs hover:bg-navy-100 transition active:scale-95"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* Quick Contact Box */}
            <div className="rounded-xl border border-navy-100 bg-navy-50/70 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-navy-900/60">Bog'lanish</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Har kuni 09:00 - 21:00
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <a
                  href="tel:+998977657180"
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-white border border-navy-200/80 py-2 text-xs font-bold text-navy-900 shadow-xs hover:bg-navy-50 transition active:scale-95"
                >
                  <Phone size={13} className="text-emerald-600" />
                  Qo'ng'iroq
                </a>
                <a
                  href="https://t.me/Grandwatch_Admin"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-navy-900 py-2 text-xs font-bold text-white shadow-xs hover:bg-navy-800 transition active:scale-95"
                >
                  <Send size={13} />
                  Admin
                </a>
              </div>

              {/* Mobile Telegram Channel Banner */}
              <a
                href="https://t.me/+tX9dQIISDYFlYWVi"
                target="_blank"
                rel="noreferrer"
                className="mt-2.5 flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[#0088cc] to-[#2AABEE] text-white shadow-xs hover:opacity-95 transition active:scale-[0.98]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                    <Send size={14} />
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-tight flex items-center gap-1">
                      Telegram Kanalimiz
                      <span className="text-[9px] bg-white text-navy-950 font-extrabold px-1.5 py-0.2 rounded-sm">VIP</span>
                    </div>
                    <div className="text-[10px] text-white/80">Yangi soatlar va chegirmalar</div>
                  </div>
                </div>
                <span className="text-[11px] font-bold bg-white/25 px-2 py-0.5 rounded-md">A'zo bo'lish</span>
              </a>
            </div>

            {/* Quick Categories Navigation */}
            <div>
              <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-navy-900/50">
                Kategoriyalar
              </h3>
              <div className="grid grid-cols-2 gap-1.5">
                <Link
                  href="/products?cat=erkaklar"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl bg-navy-50/70 p-2.5 text-xs font-semibold text-navy-900 hover:bg-navy-100 transition"
                >
                  <span>⌚</span> Erkaklar
                </Link>
                <Link
                  href="/products?cat=ayollar"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl bg-navy-50/70 p-2.5 text-xs font-semibold text-navy-900 hover:bg-navy-100 transition"
                >
                  <span>✨</span> Ayollar
                </Link>
                <Link
                  href="/products?cat=smart-soatlar"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl bg-navy-50/70 p-2.5 text-xs font-semibold text-navy-900 hover:bg-navy-100 transition"
                >
                  <span>⚡</span> Smart soatlar
                </Link>
                <Link
                  href="/products?sale=1"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl bg-red-50 p-2.5 text-xs font-semibold text-danger hover:bg-red-100 transition"
                >
                  <span>🔥</span> Aksiyalar
                </Link>
              </div>
            </div>

            {/* Main Store Links */}
            <div>
              <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-navy-900/50">
                Do'kon
              </h3>
              <div className="space-y-1">
                <Link
                  href="/products"
                  className="flex items-center gap-3 rounded-xl bg-navy-900 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-gold-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                  Barcha soatlar (Katalog)
                </Link>
                <Link
                  href="/wishlist"
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-navy-900 hover:bg-navy-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Heart size={18} />
                  Sevimlilar
                  {ids.length > 0 && (
                    <span className="ml-auto flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
                      {ids.length}
                    </span>
                  )}
                </Link>
                <Link
                  href="/cart"
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-navy-900 hover:bg-navy-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ShoppingCart size={18} />
                  Savatcha
                  {itemCount > 0 && (
                    <span className="ml-auto flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
                      {itemCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Profile Links */}
            <div>
              <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-navy-900/50">
                {isAuthed ? "Profil" : "Hisob"}
              </h3>
              <div className="space-y-1">
                {!isAuthed ? (
                  <>
                    <Link
                      href="/login"
                      className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-navy-900 hover:bg-navy-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User size={18} />
                      Kirish / Ro'yxatdan o'tish
                    </Link>
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-gold-600 bg-gold-500/10 hover:bg-gold-500/20"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LayoutDashboard size={18} className="text-gold-500" />
                      Admin panel
                    </Link>
                  </>
                ) : (
                  <>
                    {(user?.role === "admin" || user?.role === "super_admin") && (
                      <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-navy-900 hover:bg-navy-50">
                        <LayoutDashboard size={18} /> Boshqaruv paneli
                      </Link>
                    )}
                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-navy-900 hover:bg-navy-50">
                      <User size={18} /> Asosiy ma'lumotlar
                    </Link>
                    <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-navy-900 hover:bg-navy-50">
                      <Package size={18} /> Buyurtmalar
                    </Link>
                    <Link href="/profile?tab=address" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-navy-900 hover:bg-navy-50">
                      <MapPin size={18} /> Manzillar
                    </Link>
                    <button 
                      onClick={() => { 
                        setMobileMenuOpen(false); 
                        logout(); 
                        router.push("/"); 
                      }} 
                      className="w-full mt-2 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-danger hover:bg-danger/10 transition"
                    >
                      <LogOut size={18} /> Chiqish
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Quality badge */}
            <div className="pt-3 border-t border-navy-100 flex items-center gap-2 text-xs text-navy-900/65 font-medium">
              <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
              <span>100% asl sifat & 12 oy kafolat</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}