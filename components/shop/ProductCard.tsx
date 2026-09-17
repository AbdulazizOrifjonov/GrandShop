"use client";
import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { Product } from "@/types/database";
import { formatSom, calcDiscount, cn } from "@/lib/utils";
import { RatingStars } from "./RatingStars";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/lib/store";

export function ProductCard({
  product,
  variant = "compact",
}: {
  product: Product;
  variant?: "compact" | "full";
}) {
  const { isWished, toggle } = useWishlist();
  const { addItem, items, updateQuantity } = useCart();
  const { categories } = useStore();
  
  const cartItem = items.find((i) => i.productId === product.id);

  const categoryName =
    product.category?.name ??
    categories.find((c) => c.id === product.category_id)?.name ??
    "";
  const wished = isWished(product.id);
  const discount = product.discount ?? calcDiscount(product.price, product.old_price);
  const outOfStock = product.stock <= 0;

  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const images = useMemo(() => {
    const all = [product.image, ...(product.images?.map(i => i.url) || [])].filter(Boolean) as string[];
    return all.length > 0 ? all : [];
  }, [product]);

  const handleNext = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const onTouchStartHandler = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMoveHandler = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) handleNext();
    if (isRightSwipe) handlePrev();
  };

  return (
    <div
      className={cn(
        "group relative rounded-xl border border-navy-100 bg-white p-3 transition-shadow hover:shadow-lg card-touch",
        variant === "full" ? "flex flex-row gap-4" : "flex h-full flex-col"
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-lg bg-navy-50 shrink-0",
          variant === "full" ? "h-40 w-40 md:h-48 md:w-48" : "mb-3 aspect-square w-full"
        )}
      >
        {(discount > 0 || product.is_new) && (
          <span
            className={cn(
              "absolute left-2 top-2 z-20 rounded px-2 py-0.5 text-[11px] font-semibold text-white",
              discount > 0 ? "bg-danger" : "bg-info"
            )}
          >
            {discount > 0 ? `-${discount}%` : "Yangi"}
          </span>
        )}
        <button
          onClick={() => toggle(product.id)}
          aria-label="Sevimlilarga qo'shish"
          className="absolute right-2 top-2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:bg-white touch-target"
        >
          <Heart
            size={18}
            className={wished ? "fill-danger text-danger" : "text-navy-900"}
          />
        </button>

        <Link 
          href={`/products/${product.slug}`} 
          className="relative block h-full w-full z-10"
          onTouchStart={images.length > 1 ? onTouchStartHandler : undefined}
          onTouchMove={images.length > 1 ? onTouchMoveHandler : undefined}
          onTouchEnd={images.length > 1 ? onTouchEndHandler : undefined}
        >
          {images.length > 0 ? (
            <>
              {images.map((src, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "absolute inset-0 h-full w-full transition-opacity duration-300", 
                    idx === activeIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                  )}
                >
                  <Image
                    src={src}
                    alt={`${product.name} - ${idx + 1}`}
                    fill
                    sizes={variant === "full" ? "200px" : "(max-width: 480px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"}
                    className="object-cover"
                  />
                </div>
              ))}
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-navy-900/30 bg-navy-50 absolute inset-0 z-10">
              No image
            </div>
          )}
        </Link>
        
        {/* Slider Controls */}
        {images.length > 1 && (
          <>
            <button 
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/70 shadow-sm hover:bg-white text-navy-900 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/70 shadow-sm hover:bg-white text-navy-900 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
              {images.map((_, idx) => (
                <div 
                  key={idx} 
                  className={cn("h-1.5 rounded-full transition-all", idx === activeIndex ? "w-3 bg-white" : "w-1.5 bg-white/50")}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col mt-2 sm:mt-0">
        <Link href={`/products/${product.slug}`} className="mb-1 line-clamp-2 text-[13px] sm:text-sm font-semibold text-navy-900 hover:text-gold-500 md:text-base leading-snug">
          {product.name}
        </Link>
        <p className="mb-1.5 text-[10px] sm:text-xs text-navy-900/50 md:text-sm">{categoryName}</p>
        <RatingStars rating={product.rating ?? 0} reviews={product.reviews_count} />
        
        {variant === "full" && (
          <p className="mt-3 hidden text-sm text-navy-900/70 md:line-clamp-2">
            {product.description}
          </p>
        )}

        <div className={cn("mt-auto pt-3", variant === "full" ? "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" : "")}>
          <div className={cn("mb-2", variant === "full" ? "mb-0" : "")}>
            <div className="text-[13px] sm:text-[15px] md:text-lg font-bold text-navy-900 leading-tight">
              {formatSom(product.price)}
            </div>
            {product.old_price && product.old_price > product.price && (
              <div className="text-[10px] sm:text-xs text-navy-900/40 line-through">
                {formatSom(product.old_price)}
              </div>
            )}
          </div>

          <div className={variant === "full" ? "w-full sm:w-auto sm:min-w-[180px]" : ""}>
            {cartItem ? (
              <div className="flex h-9 sm:h-11 w-full items-center justify-between gap-1 sm:gap-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    updateQuantity(product.id, cartItem.quantity - 1);
                  }}
                  className="flex h-full flex-1 items-center justify-center rounded-md sm:rounded-lg bg-navy-900 text-lg sm:text-xl font-medium text-white transition hover:bg-navy-800"
                >
                  -
                </button>
                <div className="flex h-full w-10 sm:w-14 shrink-0 items-center justify-center rounded-md sm:rounded-lg border border-navy-900/20 text-[13px] sm:text-[15px] font-bold text-navy-900 bg-white">
                  {cartItem.quantity}
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    updateQuantity(product.id, cartItem.quantity + 1);
                  }}
                  disabled={cartItem.quantity >= product.stock}
                  className="flex h-full flex-1 items-center justify-center rounded-md sm:rounded-lg bg-navy-900 text-lg sm:text-xl font-medium text-white transition hover:bg-navy-800 disabled:opacity-40"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  addItem(product.id);
                }}
                disabled={outOfStock}
                className="flex h-9 sm:h-11 w-full items-center justify-center gap-1.5 sm:gap-2 rounded-md sm:rounded-lg bg-navy-900 px-2 sm:px-4 text-[11px] sm:text-sm font-medium text-white transition hover:bg-navy-800 disabled:opacity-40"
              >
                <ShoppingCart size={14} className="sm:w-4 sm:h-4" />
                <span>
                  <span className="hidden sm:inline">{outOfStock ? "Tugagan" : "Savatchaga qo'shish"}</span>
                  <span className="sm:hidden">{outOfStock ? "Yo'q" : "Savatchaga"}</span>
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
