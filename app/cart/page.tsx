"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { QuantitySelector } from "@/components/shop/QuantitySelector";
import { ProductCard } from "@/components/shop/ProductCard";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/lib/store";
import { formatSom } from "@/lib/utils";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clear } = useCart();
  const { products } = useStore();
  const [promo, setPromo] = useState("");

  const detailed = items
    .map((i) => ({ item: i, product: products.find((p) => p.id === i.productId) }))
    .filter((x) => x.product);

  const subtotal = detailed.reduce((sum, x) => sum + (x.product!.price * x.item.quantity), 0);
  const freeDelivery = subtotal >= 500000 || subtotal === 0;
  const total = subtotal;

  const suggestions = products.filter((p) => !items.some((i) => i.productId === p.id)).slice(0, 5);

  return (
    <div className="min-h-screen bg-white">
      <Header active="/products" />

      <div className="container-shop py-4 text-sm text-navy-900/50">
        <Link href="/">Bosh sahifa</Link> <span className="mx-1">›</span>
        <span className="text-navy-900">Savatcha</span>
      </div>

      <div className="container-shop grid grid-cols-1 gap-8 pb-16 lg:grid-cols-[1fr_380px] lg:items-start">
        <div>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h1 className="font-serif text-3xl font-bold text-navy-900">Savatcha</h1>
              <p className="text-sm text-navy-900/50">Siz tanlagan mahsulotlar</p>
            </div>
            {detailed.length > 0 && (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-navy-900/50">{detailed.length} ta mahsulot</span>
                <button onClick={clear} className="flex items-center gap-1 text-navy-900/70 hover:text-danger">
                  <Trash2 size={14} /> Barchasini o'chirish
                </button>
              </div>
            )}
          </div>

          {detailed.length === 0 ? (
            <div className="rounded-xl border border-dashed border-navy-100 py-20 text-center">
              <p className="mb-4 text-navy-900/50">Savatchangiz bo'sh.</p>
              <Link href="/products" className="rounded-full bg-navy-900 px-6 py-3 text-sm font-medium text-white">
                Xarid qilishni boshlash
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {detailed.map(({ item, product }) => (
                <div key={item.productId} className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-navy-100 p-3 sm:p-4">
                  <div className="flex items-start gap-3 sm:gap-4 flex-1">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-navy-50">
                      {product!.image && <Image src={product!.image} alt={product!.name} fill className="object-cover" />}
                    </div>
                    <div className="flex-1 pr-2 sm:pr-0">
                      <Link href={`/products/${product!.slug}`} className="font-semibold text-navy-900 hover:text-gold-500 line-clamp-2 leading-tight">
                        {product!.name}
                      </Link>
                      <p className="mt-1 text-xs text-navy-900/50">
                        {product!.brand} {product!.mechanism ? `| Mexanizm: ${product!.mechanism}` : ""}
                      </p>
                      <span className="mt-1 inline-flex items-center gap-1 text-xs text-success">
                        {product!.stock > 0 ? "✓ Mavjud" : "Tugagan"}
                      </span>
                    </div>
                    {/* Mobile Trash */}
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="sm:hidden text-navy-900/40 hover:text-danger flex shrink-0 items-center justify-center h-8 w-8 rounded-full hover:bg-danger/10 transition-colors -mt-1 -mr-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div className="flex w-full items-center justify-between sm:justify-end gap-4 border-t sm:border-0 border-navy-100 pt-3 sm:pt-0 mt-2 sm:mt-0">
                    <QuantitySelector
                      value={item.quantity}
                      onChange={(v) => updateQuantity(item.productId, v)}
                      max={product!.stock || 99}
                    />
                    <div className="font-semibold text-navy-900 whitespace-nowrap text-right">
                      {formatSom(product!.price * item.quantity)}
                    </div>
                    {/* Desktop Trash */}
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="hidden sm:flex text-navy-900/40 hover:text-danger shrink-0 items-center justify-center h-8 w-8 rounded-full hover:bg-danger/10 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="sticky top-[100px] self-start space-y-4 rounded-xl border border-navy-100 p-5">
          <h2 className="text-lg font-bold text-navy-900">Buyurtma haqida</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-navy-900/60">Mahsulotlar ({detailed.length} ta)</span>
              <span>{formatSom(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy-900/60">Yetkazib berish</span>
              <span className={freeDelivery ? "text-success" : ""}>{freeDelivery ? "Bepul" : formatSom(30000)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy-900/60">Chegirma</span>
              <span>- 0 so'm</span>
            </div>
          </div>
          <div className="flex justify-between border-t border-navy-100 pt-3 text-lg font-bold">
            <span>Jami</span>
            <span>{formatSom(total + (freeDelivery ? 0 : 30000))}</span>
          </div>
          <Link
            href="/checkout"
            className={`block rounded-lg py-3 text-center font-medium text-white ${
              detailed.length === 0 ? "pointer-events-none bg-navy-900/30" : "bg-navy-900 hover:bg-navy-800"
            }`}
          >
            Buyurtmani rasmiylashtirish →
          </Link>

          <div>
            <p className="mb-1 flex items-center gap-2 text-sm font-medium text-navy-900">
              Promokod
            </p>
            <div className="flex gap-2">
              <input
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
                placeholder="Promokod"
                className="flex-1 rounded-lg border border-navy-100 px-3 py-2 text-sm"
              />
              <button className="rounded-lg bg-navy-900 px-4 text-sm font-medium text-white">Qo'llash</button>
            </div>
          </div>

          <div className="rounded-lg bg-navy-50 p-3 text-xs text-navy-900/70">
            🚚 Bepul yetkazib berish — 500 000 so'mdan yuqori buyurtmalarda
          </div>
        </aside>
      </div>

      {suggestions.length > 0 && (
        <div className="container-shop pb-16">
          <h2 className="mb-4 text-lg font-bold text-navy-900">Sizga tavsiya etamiz</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {suggestions.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
