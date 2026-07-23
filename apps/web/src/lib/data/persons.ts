import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@crm/shared";

export type PersonRow = Database["public"]["Tables"]["persons"]["Row"];
export type PersonWithOrg = PersonRow & {
  organization: { id: string; name: string } | null;
};

export async function listPersons(workspaceId: string, query?: string) {
  const supabase = await createClient();
  let request = supabase
    .from("persons")
    .select("*, organization:organizations(id, name)")
    .eq("workspace_id", workspaceId)
    .order("name", { ascending: true });

  if (query) {
    request = request.or(`name.ilike.%${query}%,email.ilike.%${query}%`);
  }

  const { data, error } = await request;
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as PersonWithOrg[];
}

export async function getPerson(workspaceId: string, id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("persons")
    .select("*, organization:organizations(id, name)")
    .eq("workspace_id", workspaceId)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as unknown as PersonWithOrg | null;
}
