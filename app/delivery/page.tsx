"use client";

import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { Truck, Clock, ShieldCheck, MapPin } from "lucide-react";
import Link from "next/link";

export default function DeliveryPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Header Banner */}
      <section className="relative flex h-[200px] items-center overflow-hidden bg-navy-950 text-white">
        <div className="container-shop">
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">Xizmatlar</p>
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-bold">Yetkazib berish xizmati</h1>
          <p className="mt-2 text-white/70">O'zbekiston bo'ylab tezkor va xavfsiz yetkazish</p>
        </div>
      </section>

      <div className="container-shop py-12 max-w-4xl">
        {/* Info Card */}
        <div className="rounded-2xl border border-navy-100 bg-navy-50/60 p-6 sm:p-8 mb-10 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold-500 text-navy-950 shadow-sm">
              <Truck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-navy-900">Yetkazib berish narxi: Kelishilgan holda</h2>
              <p className="mt-2 text-sm sm:text-base text-navy-900/75 leading-relaxed">
                Grand Watch Shop do'konida barcha yetkazib berish xizmatlari mijozning manzili va qulayligiga qarab <strong>kelishilgan holda</strong> amalga oshiriladi. Buyurtma berganingizdan so'ng, operatorimiz siz bilan bog'lanib eng qulay yetkazish muddatini va shartlarini muvofiqlashtiradi.
              </p>
            </div>
          </div>
        </div>

        {/* 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="rounded-xl border border-navy-100 p-6 bg-white shadow-2xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-50 text-navy-900 mb-4">
              <Clock size={20} />
            </div>
            <h3 className="font-bold text-navy-900 text-base mb-2">Yetkazish muddatlari</h3>
            <ul className="text-xs sm:text-sm text-navy-900/70 space-y-1.5">
              <li>• Toshkent shahri: 24 soat ichida</li>
              <li>• Viloyat markazlari: 1-2 ish kuni</li>
              <li>• Barcha tumanlar: 2-3 ish kuni</li>
            </ul>
          </div>

          <div className="rounded-xl border border-navy-100 p-6 bg-white shadow-2xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-50 text-navy-900 mb-4">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-bold text-navy-900 text-base mb-2">Xavfsiz va ehtiyotkor</h3>
            <p className="text-xs sm:text-sm text-navy-900/70 leading-relaxed">
              Barcha soatlar zarbaga chidamli maxsus qadoqlarda yuboriladi. Mahsulotni kuryer oldida ochib tekshirib olishingiz mumkin.
            </p>
          </div>

          <div className="rounded-xl border border-navy-100 p-6 bg-white shadow-2xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-50 text-navy-900 mb-4">
              <MapPin size={20} />
            </div>
            <h3 className="font-bold text-navy-900 text-base mb-2">Butun O'zbekiston</h3>
            <p className="text-xs sm:text-sm text-navy-900/70 leading-relaxed">
              Respublikamizning barcha viloyat, shahar va chekka tumanlariga ishonchli kuryerlik xizmatlari orqali yetkazib beramiz.
            </p>
          </div>
        </div>

        <div className="text-center pt-4">
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-xl bg-navy-900 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-navy-800 shadow-md"
          >
            Katalogga o'tish
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
