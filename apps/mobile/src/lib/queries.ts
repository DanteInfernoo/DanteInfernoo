import { supabase } from "./supabase";
import type { Database } from "@crm/shared";

export interface MembershipSummary {
  role: string;
  workspace: { id: string; name: string; slug: string };
}

export async function listMemberships(): Promise<MembershipSummary[]> {
  const { data, error } = await supabase
    .from("workspace_members")
    .select("role, workspace:workspaces(id, name, slug)")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as MembershipSummary[];
}

export type DealRow = Database["public"]["Tables"]["deals"]["Row"];
export type DealWithRelations = DealRow & {
  stage: { id: string; name: string; sort_order: number } | null;
  organization: { id: string; name: string } | null;
  person: { id: string; name: string } | null;
};

export async function listOpenDeals(workspaceId: string) {
  const { data, error } = await supabase
    .from("deals")
    .select(
      "*, stage:stages(id, name, sort_order), organization:organizations(id, name), person:persons(id, name)",
    )
    .eq("workspace_id", workspaceId)
    .eq("status", "open")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as DealWithRelations[]).sort(
    (a, b) => (a.stage?.sort_order ?? 0) - (b.stage?.sort_order ?? 0),
  );
}

export async function getDeal(id: string) {
  const { data, error } = await supabase
    .from("deals")
    .select(
      "*, stage:stages(id, name, sort_order), organization:organizations(id, name), person:persons(id, name)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as unknown as DealWithRelations | null;
}

export type OrganizationRow =
  Database["public"]["Tables"]["organizations"]["Row"];

export async function listOrganizations(workspaceId: string, query?: string) {
  let request = supabase
    .from("organizations")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("name", { ascending: true });

  if (query) request = request.ilike("name", `%${query}%`);

  const { data, error } = await request;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getOrganization(id: string) {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export type PersonRow = Database["public"]["Tables"]["persons"]["Row"];
export type PersonWithOrganization = PersonRow & {
  organization: { id: string; name: string } | null;
};

export async function listPersons(workspaceId: string, query?: string) {
  let request = supabase
    .from("persons")
    .select("*, organization:organizations(id, name)")
    .eq("workspace_id", workspaceId)
    .order("name", { ascending: true });

  if (query) request = request.ilike("name", `%${query}%`);

  const { data, error } = await request;
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as PersonWithOrganization[];
}

export async function listPersonsForOrganization(organizationId: string) {
  const { data, error } = await supabase
    .from("persons")
    .select("*")
    .eq("organization_id", organizationId)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getPerson(id: string) {
  const { data, error } = await supabase
    .from("persons")
    .select("*, organization:organizations(id, name)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as unknown as PersonWithOrganization | null;
}

export type ActivityRow = Database["public"]["Tables"]["activities"]["Row"];
export type ActivityWithRelations = ActivityRow & {
  type: { id: string; name: string; icon: string; color: string } | null;
  organization: { id: string; name: string } | null;
  person: { id: string; name: string } | null;
  deal: { id: string; title: string } | null;
};

/** Activities due today or earlier that aren't done yet, oldest due first. */
export async function listDueActivities(workspaceId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("activities")
    .select(
      "*, type:activity_types(id, name, icon, color), organization:organizations(id, name), person:persons(id, name), deal:deals(id, title)",
    )
    .eq("workspace_id", workspaceId)
    .eq("is_done", false)
    .lte("due_date", today)
    .order("due_date", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as ActivityWithRelations[];
}

export async function listUpcomingActivities(workspaceId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("activities")
    .select(
      "*, type:activity_types(id, name, icon, color), organization:organizations(id, name), person:persons(id, name), deal:deals(id, title)",
    )
    .eq("workspace_id", workspaceId)
    .eq("is_done", false)
    .gt("due_date", today)
    .order("due_date", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as ActivityWithRelations[];
}

export async function setActivityDone(id: string, isDone: boolean) {
  const { error } = await supabase
    .from("activities")
    .update({ is_done: isDone })
    .eq("id", id);

  if (error) throw new Error(error.message);
}
