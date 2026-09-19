"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { useToast } from "@/context/ToastContext";
import { useStore } from "@/lib/store";

interface WishlistContextValue {
  ids: string[];
  toggle: (productId: string) => void;
  isWished: (productId: string) => boolean;
  remove: (productId: string) => void;
  clear: () => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);
const STORAGE_KEY = "gws_wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const { showToast } = useToast();
  const { products, ready } = useStore();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setIds(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // Bazadan o'chirilgan yoki mavjud bo'lmagan mahsulotlarni avtomatik tozalash
  useEffect(() => {
    if (!hydrated || !ready || products.length === 0) return;
    setIds((prev) => {
      const valid = prev.filter((id) => products.some((p) => p.id === id));
      if (valid.length !== prev.length) return valid;
      return prev;
    });
  }, [hydrated, ready, products]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, [ids, hydrated]);

  const toggle = useCallback((productId: string) => {
    setIds((prev) => {
      const isIncluded = prev.includes(productId);
      if (isIncluded) {
        showToast("Sevimlilardan olib tashlandi", "info");
        return prev.filter((id) => id !== productId);
      } else {
        showToast("Sevimlilarga qo'shildi", "success");
        return [...prev, productId];
      }
    });
  }, [showToast]);

  const remove = useCallback((productId: string) => {
    setIds((prev) => prev.filter((id) => id !== productId));
  }, []);

  const clear = useCallback(() => setIds([]), []);

  const isWished = useCallback((productId: string) => ids.includes(productId), [ids]);

  return (
    <WishlistContext.Provider value={{ ids, toggle, isWished, remove, clear }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
