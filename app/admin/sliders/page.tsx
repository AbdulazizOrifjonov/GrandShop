"use client";

import Image from "next/image";
import { useState } from "react";
import { Images, Eye, EyeOff, ListOrdered, Pencil, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatCard } from "@/components/admin/StatCard";
import { Modal } from "@/components/admin/Modal";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { useStore } from "@/lib/store";
import { Slider } from "@/types/database";

const EMPTY_FORM = {
  title: "",
  subtitle: "",
  image_url: null as string | null,
  button_text: "",
  link: "",
  is_active: true,
};

export default function AdminSlidersPage() {
  const { sliders, addSlider, updateSlider, deleteSlider: storeDeleteSlider, reorderSlider } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Slider | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const sorted = [...sliders].sort((a, b) => a.sort_order - b.sort_order);

  function deleteSlider(id: string) {
    if (confirm("Rostdan ham ushbu sliderni o'chirmoqchimisiz?")) {
      storeDeleteSlider(id);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(s: Slider) {
    setEditing(s);
    setForm({
      title: s.title,
      subtitle: s.subtitle ?? "",
      image_url: s.image_url,
      button_text: s.button_text ?? "",
      link: s.link ?? "",
      is_active: s.is_active,
    });
    setModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.image_url) return;
    const payload = { ...form, image_url: form.image_url as string };
    if (editing) {
      updateSlider(editing.id, payload);
    } else {
      addSlider({ ...payload, sort_order: sliders.length + 1 });
    }
    setModalOpen(false);
  }

  return (
    <div>
      <AdminHeader title="Grand Watch Shop Admin" searchPlaceholder="Sliderlarni qidirish..." />
      <div className="p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Sliderlar</h1>
            <p className="text-sm text-navy-900/50">Bosh sahifadagi sliderlarni boshqarish, qo'shish va tahrirlash</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-navy-800">
            <Plus size={16} /> Yangi slider qo'shish
          </button>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard icon={Images} label="Jami sliderlar" value={sliders.length} change="+1" color="bg-info" />
          <StatCard icon={Eye} label="Faol sliderlar" value={sliders.filter((s) => s.is_active).length} change="+1" color="bg-success" />
          <StatCard icon={EyeOff} label="Nofaol sliderlar" value={sliders.filter((s) => !s.is_active).length} change="-1" color="bg-danger" />
          <StatCard icon={ListOrdered} label="Jami tartib" value={sliders.length} color="bg-purple-600" />
        </div>

        <div className="overflow-x-auto rounded-xl border border-navy-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-navy-50 text-xs text-navy-900/50">
              <tr>
                <th className="p-3">Rasm</th>
                <th className="p-3">Sarlavha</th>
                <th className="p-3">Tavsif</th>
                <th className="p-3">Tugma</th>
                <th className="p-3">Tartib</th>
                <th className="p-3">Holat</th>
                <th className="p-3">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((s) => (
                <tr key={s.id} className="border-t border-navy-50">
                  <td className="p-3">
                    <div className="relative h-12 w-20 overflow-hidden rounded-lg bg-navy-900">
                      {s.image_url && <Image src={s.image_url} alt={s.title} fill className="object-cover opacity-80" />}
                    </div>
                  </td>
                  <td className="p-3 font-medium text-navy-900">{s.title}</td>
                  <td className="p-3 text-navy-900/60">{s.subtitle}</td>
                  <td className="p-3">
                    <span className="rounded bg-navy-50 px-2 py-1 text-xs">{s.button_text}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => reorderSlider(s.id, "up")} className="rounded border border-navy-100 p-1 hover:bg-navy-50"><ChevronUp size={13} /></button>
                      <span>{s.sort_order}</span>
                      <button onClick={() => reorderSlider(s.id, "down")} className="rounded border border-navy-100 p-1 hover:bg-navy-50"><ChevronDown size={13} /></button>
                    </div>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => updateSlider(s.id, { is_active: !s.is_active })}
                      className={`rounded-full px-2 py-1 text-xs ${s.is_active ? "bg-success/10 text-success" : "bg-navy-100 text-navy-900/50"}`}
                    >
                      {s.is_active ? "Faol" : "Nofaol"}
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(s)} className="rounded-lg border border-navy-100 p-1.5 hover:bg-navy-50"><Pencil size={14} /></button>
                      <button onClick={() => deleteSlider(s.id)} className="rounded-lg border border-navy-100 p-1.5 text-danger hover:bg-danger/5"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-xl bg-info/5 p-4 text-sm text-navy-900/70">
          <Images size={18} className="mt-0.5 shrink-0 text-info" />
          <p>Tavsiya etilgan rasm o'lchami: 1920 × 600 piksel. Format: JPG, PNG. Maksimal hajm: 2MB.</p>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Sliderni tahrirlash" : "Yangi slider qo'shish"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ImageUploader 
            value={form.image_url} 
            onChange={(v) => setForm((f) => ({ ...f, image_url: v }))} 
            label="Slider rasmi *" 
            aspect="aspect-video" 
            maxSize={1920}
          />
          <div>
            <label className="mb-1 block text-sm font-medium">Sarlavha *</label>
            <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Tavsif</label>
            <input value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Tugma matni</label>
              <input value={form.button_text} onChange={(e) => setForm((f) => ({ ...f, button_text: e.target.value }))} className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Tugma havolasi</label>
              <input value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} placeholder="/products" className="w-full rounded-lg border border-navy-100 px-3 py-2.5 text-sm" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input id="slider-active" type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />
            <label htmlFor="slider-active" className="text-sm">Faol (bosh sahifada ko'rinadi)</label>
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
