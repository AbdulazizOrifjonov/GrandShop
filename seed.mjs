import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://jcxunlvloemnhnsxjwrh.supabase.co";
const supabaseAnonKey = "sb_publishable_4zhII_zDXEp-yRK40kHyLQ_PLjaJ4dL";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const code = fs.readFileSync('lib/sample-data.ts', 'utf8');
  
  const categoriesRegex = /export const sampleCategories: Category\[\] = (\[[\s\S]*?\]);/m;
  const matchCat = code.match(categoriesRegex);
  if (matchCat) {
    const arr = eval(matchCat[1]);
    for(const c of arr) {
      await supabase.from('categories').insert(c);
    }
    console.log("Categories done");
  }

  const productsRegex = /export const sampleProducts: Product\[\] = (\[[\s\S]*?\]);/m;
  const matchProd = code.match(productsRegex);
  if (matchProd) {
    const arr = eval(matchProd[1]);
    for(const p of arr) {
      await supabase.from('products').insert(p);
    }
    console.log("Products done");
  }

  const slidersRegex = /export const sampleSliders: Slider\[\] = (\[[\s\S]*?\]);/m;
  const matchSlider = code.match(slidersRegex);
  if (matchSlider) {
    const arr = eval(matchSlider[1]);
    for(const s of arr) {
      await supabase.from('sliders').insert(s);
    }
    console.log("Sliders done");
  }
}

run();
