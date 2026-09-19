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
          <div className="flex items-center gap-3"><Phone size={18} className="text-navy-900" /><span>+998 90 123 45 67 / +998 97 765 71 80</span></div>
          <div className="flex items-center gap-3"><Mail size={18} className="text-navy-900" /><span>info@grandwatch.uz</span></div>
          <div className="flex items-center gap-3"><MapPin size={18} className="text-navy-900" /><span>Toshkent, O'zbekiston</span></div>
          <div className="pt-2">
            <a
              href="https://t.me/+tX9dQIISDYFlYWVi"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-sky-100/60 border border-sky-200 text-navy-950 hover:border-sky-400 transition shadow-xs group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2AABEE] text-white">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-sm text-navy-900 group-hover:text-[#0088cc] transition-colors">Rasmiy Telegram Kanalimiz</div>
                  <div className="text-xs text-navy-900/60">Yangi soatlar, jonli obzorlar va yangiliklar</div>
                </div>
              </div>
              <span className="text-xs font-bold text-[#0088cc] bg-white px-3 py-1.5 rounded-lg border border-sky-200 shadow-2xs">
                Kanalga o'tish →
              </span>
            </a>
          </div>
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
