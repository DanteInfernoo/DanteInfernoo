import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@crm/shared";

export type LineItemRow = Database["public"]["Tables"]["line_items"]["Row"];
export type LineItemWithProduct = LineItemRow & {
  product: { id: string; name: string; sku: string } | null;
};

export async function listLineItems(entityType: "deal" | "order", entityId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("line_items")
    .select("*, product:products(id, name, sku)")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as LineItemWithProduct[];
}
