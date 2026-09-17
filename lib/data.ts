import { createClient } from "@/lib/supabase/server";
import { sampleCategories, sampleProducts, sampleSliders } from "@/lib/sample-data";
import { Category, Product, Slider } from "@/types/database";

// Every function below tries Supabase first (when NEXT_PUBLIC_SUPABASE_URL /
// NEXT_PUBLIC_SUPABASE_ANON_KEY are configured and the tables exist) and
// gracefully falls back to bundled sample data otherwise. This means the
// storefront is always browsable, and becomes fully live the moment a real
// Supabase project (seeded with supabase/schema.sql) is connected.

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  if (!supabase) return sampleCategories;

  const { data, error } = await supabase
    .from("categories")
    .select("*, products(count)")
    .order("created_at", { ascending: true });

  if (error || !data || data.length === 0) return sampleCategories;

  return data.map((c: any) => ({
    ...c,
    product_count: c.products?.[0]?.count ?? 0,
  }));
}

export async function getSliders(): Promise<Slider[]> {
  const supabase = await createClient();
  if (!supabase) return sampleSliders.filter((s) => s.is_active);

  const { data, error } = await supabase
    .from("sliders")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) {
    return sampleSliders.filter((s) => s.is_active);
  }
  return data;
}

export interface ProductFilters {
  categorySlug?: string;
  search?: string;
  brands?: string[];
  sort?: "popular" | "new" | "price_asc" | "price_desc";
  onSaleOnly?: boolean;
  limit?: number;
}

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const supabase = await createClient();

  if (!supabase) {
    let list = [...sampleProducts];
    if (filters.categorySlug) {
      list = list.filter((p) => {
        const cat = sampleCategories.find((c) => c.id === p.category_id);
        return cat?.slug === filters.categorySlug;
      });
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.brand ?? "").toLowerCase().includes(q)
      );
    }
    if (filters.brands?.length) {
      list = list.filter((p) => p.brand && filters.brands!.includes(p.brand));
    }
    if (filters.onSaleOnly) {
      list = list.filter((p) => p.discount || (p.old_price && p.old_price > p.price));
    }
    if (filters.sort === "price_asc") list.sort((a, b) => a.price - b.price);
    if (filters.sort === "price_desc") list.sort((a, b) => b.price - a.price);
    if (filters.sort === "new") list = list.filter((p) => p.is_new).concat(list.filter((p) => !p.is_new));
    if (filters.limit) list = list.slice(0, filters.limit);
    return list;
  }

  let query = supabase.from("products").select("*, category:categories(*)").eq("is_active", true);

  if (filters.categorySlug) {
    query = query.eq("category.slug", filters.categorySlug);
  }
  if (filters.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }
  if (filters.brands?.length) {
    query = query.in("brand", filters.brands);
  }
  if (filters.onSaleOnly) {
    query = query.not("discount", "is", null);
  }
  if (filters.sort === "price_asc") query = query.order("price", { ascending: true });
  else if (filters.sort === "price_desc") query = query.order("price", { ascending: false });
  else if (filters.sort === "new") query = query.order("created_at", { ascending: false });
  else query = query.order("rating", { ascending: false });

  if (filters.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error || !data) return sampleProducts;
  return data as unknown as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  if (!supabase) {
    return sampleProducts.find((p) => p.slug === slug || p.id === slug) ?? null;
  }

  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*), images:product_images(*)")
    .or(`slug.eq.${slug},id.eq.${slug}`)
    .single();

  if (error || !data) {
    return sampleProducts.find((p) => p.slug === slug || p.id === slug) ?? null;
  }
  return data as unknown as Product;
}

export async function getRelatedProducts(product: Product, count = 4): Promise<Product[]> {
  const all = await getProducts({ categorySlug: product.category?.slug });
  return all.filter((p) => p.id !== product.id).slice(0, count);
}
