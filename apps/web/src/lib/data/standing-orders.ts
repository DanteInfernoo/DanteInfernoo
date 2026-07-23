import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@crm/shared";

export type StandingOrderRow = Database["public"]["Tables"]["standing_orders"]["Row"];
export type StandingOrderWithOrganization = StandingOrderRow & {
  organization: { id: string; name: string };
};

export async function listStandingOrders(workspaceId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("standing_orders")
    .select("*, organization:organizations(id, name)")
    .eq("workspace_id", workspaceId)
    .order("next_generation_date", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as StandingOrderWithOrganization[];
}
