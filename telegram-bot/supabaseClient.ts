import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jcxuntvtoemnhnsxjwrh.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_4zhII_zDXEp-yRK40kHyLQ_PLjaJ4dL";

const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadImageToSupabase(url: string, filename: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('shop-images')
      .upload(`bot/${filename}`, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) {
      console.error("Supabase storage error:", error);
      return null;
    }
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage.from('shop-images').getPublicUrl(`bot/${filename}`);
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Error downloading image:", error);
    return null;
  }
}

export async function insertProduct(
  name: string,
  description: string,
  price: number,
  characteristics: string[],
  imageUrls: string[],
  messageId: string,
  categoryId: string,
  brand: string | null = null
) {
  const id = crypto.randomUUID();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 10000);
  const now = new Date().toISOString();

  const specs = characteristics.reduce((acc, curr, i) => {
    const parts = curr.split(/[:\-]/);
    if (parts.length >= 2) {
      acc[parts[0].trim()] = parts.slice(1).join("-").trim();
    } else {
      acc[`Xususiyat ${i + 1}`] = curr;
    }
    return acc;
  }, {} as Record<string, string>);

  const extraImages = imageUrls.map((u, idx) => ({ id: crypto.randomUUID(), product_id: id, url: u, sort_order: idx }));

  const payload = {
    id,
    name,
    slug,
    description,
    price,
    old_price: null,
    discount: null,
    category_id: categoryId,
    brand,
    stock: 10,
    sku: `BOT-${messageId}`,
    rating: 5.0,
    reviews_count: 0,
    image: imageUrls.length > 0 ? imageUrls[0] : null,
    images: extraImages,
    specifications: specs,
    colors: [],
    mechanism: "Avtomatik",
    is_active: true,
    is_new: true,
    created_at: now,
    updated_at: now
  };

  const { error } = await supabase.from('products').insert(payload);
  if (error) {
    console.error("Supabase DB Insert error:", error);
  }
}

export async function createNewCategory(name: string): Promise<string> {
  const id = crypto.randomUUID();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + crypto.randomBytes(2).toString("hex");
  
  const payload = {
    id,
    name,
    slug,
    description: "",
    image_url: null,
    is_active: true,
    product_count: 0
  };

  const { error } = await supabase.from('categories').insert(payload);
  if (error) {
    console.error("Supabase Category Insert error:", error);
    // If it fails, maybe return a fallback
    return "c1"; 
  }
  return id;
}
