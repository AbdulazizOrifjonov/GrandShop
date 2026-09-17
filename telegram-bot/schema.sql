-- Yuborilgan xabarlarni takroriy qo'shmaslik uchun jadval
CREATE TABLE IF NOT EXISTS telegram_imports (
  message_id TEXT PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- (Ixtiyoriy) Agar rasmlar uchun Storage Bucket hali ochilmagan bo'lsa:
-- 1. Supabase > Storage bo'limiga kiring
-- 2. "New bucket" tugmasini bosing
-- 3. Nomiga "products" deb yozing
-- 4. "Public bucket" ni yoqib qo'ying.
