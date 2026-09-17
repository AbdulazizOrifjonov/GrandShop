import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
}

run();
