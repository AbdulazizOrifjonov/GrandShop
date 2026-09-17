import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { StoreProvider } from "@/lib/store";
import { AuthProvider } from "@/lib/auth";

import { ToastProvider } from "@/context/ToastContext";
import { MobileBottomNav } from "@/components/shop/MobileBottomNav";

export const metadata: Metadata = {
  title: "Grand Watch Shop — Premium soatlar do'koni",
  description:
    "Grand Watch Shop — eng sifatli va zamonaviy soatlar. Tissot, Rolex, Casio, Seiko va boshqa premium brendlar bir joyda.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uz">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-white text-navy-900" suppressHydrationWarning>
        <ToastProvider>
          <StoreProvider>
            <AuthProvider>
              <CartProvider>
                <WishlistProvider>
                  <Suspense fallback={<div className="min-h-screen" />}>
                    <div className="pb-24 md:pb-0">{children}</div>
                  </Suspense>
                  <MobileBottomNav />
                </WishlistProvider>
              </CartProvider>
            </AuthProvider>
          </StoreProvider>
        </ToastProvider>
      </body>
    </html>
  );
}