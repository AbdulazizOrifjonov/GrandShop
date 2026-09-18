import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jcxuntvtoemnhnsxjwrh.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_4zhII_zDXEp-yRK40kHyLQ_PLjaJ4dL";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
