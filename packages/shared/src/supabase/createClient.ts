import {
  createClient,
  type SupabaseClient,
  type SupabaseClientOptions,
} from "@supabase/supabase-js";
import type { Database } from "../types/database";

export function createSupabaseClient(
  url: string,
  key: string,
  options?: SupabaseClientOptions<"public">,
): SupabaseClient<Database> {
  if (!url || !key) {
    throw new Error("Supabase URL and key are required to create a client");
  }
  return createClient<Database>(url, key, options);
}
