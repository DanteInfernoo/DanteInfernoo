import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function listLabels(workspaceId: string, entityType: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("labels")
    .select("id, name, color")
    .eq("workspace_id", workspaceId)
    .eq("entity_type", entityType)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listAllLabels(workspaceId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("labels")
    .select("id, entity_type, name, color")
    .eq("workspace_id", workspaceId)
    .order("entity_type", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listEntityLabels(entityType: string, entityId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("entity_labels")
    .select("label_id, label:labels(id, name, color)")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId);

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as {
    label_id: string;
    label: { id: string; name: string; color: string };
  }[];
}
