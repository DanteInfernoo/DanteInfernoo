import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@crm/shared";

export type OrganizationRow =
  Database["public"]["Tables"]["organizations"]["Row"];

export async function listOrganizations(workspaceId: string, query?: string) {
  const supabase = await createClient();
  let request = supabase
    .from("organizations")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("name", { ascending: true });

  if (query) {
    request = request.ilike("name", `%${query}%`);
  }

  const { data, error } = await request;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getOrganization(workspaceId: string, id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function listChildOrganizations(parentOrganizationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("parent_organization_id", parentOrganizationId)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listPersonsForOrganization(
  workspaceId: string,
  organizationId: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("persons")
    .select("id, name, email, phone")
    .eq("workspace_id", workspaceId)
    .eq("organization_id", organizationId)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}
