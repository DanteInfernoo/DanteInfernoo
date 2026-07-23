import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@crm/shared";

export type ActivityRow = Database["public"]["Tables"]["activities"]["Row"];
export type ActivityWithRelations = ActivityRow & {
  type: { id: string; name: string; icon: string; color: string };
  deal: { id: string; title: string } | null;
  person: { id: string; name: string } | null;
  organization: { id: string; name: string } | null;
};

const SELECT_WITH_RELATIONS =
  "*, type:activity_types(id, name, icon, color), deal:deals(id, title), person:persons(id, name), organization:organizations(id, name)";

export async function listActivitiesInRange(
  workspaceId: string,
  from: string,
  to: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activities")
    .select(SELECT_WITH_RELATIONS)
    .eq("workspace_id", workspaceId)
    .gte("due_date", from)
    .lte("due_date", to)
    .order("due_date", { ascending: true })
    .order("due_time", { ascending: true, nullsFirst: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as ActivityWithRelations[];
}

export async function listUpcomingActivities(
  workspaceId: string,
  includeDone: boolean,
) {
  const supabase = await createClient();
  let request = supabase
    .from("activities")
    .select(SELECT_WITH_RELATIONS)
    .eq("workspace_id", workspaceId)
    .order("due_date", { ascending: true })
    .order("due_time", { ascending: true, nullsFirst: false });

  if (!includeDone) request = request.eq("is_done", false);

  const { data, error } = await request;
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as ActivityWithRelations[];
}

export async function getActivity(workspaceId: string, id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activities")
    .select(SELECT_WITH_RELATIONS)
    .eq("workspace_id", workspaceId)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as unknown as ActivityWithRelations | null;
}

export async function listActivitiesForEntity(
  entity: "deal" | "person" | "organization",
  entityId: string,
) {
  const supabase = await createClient();
  const column = `${entity}_id`;
  const { data, error } = await supabase
    .from("activities")
    .select(SELECT_WITH_RELATIONS)
    .eq(column, entityId)
    .order("due_date", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as ActivityWithRelations[];
}

/** Deal ids in this workspace that have at least one incomplete activity —
 * used to flag the inverse set ("no next activity scheduled") on the board. */
export async function listDealIdsWithOpenActivity(
  workspaceId: string,
): Promise<Set<string>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activities")
    .select("deal_id")
    .eq("workspace_id", workspaceId)
    .eq("is_done", false)
    .not("deal_id", "is", null);

  if (error) throw new Error(error.message);
  return new Set((data ?? []).map((a) => a.deal_id as string));
}
