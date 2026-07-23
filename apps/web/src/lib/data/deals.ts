import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@crm/shared";

export type DealRow = Database["public"]["Tables"]["deals"]["Row"];
export type DealWithRelations = DealRow & {
  organization: { id: string; name: string } | null;
  person: { id: string; name: string } | null;
  owner: { id: string; full_name: string | null; email: string } | null;
};

export async function listOpenDealsByPipeline(
  workspaceId: string,
  pipelineId: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deals")
    .select("*, organization:organizations(id, name), person:persons(id, name), owner:profiles(id, full_name, email)")
    .eq("workspace_id", workspaceId)
    .eq("pipeline_id", pipelineId)
    .eq("status", "open")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as DealWithRelations[];
}

export async function listAllDealsByPipeline(
  workspaceId: string,
  pipelineId: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deals")
    .select("*, organization:organizations(id, name), person:persons(id, name), owner:profiles(id, full_name, email)")
    .eq("workspace_id", workspaceId)
    .eq("pipeline_id", pipelineId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as DealWithRelations[];
}

export async function getDeal(workspaceId: string, id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deals")
    .select("*, organization:organizations(id, name), person:persons(id, name), owner:profiles(id, full_name, email)")
    .eq("workspace_id", workspaceId)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as unknown as DealWithRelations | null;
}
