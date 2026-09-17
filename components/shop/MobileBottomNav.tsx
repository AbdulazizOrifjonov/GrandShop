"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Heart, ShoppingCart, Grid } from "lucide-react";
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
    { href: "/products", label: "Katalog", icon: Grid },
    { href: "/wishlist", label: "Sevimlilar", icon: Heart, badge: ids.length },
    { href: "/cart", label: "Savatcha", icon: ShoppingCart, badge: itemCount },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-50 flex h-16 w-full items-center justify-around border-t border-navy-100 bg-white md:hidden pb-safe ios-safe-bottom nav-touch">
      {navItems.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex flex-col items-center justify-center w-full h-full gap-1 transition-colors touch-target",
              isActive ? "text-navy-900" : "text-navy-900/40 active:text-navy-900"
            )}
            onClick={() => {
              if (item.href === pathname) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            <div className="relative flex items-center justify-center touch-target-lg">
              <item.icon size={22} className={isActive && item.icon === Heart ? "fill-navy-900" : ""} />
              {!!item.badge && item.badge > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold text-nowrap">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}