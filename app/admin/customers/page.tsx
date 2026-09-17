"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatCard } from "@/components/admin/StatCard";
import { useStore } from "@/lib/store";

interface StoredUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

export default function AdminCustomersPage() {
  const { orders } = useStore();
  const [customers, setCustomers] = useState<StoredUser[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("gws_users");
      const all: StoredUser[] = raw ? JSON.parse(raw) : [];
      setCustomers(all.filter((u) => u.role === "customer"));
    } catch {
      setCustomers([]);
    }
  }, []);

  return (
    <div>
      <AdminHeader title="Grand Watch Shop Admin" searchPlaceholder="Mijozlarni qidirish..." />
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy-900">Mijozlar</h1>
          <p className="text-sm text-navy-900/50">Ro'yxatdan o'tgan mijozlar ro'yxati</p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
          <StatCard icon={Users} label="Jami mijozlar" value={customers.length} color="bg-info" />
          <StatCard icon={Users} label="Jami buyurtmalar" value={orders.length} color="bg-success" />
          <StatCard icon={Users} label="Faol xaridorlar" value={new Set(orders.map((o) => o.user_id)).size} color="bg-purple-600" />
        </div>

        <div className="overflow-x-auto rounded-xl border border-navy-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-navy-50 text-xs text-navy-900/50">
              <tr>
                <th className="p-3">Ism</th>
                <th className="p-3">Email</th>
                <th className="p-3">Telefon</th>
                <th className="p-3">Ro'yxatdan o'tgan sana</th>
                <th className="p-3">Buyurtmalar soni</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-t border-navy-50">
                  <td className="p-3 font-medium text-navy-900">{c.fullName}</td>
                  <td className="p-3">{c.email}</td>
                  <td className="p-3">{c.phone}</td>
                  <td className="p-3 text-navy-900/50">{new Date(c.createdAt).toLocaleDateString("uz-UZ")}</td>
                  <td className="p-3">{orders.filter((o) => o.user_id === c.id).length}</td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-navy-900/40">Hali mijozlar ro'yxatdan o'tmagan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
