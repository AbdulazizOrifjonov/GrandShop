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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = login(email, password);
    if (!res.ok) {
      setError(res.error ?? "Xatolik yuz berdi.");
      return;
    }
    if (res.role === "super_admin" || res.role === "moderator" || res.role === "content_admin") {
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
          <p className="mb-6 text-sm text-navy-900/50">Hisobingizga kiring</p>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <label className="mb-1 block text-sm font-medium">Parol</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <button className="w-full rounded-lg bg-navy-900 py-3 text-sm font-medium text-white hover:bg-navy-800">
              Kirish
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-navy-900/60">
            Hisobingiz yo'qmi?{" "}
            <Link href="/register" className="font-medium text-navy-900 hover:text-gold-500">
              Ro'yxatdan o'tish
            </Link>
          </p>

          <div className="mt-4 rounded-lg bg-navy-50 p-3 text-xs text-navy-900/60">
            Demo admin: <b>admin@grandwatch.uz</b> / <b>admin123</b> — <Link href="/admin" className="underline">/admin</Link> panelga kirish uchun.
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
