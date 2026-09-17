"use client";
import { Suspense } from "react";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";

function HeaderWithSuspense() {
  return <Header active="/about" />;
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={<div className="h-[76px]" />}>
        <HeaderWithSuspense />
      </Suspense>
      <div className="container-shop py-16 max-w-3xl">
        <h1 className="font-serif text-4xl font-bold text-navy-900 mb-4">Biz haqimizda</h1>
        <p className="text-navy-900/70 mb-6">
          Grand Watch Shop — O'zbekistondagi eng yirik premium soatlar do'koni. 2020-yildan beri
          Tissot, Rolex, Casio, Seiko, Orient va boshqa ko'plab dunyo brendlarining original
          soatlarini taqdim etib kelmoqdamiz.
        </p>
        <p className="text-navy-900/70">
          Bizning maqsadimiz — har bir mijozga ularning uslubiga va byudjetiga mos keladigan
          sifatli soatni topishda yordam berish. 1000+ baxtli mijoz va 100% original mahsulotlar
          kafolati bilan biz har doim sizning ishonchli sherikingiz bo'lib qolamiz.
        </p>
      </div>
      <Footer />
    </div>
  );
}