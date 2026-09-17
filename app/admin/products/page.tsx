"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Eye, Package, Pencil, Plus, Trash2, CircleDot, AlertTriangle, Ban } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatCard } from "@/components/admin/StatCard";
import { Modal } from "@/components/admin/Modal";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { useStore } from "@/lib/store";
import { Product } from "@/types/database";
import { formatSom } from "@/lib/utils";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  old_price: "",
  category_id: "",
  brand: "",
  sku: "",
  stock: "",
  image: null as string | null,
  is_active: true,
};

export default function AdminProductsPage() {
  const { products, categories, addProduct, updateProduct, deleteProduct: storeDeleteProduct } = useStore();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !(p.sku ?? "").toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter !== "all" && p.category_id !== categoryFilter) return false;
      if (statusFilter === "active" && !p.is_active) return false;
      if (statusFilter === "inactive" && p.is_active) return false;
      if (statusFilter === "out" && p.stock > 0) return false;
      return true;
    });
  }, [products, search, categoryFilter, statusFilter]);

  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const activeCount = products.filter((p) => p.is_active && p.stock > 0).length;
  const outCount = products.filter((p) => p.stock <= 0).length;
  const inactiveCount = products.filter((p) => !p.is_active).length;

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function deleteProduct(id: string) {
    if (confirm("Rostdan ham ushbu mahsulotni o'chirmoqchimisiz?")) {
      storeDeleteProduct(id);
    }
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description ?? "",
      price: String(p.price),
      old_price: p.old_price ? String(p.old_price) : "",
      category_id: p.category_id ?? "",
      brand: p.brand ?? "",
      sku: p.sku ?? "",
      stock: String(p.stock),
      image: p.image,
      is_active: p.is_active,
    });
    setModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: Partial<Product> = {
      name: form.name,
      description: form.description,
      price: Number(form.price) || 0,
      old_price: form.old_price ? Number(form.old_price) : null,
      category_id: form.category_id || null,
      brand: form.brand,
      sku: form.sku,
      stock: Number(form.stock) || 0,
      image: form.image,
      is_active: form.is_active,
    };
    if (editing) {
      updateProduct(editing.id, payload);
    } else {
      addProduct(payload);
    }
    setModalOpen(false);
  }

  return (
    <div>
      <AdminHeader title="Grand Watch Shop Admin" searchPlaceholder="Mahsulot, kategoriya yoki SKU bo'yicha qidirish..." />
      <div className="p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Mahsulotlar</h1>
            <p className="text-sm text-navy-900/50">Barcha mahsulotlarni boshqarish, qo'shish, tahrirlash va o'chirish</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-navy-800">
            <Plus size={16} /> Yangi mahsulot qo'shish
          </button>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard icon={Package} label="Jami mahsulotlar" value={products.length} change="+12" color="bg-info" />
          <StatCard icon={CircleDot} label="Faol mahsulotlar" value={activeCount} change="+8" color="bg-success" />
          <StatCard icon={AlertTriangle} label="Tugagan mahsulotlar" value={outCount} change="-3" color="bg-orange-500" />
          <StatCard icon={Ban} label="Nofaol mahsulotlar" value={inactiveCount} change="-1" color="bg-danger" />
        </div>

        <div className="mb-4 flex flex-wrap gap-3">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Mahsulot nomi bo'yicha qidirish..."
            className="flex-1 rounded-lg border border-navy-100 px-3 py-2.5 text-sm"
          />
          <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} className="rounded-lg border border-navy-100 px-3 py-2.5 text-sm">
            <option value="all">Barcha kategoriyalar</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="rounded-lg border border-navy-100 px-3 py-2.5 text-sm">
            <option value="all">Barcha holatlar</option>
            <option value="active">Faol</option>
            <option value="inactive">Nofaol</option>
            <option value="out">Tugagan</option>
          </select>
        </div>

        <div className="admin-table-responsive overflow-x-auto rounded-xl border border-navy-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-navy-50 text-xs text-navy-900/50">
              <tr>
                <th className="p-3">Rasm</th>
                <th className="p-3">Mahsulot nomi</th>
                <th className="p-3">Kategoriya</th>
                <th className="p-3">Brend</th>
                <th className="p-3">Narxi</th>
                <th className="p-3">Soni</th>
                <th className="p-3">Holat</th>
                <th className="p-3">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((p) => {
                const cat = categories.find((c) => c.id === p.category_id);
                return (
                  <tr key={p.id} className="border-t border-navy-50">
                    <td className="p-3">
                      <div className="relative h-11 w-11 overflow-hidden rounded-lg bg-navy-50">
                        {p.image && <Image src={p.image} alt={p.name} fill className="object-cover" />}
                      </div>
                    </td>
                    <td className="p-3">
                      <p className="font-medium text-navy-900">{p.name}</p>
                      <p className="text-xs text-navy-900/40">SKU: {p.sku}</p>
                    </td>
                    <td className="p-3">
                      {cat && <span className="rounded bg-info/10 px-2 py-1 text-xs text-info">{cat.name}</span>}
                    </td>
                    <td className="p-3">{p.brand}</td>
                    <td className="p-3">{formatSom(p.price)}</td>
                    <td className="p-3">{p.stock}</td>
                    <td className="p-3">
                      {!p.is_active ? (
                        <span className="flex items-center gap-1 text-xs text-navy-900/50"><span className="h-2 w-2 rounded-full bg-navy-900/30" /> Nofaol</span>
                      ) : p.stock <= 0 ? (
                        <span className="flex items-center gap-1 text-xs text-danger"><span className="h-2 w-2 rounded-full bg-danger" /> Tugagan</span>
                      ) : p.stock <= 5 ? (
                        <span className="flex items-center gap-1 text-xs text-warning"><span className="h-2 w-2 rounded-full bg-warning" /> Kam qoldi</span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-success"><span className="h-2 w-2 rounded-full bg-success" /> Faol</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(p)} className="rounded-lg border border-navy-100 p-1.5 hover:bg-navy-50"><Pencil size={14} /></button>
                        <a href={`/products/${p.slug}`} target="_blank" className="rounded-lg border border-navy-100 p-1.5 hover:bg-navy-50"><Eye size={14} /></a>
                        <button onClick={() => deleteProduct(p.id)} className="rounded-lg border border-navy-100 p-1.5 text-danger hover:bg-danger/5"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {pageItems.length === 0 && (
                <tr><td colSpan={8} className="p-8 text-center text-navy-900/40">Mahsulot topilmadi.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-navy-900/50">
          <span>{filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}-{Math.min(page * pageSize, filtered.length)} dan {filtered.length} ta mahsulot</span>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} className={`h-8 w-8 rounded-lg ${page === i + 1 ? "bg-navy-900 text-white" : "border border-navy-100"}`}>
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Mahsulotni tahrirlash" : "Yangi mahsulot qo'shish"} width="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <ImageUploader value={form.image} onChange={(v) => setForm((f) => ({ ...f, image: v }))} label="Asosiy rasm" />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">Mahsulot nomi *</label>
              <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">Tavsif</label>
              <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Narxi *</label>
              <input required type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Eski narx</label>
              <input type="number" value={form.old_price} onChange={(e) => setForm((f) => ({ ...f, old_price: e.target.value }))} className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Kategoriya</label>
              <select value={form.category_id} onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))} className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm">
                <option value="">Tanlanmagan</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Brend</label>
              <input value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">SKU</label>
              <input value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Soni (stock)</label>
              <input type="number" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm" />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input id="active" type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />
              <label htmlFor="active" className="text-sm">Faol (saytda ko'rinadi)</label>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-navy-100 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-navy-100 px-4 py-2.5 text-sm font-medium">Bekor qilish</button>
            <button className="rounded-lg bg-navy-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-navy-800">
              {editing ? "Saqlash" : "Qo'shish"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
