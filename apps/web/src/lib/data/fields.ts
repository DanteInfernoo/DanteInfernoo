import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@crm/shared";

export type FieldDefinitionRow =
  Database["public"]["Tables"]["custom_field_definitions"]["Row"];

export async function getFieldDefinitions(
  workspaceId: string,
): Promise<FieldDefinitionRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("custom_field_definitions")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("entity_type", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
