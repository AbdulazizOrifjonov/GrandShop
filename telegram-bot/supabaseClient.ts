import fs from "fs";
import path from "path";
import crypto from "crypto";

// Since the user is using localStorage and lib/sample-data.ts,
// we will intercept the Supabase creation and write directly to lib/sample-data.ts!

const dataFilePath = path.join(process.cwd(), "lib", "sample-data.ts");
const publicImgDir = path.join(process.cwd(), "public", "telegram");

// Ensure public directory exists
if (!fs.existsSync(publicImgDir)) {
  fs.mkdirSync(publicImgDir, { recursive: true });
}

export async function uploadImageToSupabase(url: string, filename: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Save locally to public/telegram
    const filePath = path.join(publicImgDir, filename);
    fs.writeFileSync(filePath, buffer);
    
    // Return relative url
    return `/telegram/${filename}`;
  } catch (error) {
    console.error("Error downloading image:", error);
    return null;
  }
}

function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    + "-" + crypto.randomBytes(2).toString("hex");
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
  // Use a pseudo-random ID since we don't have crypto.randomUUID available in standard Node easily without import
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

  const brandStr = brand ? `"${brand}"` : "null";
  const newProductStr = `  { id: "${id}", name: ${JSON.stringify(name)}, slug: "${slug}", description: ${JSON.stringify(description)}, price: ${price}, old_price: null, discount: null, category_id: "${categoryId}", brand: ${brandStr}, stock: 10, sku: "BOT-${messageId}", rating: 5.0, reviews_count: 0, image: ${imageUrls.length > 0 ? `"${imageUrls[0]}"` : "null"}, images: ${JSON.stringify(extraImages)}, specifications: ${JSON.stringify(specs)}, colors: [], mechanism: "Avtomatik", is_active: true, is_new: true, created_at: "${now}", updated_at: "${now}" },\n];`;

  // Read current sample-data.ts
  let content = fs.readFileSync(dataFilePath, "utf8");
  
  // Find the end of sampleProducts array
  // It ends with: "];" right before "export const sampleSliders"
  
  // Replace the closing bracket of sampleProducts with our new product
  // A bit hacky but works for local dev
  const targetStr = "];\n\nexport const sampleSliders";
  if (content.includes(targetStr)) {
    content = content.replace(targetStr, newProductStr + "\n\nexport const sampleSliders");
    fs.writeFileSync(dataFilePath, content);
  } else {
    // Fallback if formatting is different
    const fallbackTarget = "];\r\n\r\nexport const sampleSliders";
    if (content.includes(fallbackTarget)) {
      content = content.replace(fallbackTarget, newProductStr + "\r\n\r\nexport const sampleSliders");
      fs.writeFileSync(dataFilePath, content);
    }
  }

  // NOTE: Because the app uses localStorage (lib/store.tsx loads from localStorage on mount),
  // The user might need to clear their browser localStorage for 'gws_products' to see the new item, 
  // OR the bot could theoretically inject it... but updating sample-data.ts is the best we can do server-side.
  
  return id;
}

export async function createNewCategory(id: string, name: string) {
  const slug = generateSlug(name);
  const now = new Date().toISOString().split('T')[0];
  
  const newCatStr = `  { id: "${id}", name: ${JSON.stringify(name)}, slug: "${slug}", description: ${JSON.stringify(name)} + " bo'limi", image_url: null, is_active: true, product_count: 0, created_at: "${now}" },\n];`;
  
  let content = fs.readFileSync(dataFilePath, "utf8");
  
  const targetStr = "];\n\nconst img";
  if (content.includes(targetStr)) {
    content = content.replace(targetStr, newCatStr + "\n\nconst img");
    fs.writeFileSync(dataFilePath, content);
  } else {
    const fallbackTarget = "];\r\n\r\nconst img";
    if (content.includes(fallbackTarget)) {
      content = content.replace(fallbackTarget, newCatStr + "\r\n\r\nconst img");
      fs.writeFileSync(dataFilePath, content);
    }
  }
}
