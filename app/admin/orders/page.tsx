"use client";

import { useState } from "react";
import { Eye, X } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Modal } from "@/components/admin/Modal";
import { OrderStatusBadge } from "@/components/shop/OrderStatusBadge";
import { useStore } from "@/lib/store";
import { Order, OrderStatus } from "@/types/database";
import { formatSom } from "@/lib/utils";

const STATUSES: OrderStatus[] = ["new", "processing", "shipped", "delivered", "cancelled"];
const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "Yangi",
  processing: "Tasdiqlangan",
  shipped: "Yuborilgan",
  delivered: "Yetkazib berildi",
  cancelled: "Bekor qilingan",
};

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus } = useStore();
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Order | null>(null);

  const filtered = statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter);

  return (
    <div>
      <AdminHeader title="Grand Watch Shop Admin" searchPlaceholder="Buyurtma qidirish..." />
      <div className="p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Buyurtmalar</h1>
            <p className="text-sm text-navy-900/50">Barcha buyurtmalarni ko'rish va holatini boshqarish</p>
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-navy-100 px-3 py-2.5 text-sm">
            <option value="all">Barcha holatlar</option>
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto rounded-xl border border-navy-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-navy-50 text-xs text-navy-900/50">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Mijoz</th>
                <th className="p-3">Telefon</th>
                <th className="p-3">Manzil</th>
                <th className="p-3">Summa</th>
                <th className="p-3">Sana</th>
                <th className="p-3">Holat</th>
                <th className="p-3">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-t border-navy-50">
                  <td className="p-3 font-medium text-navy-900">#{o.order_number}</td>
                  <td className="p-3">{o.full_name}</td>
                  <td className="p-3">{o.phone}</td>
                  <td className="p-3 max-w-[180px] truncate">{o.address}</td>
                  <td className="p-3 font-semibold">{formatSom(o.total)}</td>
                  <td className="p-3 text-navy-900/50">{new Date(o.created_at).toLocaleDateString("uz-UZ")}</td>
                  <td className="p-3">
                    <select
                      value={o.status}
                      onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                      className="rounded-lg border border-navy-100 px-2 py-1 text-xs"
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                    </select>
                  </td>
                  <td className="p-3">
                    <button onClick={() => setSelected(o)} className="rounded-lg border border-navy-100 p-1.5 hover:bg-navy-50">
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="p-8 text-center text-navy-900/40">Buyurtma topilmadi.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Buyurtma #${selected?.order_number ?? ""}`}>
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <OrderStatusBadge status={selected.status} />
              <span className="text-navy-900/50">{new Date(selected.created_at).toLocaleString("uz-UZ")}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-lg bg-navy-50 p-4">
              <p><span className="text-navy-900/50">Mijoz:</span> {selected.full_name}</p>
              <p><span className="text-navy-900/50">Telefon:</span> {selected.phone}</p>
              <p className="col-span-2"><span className="text-navy-900/50">Manzil:</span> {selected.address}</p>
              {selected.note && <p className="col-span-2"><span className="text-navy-900/50">Izoh:</span> {selected.note}</p>}
            </div>
            <div className="space-y-2">
              {(selected.items ?? []).map((it, i) => (
                <div key={i} className="flex justify-between border-b border-navy-50 pb-2">
                  <span>{it.product_name} x{it.quantity}</span>
                  <span className="font-medium">{formatSom(it.price * it.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-base font-bold">
              <span>Jami</span>
              <span>{formatSom(selected.total)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
