import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import ProductDetailClient from "./ProductDetailClient";
import { Product, Category } from "@/types/database";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  let decodedSlug = slug;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch {}

  let { data: product } = await supabase
    .from("products")
    .select("name, description, image, price")
    .or(`slug.eq."${slug}",slug.eq."${decodedSlug}",id.eq."${slug}"`)
    .maybeSingle();

  if (!product) {
    const { data: fallback } = await supabase
      .from("products")
      .select("name, description, image, price")
      .ilike("slug", decodedSlug)
      .maybeSingle();
    product = fallback;
  }

  if (!product) {
    return {
      title: "Mahsulot topilmadi — Grand Watch Shop",
      description: "Qidirilayotgan mahsulot mavjud emas.",
    };
  }

  const formattedPrice = product.price
    ? product.price < 100000
      ? "$" + Math.round(product.price).toLocaleString("ru-RU")
      : Math.round(product.price).toLocaleString("ru-RU") + " so'm"
    : "";

  const title = `${product.name} — Grand Watch Shop`;
  const desc = product.description
    ? `${product.description.slice(0, 160)}... Narxi: ${formattedPrice}`
    : `Grand Watch Shop — ${product.name}. Narxi: ${formattedPrice}. Yetkazib berish kelishilgan holda va 2 yillik rasmiy kafolat!`;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      images: product.image ? [{ url: product.image }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: product.image ? [product.image] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  let decodedSlug = slug;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch {}

  let { data: product } = await supabase
    .from("products")
    .select("*")
    .or(`slug.eq."${slug}",slug.eq."${decodedSlug}",id.eq."${slug}"`)
    .maybeSingle();

  if (!product) {
    const { data: fallback } = await supabase
      .from("products")
      .select("*")
      .ilike("slug", decodedSlug)
      .maybeSingle();
    product = fallback;
  }

  let category: Category | null = null;
  if (product?.category_id) {
    const { data: catData } = await supabase
      .from("categories")
      .select("*")
      .eq("id", product.category_id)
      .maybeSingle();
    category = catData;
  }

  return (
    <ProductDetailClient
      slug={slug}
      initialProduct={(product as Product) || null}
      initialCategory={category}
    />
  );
}
