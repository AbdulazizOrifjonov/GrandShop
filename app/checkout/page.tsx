"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { formatSom } from "@/lib/utils";

export default function CheckoutPage() {
  const { items, clear } = useCart();
  const { products, createOrder } = useStore();
  const { user } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [address, setAddress] = useState(user?.address ?? "");
  const [note, setNote] = useState("");
  const [placedOrder, setPlacedOrder] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number; min_order_amount: number } | null>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("gws_applied_promo");
      if (saved) {
        setAppliedPromo(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const detailed = items
    .map((i) => ({ item: i, product: products.find((p) => p.id === i.productId) }))
    .filter((x) => x.product);

  const subtotal = detailed.reduce((sum, x) => sum + x.product!.price * x.item.quantity, 0);
  const discountAmount = appliedPromo && subtotal >= appliedPromo.min_order_amount ? appliedPromo.discount : 0;
  const deliveryFee = subtotal >= 500000 || subtotal === 0 ? 0 : 30000;
  const total = Math.max(0, subtotal - discountAmount) + deliveryFee;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName || !phone || !address) {
      setError("Iltimos, barcha majburiy maydonlarni to'ldiring.");
      return;
    }
    if (detailed.length === 0) {
      setError("Savatchangiz bo'sh.");
      return;
    }
    
    const itemsData = detailed.map((d) => ({
      id: d.product!.id,
      name: d.product!.name,
      image: d.product!.image || (d.product!.images && d.product!.images[0]) || null,
      quantity: d.item.quantity,
      price: d.product!.price,
      slug: d.product!.slug,
    }));

    try {
      await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phone,
          address,
          note,
          items: itemsData,
          subtotal,
          discount: discountAmount,
          promoCode: appliedPromo?.code || null,
          total,
          deliveryFee
        })
      });
    } catch (err) {
      console.error("Failed to send order to telegram", err);
    }

    const order = createOrder({
      user_id: user?.id ?? null,
      full_name: fullName,
      phone,
      address,
      note: note ? (appliedPromo ? `${note} (Promokod: ${appliedPromo.code})` : note) : (appliedPromo ? `Promokod: ${appliedPromo.code}` : null),
      subtotal,
      delivery_fee: deliveryFee,
      discount: discountAmount,
      total,
      items: detailed.map((d) => ({
        id: "",
        order_id: "",
        product_id: d.product!.id,
        product_name: d.product!.name,
        product_image: d.product!.image,
        price: d.product!.price,
        quantity: d.item.quantity,
      })),
    });
    clear();
    try { sessionStorage.removeItem("gws_applied_promo"); } catch {}
    setPlacedOrder(order.order_number);
  }

  if (placedOrder) {
    return (
      <div className="min-h-screen bg-white">
        <Header active="/products" />
        <div className="container-shop flex flex-col items-center py-24 text-center">
          <CheckCircle2 size={64} className="mb-6 text-success" />
          <h1 className="font-serif text-3xl font-bold text-navy-900">Buyurtmangiz qabul qilindi!</h1>
          <p className="mt-2 max-w-md text-navy-900/60">
            Buyurtma raqami: <span className="font-semibold text-navy-900">#{placedOrder}</span>. Tez orada operatorlarimiz siz bilan bog'lanadi.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/orders" className="rounded-lg bg-navy-900 px-6 py-3 text-sm font-medium text-white">
              Buyurtmalarim
            </Link>
            <Link href="/products" className="rounded-lg border border-navy-100 px-6 py-3 text-sm font-medium">
              Xaridni davom ettirish
            </Link>
          </div>

          {/* Telegram Channel Community Invite */}
          <div className="mt-10 max-w-md w-full p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-sky-100/50 border border-sky-200/80 text-center shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#0088cc]">VIP Jamiyat</p>
            <h3 className="text-base font-bold text-navy-900 mt-1">Rasmiy Telegram Kanalimizga qo'shiling</h3>
            <p className="text-xs text-navy-900/60 mt-1">
              Yangi kelgan soatlar, jonli video-obzorlar va faqat obunachilar uchun maxsus chegirmalar!
            </p>
            <a
              href="https://t.me/+tX9dQIISDYFlYWVi"
              target="_blank"
              rel="noreferrer"
              className="mt-3.5 inline-flex items-center gap-2 rounded-xl bg-[#2AABEE] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#2298D6] transition"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Telegram kanalga a'zo bo'lish 🚀
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header active="/products" />
      <div className="container-shop py-8">
        <h1 className="mb-6 font-serif text-3xl font-bold text-navy-900">Buyurtmani rasmiylashtirish</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4 rounded-xl border border-navy-100 p-6">
            <h2 className="text-lg font-bold">Yetkazib berish ma'lumotlari</h2>
            <div>
              <label className="mb-1 block text-sm font-medium">To'liq ism *</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm"
                placeholder="Ism Familiya"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Telefon raqam *</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm"
                placeholder="+998 90 123 45 67"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Manzil *</label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm"
                placeholder="Shahar, tuman, ko'cha, uy raqami"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Qo'shimcha izoh</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm"
                placeholder="Kuryerga izoh (ixtiyoriy)"
              />
            </div>
            <div className="rounded-lg bg-navy-50 p-3 text-xs text-navy-900/60">
              To'lov naqd yoki yetkazib berilganda amalga oshiriladi. Onlayn to'lov tizimi hozircha mavjud emas.
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
          </div>

          <aside className="h-fit space-y-4 rounded-xl border border-navy-100 p-6">
            <h2 className="text-lg font-bold">Buyurtma tarkibi</h2>
            <div className="max-h-64 space-y-3 overflow-y-auto">
              {detailed.map(({ item, product }) => (
                <div key={item.productId} className="flex items-center gap-3 text-sm">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-navy-50">
                    {product!.image && <Image src={product!.image} alt="" fill className="object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{product!.name}</p>
                    <p className="text-xs text-navy-900/50">{item.quantity} x {formatSom(product!.price)}</p>
                  </div>
                  <p className="font-semibold">{formatSom(product!.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2 border-t border-navy-100 pt-3 text-sm">
              <div className="flex justify-between"><span className="text-navy-900/60">Mahsulotlar</span><span>{formatSom(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-navy-900/60">Yetkazib berish</span><span>{deliveryFee ? formatSom(deliveryFee) : "Bepul"}</span></div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-success font-semibold">
                  <span>Chegirma ({appliedPromo?.code})</span>
                  <span>- {formatSom(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold"><span>Jami</span><span>{formatSom(total)}</span></div>
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-navy-900 py-3 text-sm font-medium text-white hover:bg-navy-800"
            >
              Buyurtmani tasdiqlash
            </button>
          </aside>
        </form>
      </div>
      <Footer />
    </div>
  );
}
