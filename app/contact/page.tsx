"use client";
import { Phone, Mail, MapPin } from "lucide-react";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header active="/contact" />
      <div className="container-shop py-16 max-w-2xl">
        <h1 className="font-serif text-4xl font-bold text-navy-900 mb-8">Aloqa</h1>
        <div className="space-y-4 text-navy-900/80">
          <div className="flex items-center gap-3"><Phone size={18} /><span>+998 90 123 45 67</span></div>
          <div className="flex items-center gap-3"><Mail size={18} /><span>info@grandwatch.uz</span></div>
          <div className="flex items-center gap-3"><MapPin size={18} /><span>Toshkent, O'zbekiston</span></div>
        </div>
        <form className="mt-10 space-y-4">
          <div><label className="block text-sm font-medium mb-1">Ismingiz</label><input className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm" /></div>
          <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm" /></div>
          <div><label className="block text-sm font-medium mb-1">Xabar</label><textarea rows={4} className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm" /></div>
          <button className="rounded-lg bg-navy-900 px-6 py-3 text-sm font-medium text-white hover:bg-navy-800">Yuborish</button>
        </form>
      </div>
      <Footer />
    </div>
  );
}
