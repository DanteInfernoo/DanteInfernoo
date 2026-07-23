"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";

function entityPath(workspaceSlug: string, entityType: string, entityId: string) {
  const segment = entityType === "deal" ? "deals" : "orders";
  return `/app/${workspaceSlug}/${segment}/${entityId}`;
}

export async function addLineItem(
  workspaceSlug: string,
  entityType: "deal" | "order",
  entityId: string,
  formData: FormData,
) {
  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) return;

  const productId = (formData.get("product_id") as string) || null;
  const quantity = Number(formData.get("quantity") || 1);
  const unitPrice = Number(formData.get("unit_price") || 0);

  const supabase = await createClient();

  let unitCost: number | null = null;
  if (productId) {
    const { data: product } = await supabase
      .from("products")
      .select("cost")
      .eq("id", productId)
      .maybeSingle();
    unitCost = product?.cost ?? null;
  }

  await supabase.from("line_items").insert({
    workspace_id: workspace.id,
    entity_type: entityType,
    entity_id: entityId,
    product_id: productId,
    description: (formData.get("description") as string) || null,
    quantity,
    unit_price: unitPrice,
    unit_cost: unitCost,
  });

  revalidatePath(entityPath(workspaceSlug, entityType, entityId));
}

export async function deleteLineItem(
  workspaceSlug: string,
  entityType: string,
  entityId: string,
  lineItemId: string,
) {
  const supabase = await createClient();
  await supabase.from("line_items").delete().eq("id", lineItemId);
  revalidatePath(entityPath(workspaceSlug, entityType, entityId));
}
