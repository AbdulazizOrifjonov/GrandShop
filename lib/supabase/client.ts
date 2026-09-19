"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jcxuntvtoemnhnsxjwrh.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_4zhII_zDXEp-yRK40kHyLQ_PLjaJ4dL";

  return createBrowserClient(url, key);
}
