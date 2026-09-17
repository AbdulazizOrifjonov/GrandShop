"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { Heart, Search, ShoppingCart, User, Menu, X, MapPin, CreditCard, Bell, Settings, HelpCircle, LogOut, Package, LayoutDashboard } from "lucide-react";
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
    )).slice(0, 5);
  }, [q, products]);

  const isAdmin = user?.role === "super_admin" || user?.role === "moderator" || user?.role === "content_admin";

  return (
    <>
      <div className="h-[76px] w-full shrink-0" />
      <header className="fixed left-0 top-0 w-full z-40 border-b border-navy-100 bg-white/95 backdrop-blur">
        <div className="container-shop flex h-[76px] items-center justify-between gap-4">
          {/* Left: Logo & Menu & Desktop Katalog */}
          <div className="flex items-center gap-4 lg:gap-6 lg:w-[280px] shrink-0">
            <Logo hideTextOnMobile={true} />
            
            {/* Mobile Hamburger */}
            <button
              className="flex lg:hidden h-10 w-16 items-center justify-center rounded-xl border border-navy-200 bg-white shadow-sm text-navy-900 hover:bg-navy-50 transition touch-target shrink-0"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Yopish" : "Menyu ochish"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>



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

          {/* Right: Icons */}
          <div className="flex shrink-0 items-center gap-3 lg:gap-6">
            <button
              onClick={() => {
                setSearchOpen(!searchOpen);
                if (mobileMenuOpen) setMobileMenuOpen(false);
              }}
              className="flex h-10 w-10 lg:hidden items-center justify-center rounded-full bg-navy-50 text-navy-900 border border-navy-100 touch-target"
            >
              {searchOpen ? <X size={20} /> : <Search size={20} />}
            </button>

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

                <Link href="/cart" className="relative hidden md:flex items-center gap-2 text-navy-900 hover:text-gold-500 transition">
                  <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-navy-50 touch-target">
                    <ShoppingCart size={20} />
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white shadow-sm">
                      {itemCount}
                    </span>
                  </span>
                  <span className="hidden text-sm font-bold lg:block">Savatcha</span>
                </Link>

            <Link href={isAuthed ? "/profile" : "/login"} className="flex items-center gap-2 text-navy-900 hover:text-gold-500 transition">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-50 overflow-hidden border border-navy-100 touch-target">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <User size={20} />
                )}
              </span>
              <span className="hidden text-sm font-bold lg:block">
                {isAuthed ? (user?.fullName.split(" ")[0] || "Profil") : "Kirish"}
              </span>
            </Link>
          </div>
        </div>

        {/* Mobile Search Dropdown */}
        {searchOpen && (
          <div className="lg:hidden absolute left-0 top-[76px] w-full bg-white border-b border-navy-100 shadow-md animate-slide-down">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSearchOpen(false);
                router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
              }}
              className="flex w-full items-center gap-3 px-6 py-4"
            >
              <button type="submit" className="text-navy-900 shrink-0">
                <Search size={20} />
              </button>
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Qidirish..."
                className="w-full bg-transparent text-base font-medium text-navy-900 outline-none border-none focus:outline-none focus:ring-0 ring-0 p-0 placeholder:font-normal placeholder:text-navy-900/40"
                autoComplete="off"
              />
            </form>
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
          "absolute left-0 top-0 bottom-0 w-[280px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex items-center justify-between p-4 border-b border-navy-100 shrink-0">
              <Logo hideTextOnMobile={false} />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-50 text-navy-900"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {/* Main Store Links */}
              <div className="space-y-1 mb-8">
                <Link
                  href="/products"
                  className="flex items-center gap-3 rounded-xl bg-navy-900 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-gold-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                  Katalog
                </Link>
                <Link
                  href="/wishlist"
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-navy-900 hover:bg-navy-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Heart size={20} />
                  Sevimlilar
                  {ids.length > 0 && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
                      {ids.length}
                    </span>
                  )}
                </Link>
                <Link
                  href="/cart"
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-navy-900 hover:bg-navy-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ShoppingCart size={20} />
                  Savatcha
                  {itemCount > 0 && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
                      {itemCount}
                    </span>
                  )}
                </Link>
              </div>

              {/* Profile Links */}
              <div>
                <h3 className="mb-2 px-4 text-xs font-bold uppercase tracking-wider text-navy-900/40">
                  {isAuthed ? "Profil" : "Hisob"}
                </h3>
                <div className="space-y-1">
                  {!isAuthed ? (
                    <Link
                      href="/login"
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-navy-900 hover:bg-navy-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User size={20} />
                      Kirish / Ro'yxatdan o'tish
                    </Link>
                  ) : (
                    <>
                      {(user?.role === "super_admin" || user?.role === "moderator" || user?.role === "content_admin") && (
                        <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-navy-900 hover:bg-navy-50">
                          <LayoutDashboard size={20} /> Boshqaruv paneli
                        </Link>
                      )}
                      <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-navy-900 hover:bg-navy-50">
                        <User size={20} /> Asosiy ma'lumotlar
                      </Link>
                      <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-navy-900 hover:bg-navy-50">
                        <Package size={20} /> Buyurtmalar
                      </Link>
                      <Link href="/profile?tab=address" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-navy-900 hover:bg-navy-50">
                        <MapPin size={20} /> Manzillar
                      </Link>
                      <Link href="/profile?tab=payment" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-navy-900 hover:bg-navy-50">
                        <CreditCard size={20} /> To'lov usullari
                      </Link>
                      <Link href="/profile?tab=notifications" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-navy-900 hover:bg-navy-50">
                        <Bell size={20} /> Bildirishnomalar
                      </Link>
                      <Link href="/profile?tab=settings" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-navy-900 hover:bg-navy-50">
                        <Settings size={20} /> Sozlamalar
                      </Link>
                      <Link href="/profile?tab=help" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-navy-900 hover:bg-navy-50">
                        <HelpCircle size={20} /> Yordam
                      </Link>
                      <button 
                        onClick={() => { 
                          setMobileMenuOpen(false); 
                          logout(); 
                          router.push("/"); 
                        }} 
                        className="w-full mt-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-danger hover:bg-danger/10 transition"
                      >
                        <LogOut size={20} /> Chiqish
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
      </div>
    </>
  );
}