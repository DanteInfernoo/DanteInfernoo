import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@crm/shared";

export type TerritoryRow = Database["public"]["Tables"]["territories"]["Row"];

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function dayName(day: number | null) {
  return day === null || day === undefined ? "Unscheduled" : DAY_NAMES[day];
}

export async function listTerritories(workspaceId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("territories")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listOrganizationsWithRoute(workspaceId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("id, name, delivery_day, territory:territories(id, name)")
    .eq("workspace_id", workspaceId)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as {
    id: string;
    name: string;
    delivery_day: number | null;
    territory: { id: string; name: string } | null;
  }[];
}
