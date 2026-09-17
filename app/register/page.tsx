"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { useAuth } from "@/lib/auth";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = register({ fullName, email, phone, password });
    if (!res.ok) {
      setError(res.error ?? "Xatolik yuz berdi.");
      return;
    }
    router.push("/profile");
  }

  return (
    <div className="min-h-screen bg-white">
      <Header active="/register" />
      <div className="container-shop flex min-h-[70vh] items-center justify-center py-16">
        <div className="w-full max-w-md rounded-2xl border border-navy-100 p-8 shadow-sm">
          <h1 className="mb-1 font-serif text-2xl font-bold text-navy-900">Ro'yxatdan o'tish</h1>
          <p className="mb-6 text-sm text-navy-900/50">Yangi hisob yarating</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">To'liq ism</label>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm"
                placeholder="Ism Familiya"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Telefon raqam</label>
              <input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm"
                placeholder="+998 90 123 45 67"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Parol</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm"
                placeholder="Kamida 6 ta belgi"
              />
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <button className="w-full rounded-lg bg-navy-900 py-3 text-sm font-medium text-white hover:bg-navy-800">
              Ro'yxatdan o'tish
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-navy-900/60">
            Hisobingiz bormi?{" "}
            <Link href="/login" className="font-medium text-navy-900 hover:text-gold-500">
              Kirish
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
