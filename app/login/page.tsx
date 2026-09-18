"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+998");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const cleanPhone = phone.replace(/\s+/g, '');
  const isAdminLogin = cleanPhone === "+998977657180";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    
    if (fullName.trim().length < 3) {
      setError("Iltimos, ism-familiyangizni to'liq kiriting.");
      return;
    }
    if (cleanPhone.length < 9) {
      setError("Iltimos, to'g'ri telefon raqam kiriting.");
      return;
    }

    setLoading(true);
    const res = await login(fullName, phone, password);
    setLoading(false);
    
    if (!res.ok) {
      setError(res.error ?? "Xatolik yuz berdi.");
      return;
    }
    
    if (isAdminLogin) {
      router.push("/admin");
    } else {
      router.push("/profile");
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header active="/login" />
      <div className="container-shop flex min-h-[70vh] items-center justify-center py-16">
        <div className="w-full max-w-md rounded-2xl border border-navy-100 p-8 shadow-sm">
          <h1 className="mb-1 font-serif text-2xl font-bold text-navy-900">Xush kelibsiz</h1>
          <p className="mb-6 text-sm text-navy-900/50">Hisobingizga kiring yoki ro'yxatdan o'ting</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Ism va Familiya</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm outline-none focus:border-navy-900"
                placeholder="Ali Valiyev"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Telefon raqam</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm outline-none focus:border-navy-900"
                placeholder="+998 90 123 45 67"
              />
            </div>
            
            {isAdminLogin && (
              <div className="animate-fade-in">
                <label className="mb-1 block text-sm font-medium text-danger">Admin Paroli</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-danger/30 px-3 py-2.5 text-sm outline-none focus:border-danger"
                  placeholder="••••••••"
                />
              </div>
            )}
            
            {error && <p className="text-sm text-danger">{error}</p>}
            
            <button 
              disabled={loading}
              className="w-full rounded-lg bg-navy-900 py-3 text-sm font-medium text-white hover:bg-navy-800 disabled:opacity-50 transition"
            >
              {loading ? "Kutilmoqda..." : "Kirish"}
            </button>
          </form>

          <div className="mt-6 rounded-lg bg-navy-50 p-3 text-xs text-navy-900/60 leading-relaxed text-center">
            Parol va email kiritish shart emas. Tizim sizni telefon raqamingiz orqali eslab qoladi.
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
