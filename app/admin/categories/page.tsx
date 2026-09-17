"use client";

import Image from "next/image";
import { useState } from "react";
import { Folder, CheckCircle2, PauseCircle, ListTree, Pencil, Plus, Trash2 } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatCard } from "@/components/admin/StatCard";
import { Modal } from "@/components/admin/Modal";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { useStore } from "@/lib/store";
import { Category } from "@/types/database";

const EMPTY_FORM = { name: "", description: "", image_url: null as string | null, is_active: true };

export default function AdminCategoriesPage() {
  const { categories, products, addCategory, updateCategory, deleteCategory: storeDeleteCategory } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");

  const filtered = categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  function deleteCategory(id: string) {
    if (confirm("Rostdan ham ushbu kategoriyani o'chirmoqchimisiz?")) {
      storeDeleteCategory(id);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(c: Category) {
    setEditing(c);
    setForm({ name: c.name, description: c.description ?? "", image_url: c.image_url, is_active: c.is_active });
    setModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      updateCategory(editing.id, form);
    } else {
      addCategory(form);
    }
    setModalOpen(false);
  }

  return (
    <div>
      <AdminHeader title="Grand Watch Shop Admin" searchPlaceholder="Kategoriyalarni qidirish..." />
      <div className="p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Kategoriyalar</h1>
            <p className="text-sm text-navy-900/50">Mahsulot kategoriyalarini boshqarish, qo'shish, tahrirlash va o'chirish</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-navy-800">
            <Plus size={16} /> Yangi kategoriya qo'shish
          </button>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard icon={Folder} label="Jami kategoriyalar" value={categories.length} change="+2" color="bg-info" />
          <StatCard icon={CheckCircle2} label="Faol kategoriyalar" value={categories.filter((c) => c.is_active).length} change="+1" color="bg-success" />
          <StatCard icon={PauseCircle} label="Nofaol kategoriyalar" value={categories.filter((c) => !c.is_active).length} change="-1" color="bg-orange-500" />
          <StatCard icon={ListTree} label="Jami mahsulotlar" value={products.length} change="+28" color="bg-purple-600" />
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Kategoriya nomi bo'yicha qidirish..."
          className="mb-4 w-full max-w-md rounded-lg border border-navy-100 px-3 py-2.5 text-sm"
        />

        <div className="overflow-x-auto rounded-xl border border-navy-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-navy-50 text-xs text-navy-900/50">
              <tr>
                <th className="p-3">Rasm</th>
                <th className="p-3">Kategoriya nomi</th>
                <th className="p-3">Tavsif</th>
                <th className="p-3">Mahsulotlar soni</th>
                <th className="p-3">Holat</th>
                <th className="p-3">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-t border-navy-50">
                  <td className="p-3">
                    <div className="relative h-11 w-11 overflow-hidden rounded-lg bg-navy-50">
                      {c.image_url && <Image src={c.image_url} alt={c.name} fill className="object-cover" />}
                    </div>
                  </td>
                  <td className="p-3 font-medium text-navy-900">{c.name}</td>
                  <td className="p-3 text-navy-900/60">{c.description}</td>
                  <td className="p-3">{products.filter((p) => p.category_id === c.id).length}</td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-1 text-xs ${c.is_active ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
                      {c.is_active ? "Faol" : "Nofaol"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(c)} className="rounded-lg border border-navy-100 p-1.5 hover:bg-navy-50"><Pencil size={14} /></button>
                      <button onClick={() => deleteCategory(c.id)} className="rounded-lg border border-navy-100 p-1.5 text-danger hover:bg-danger/5"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Kategoriyani tahrirlash" : "Yangi kategoriya qo'shish"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ImageUploader value={form.image_url} onChange={(v) => setForm((f) => ({ ...f, image_url: v }))} label="Kategoriya rasmi" />
          <div>
            <label className="mb-1 block text-sm font-medium">Nomi *</label>
            <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Tavsif</label>
            <textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <input id="cat-active" type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />
            <label htmlFor="cat-active" className="text-sm">Faol</label>
          </div>
          <div className="flex justify-end gap-3 border-t border-navy-100 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-navy-100 px-4 py-2.5 text-sm font-medium">Bekor qilish</button>
            <button className="rounded-lg bg-navy-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-navy-800">{editing ? "Saqlash" : "Qo'shish"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
