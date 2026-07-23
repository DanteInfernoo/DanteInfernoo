import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@crm/shared";

export type SavedFilterRow = Database["public"]["Tables"]["saved_filters"]["Row"];

export async function listSavedFilters(workspaceId: string, entityType: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saved_filters")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("entity_type", entityType)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}
