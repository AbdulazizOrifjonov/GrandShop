import { createClient } from "@supabase/supabase-js";
import { sampleCategories, sampleProducts, sampleSliders } from "./lib/sample-data.ts";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function seed() {
  console.log("Seeding categories...");
  for (const cat of sampleCategories) {
    const { error } = await supabase.from("categories").insert(cat);
    if (error) console.error("Category error:", error.message);
  }

  console.log("Seeding products...");
  for (const p of sampleProducts) {
    const { error } = await supabase.from("products").insert(p);
    if (error) console.error("Product error:", error.message);
  }

  console.log("Seeding sliders...");
  for (const s of sampleSliders) {
    const { error } = await supabase.from("sliders").insert(s);
    if (error) console.error("Slider error:", error.message);
  }

  console.log("Seeding done!");
}

seed().catch(console.error);
