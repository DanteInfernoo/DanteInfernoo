import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@crm/shared";

export type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
export type OrderWithOrganization = OrderRow & {
  organization: { id: string; name: string };
};

export async function listOrders(workspaceId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, organization:organizations(id, name)")
    .eq("workspace_id", workspaceId)
    .order("order_date", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as OrderWithOrganization[];
}

export async function listOrdersForOrganization(organizationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("organization_id", organizationId)
    .order("order_date", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getOrder(workspaceId: string, id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, organization:organizations(id, name)")
    .eq("workspace_id", workspaceId)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as unknown as OrderWithOrganization | null;
}
