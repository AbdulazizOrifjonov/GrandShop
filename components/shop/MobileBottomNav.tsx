"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Heart, ShoppingCart, LayoutGrid } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { ids } = useWishlist();

  if (pathname?.startsWith("/admin")) return null;

  const navItems = [
    { href: "/", label: "Asosiy", icon: Home },
    { href: "/products", label: "Katalog", icon: LayoutGrid },
    { href: "/wishlist", label: "Sevimlilar", icon: Heart, badge: ids.length },
    { href: "/cart", label: "Savatcha", icon: ShoppingCart, badge: itemCount },
  ];

  return (
    <div 
      className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-navy-100 bg-white md:hidden shadow-[0_-4px_10px_rgba(0,0,0,0.05)]"
      style={{ 
        height: 'calc(65px + env(safe-area-inset-bottom))',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      {navItems.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center h-full w-full gap-[2px] transition-colors",
              isActive ? "text-navy-900" : "text-navy-900/40 active:text-navy-900"
            )}
            onClick={() => {
              if (item.href === pathname) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            <div className="relative flex items-center justify-center">
              <item.icon size={22} strokeWidth={1.75} className={isActive && item.icon === Heart ? "fill-navy-900" : ""} />
              {!!item.badge && item.badge > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold text-nowrap mt-1">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}