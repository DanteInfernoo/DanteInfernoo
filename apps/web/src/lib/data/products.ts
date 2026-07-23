import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@crm/shared";

export type ProductRow = Database["public"]["Tables"]["products"]["Row"];
export type PriceListRow = Database["public"]["Tables"]["price_lists"]["Row"];

export async function listProducts(workspaceId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listPriceLists(workspaceId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("price_lists")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listPriceListItems(priceListId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("price_list_items")
    .select("*, product:products(id, name, sku)")
    .eq("price_list_id", priceListId);

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as (Database["public"]["Tables"]["price_list_items"]["Row"] & {
    product: { id: string; name: string; sku: string };
  })[];
}

export async function listAccountPriceOverrides(organizationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("account_price_overrides")
    .select("*, product:products(id, name, sku)")
    .eq("organization_id", organizationId);

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as (Database["public"]["Tables"]["account_price_overrides"]["Row"] & {
    product: { id: string; name: string; sku: string };
  })[];
}
