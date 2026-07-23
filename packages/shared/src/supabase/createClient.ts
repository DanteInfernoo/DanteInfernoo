import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

export function createSupabaseClient(
  url: string,
  key: string,
): SupabaseClient<Database> {
  if (!url || !key) {
    throw new Error("Supabase URL and key are required to create a client");
  }
  return createClient<Database>(url, key);
}
