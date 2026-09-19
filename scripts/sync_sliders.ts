import { supabase } from "../lib/supabase";

const slides = [
  {
    id: "s1",
    title: "Rolex Oyster Perpetual",
    subtitle: "Dunyoning eng mashhur va nufuzli Shveysariya soatlari. Original sifat va 12 oy kafolat.",
    image_url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1920&auto=format&fit=crop",
    button_text: "Katalogni ko'rish",
    link: "/products",
    sort_order: 1,
    is_active: true
  },
  {
    id: "s2",
    title: "Audemars Piguet Royal Oak",
    subtitle: "O'zgacha geometrik luks dizayn va avtomatik mexanizm. Har bir erkak orzusidagi hashamat.",
    image_url: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1920&auto=format&fit=crop",
    button_text: "Erkaklar soatlari",
    link: "/products?cat=erkaklar",
    sort_order: 2,
    is_active: true
  },
  {
    id: "s3",
    title: "Patek Philippe & Cartier",
    subtitle: "Shveysariya an'analari, aristokratik nafislik va mukammal aniqlik uyg'unligi.",
    image_url: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1920&auto=format&fit=crop",
    button_text: "Kolleksiyani ko'rish",
    link: "/products",
    sort_order: 3,
    is_active: true
  },
  {
    id: "s4",
    title: "Hublot Big Bang Series",
    subtitle: "Innovatsion keramika, titan korpus va xronograf funksiyalari. Jasur va zamonaviy obraz.",
    image_url: "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?q=80&w=1920&auto=format&fit=crop",
    button_text: "Brend soatlari",
    link: "/products",
    sort_order: 4,
    is_active: true
  },
  {
    id: "s5",
    title: "Tissot & Maxsus Chegirmalar",
    subtitle: "O'zbekiston bo'ylab 1 kunda bepul yetkazib berish. 30% gacha maxsus mavsumiy chegirmalar.",
    image_url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1920&auto=format&fit=crop",
    button_text: "Aksiyalarni ko'rish",
    link: "/products?sale=1",
    sort_order: 5,
    is_active: true
  }
];

async function main() {
  const { data, error } = await supabase.from("sliders").upsert(slides).select();
  console.log("Upserted:", data?.length, "slides, error:", error);
}

main();
