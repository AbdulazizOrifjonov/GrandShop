import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://jcxuntvtoemnhnsxjwrh.supabase.co";
const supabaseAnonKey = "sb_publishable_4zhII_zDXEp-yRK40kHyLQ_PLjaJ4dL";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
