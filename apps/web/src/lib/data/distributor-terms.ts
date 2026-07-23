import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@crm/shared";

export type DistributorSkuTermRow =
  Database["public"]["Tables"]["distributor_sku_terms"]["Row"];

export async function listDistributorSkuTerms(organizationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("distributor_sku_terms")
    .select("*, product:products(id, name, sku)")
    .eq("organization_id", organizationId);

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as (DistributorSkuTermRow & {
    product: { id: string; name: string; sku: string };
  })[];
}

export async function getDistributorRollupRevenue(
  organizationId: string,
): Promise<number> {
  const supabase = await createClient();
  const { data: children } = await supabase
    .from("organizations")
    .select("id")
    .eq("parent_organization_id", organizationId);

  const ids = [organizationId, ...(children ?? []).map((c) => c.id)];

  const { data: orders, error } = await supabase
    .from("orders")
    .select("total")
    .in("organization_id", ids);

  if (error) throw new Error(error.message);
  return (orders ?? []).reduce((s, o) => s + o.total, 0);
}
