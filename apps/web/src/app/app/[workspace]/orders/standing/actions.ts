"use server";

import { revalidatePath } from "next/cache";
import { standingOrderSchema, type Json } from "@crm/shared";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";

export type StandingOrderFormState = { error: string | null };

export async function createStandingOrder(
  workspaceSlug: string,
  _prevState: StandingOrderFormState,
  formData: FormData,
): Promise<StandingOrderFormState> {
  const parsed = standingOrderSchema.safeParse({
    organization_id: formData.get("organization_id"),
    name: formData.get("name"),
    interval: formData.get("interval"),
    next_generation_date: formData.get("next_generation_date"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const productId = formData.get("product_id") as string;
  const quantity = Number(formData.get("quantity") || 0);
  if (!productId || quantity <= 0) {
    return { error: "Pick a product and quantity" };
  }

  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) return { error: "Workspace not found" };

  const supabase = await createClient();
  const { error } = await supabase.from("standing_orders").insert({
    workspace_id: workspace.id,
    organization_id: parsed.data.organization_id,
    name: parsed.data.name,
    interval: parsed.data.interval,
    next_generation_date: parsed.data.next_generation_date,
    line_items_template: [
      { product_id: productId, quantity },
    ] as Json,
  });

  if (error) return { error: error.message };

  revalidatePath(`/app/${workspaceSlug}/orders/standing`);
  return { error: null };
}

export async function toggleStandingOrder(
  id: string,
  workspaceSlug: string,
  isActive: boolean,
) {
  const supabase = await createClient();
  await supabase.from("standing_orders").update({ is_active: isActive }).eq("id", id);
  revalidatePath(`/app/${workspaceSlug}/orders/standing`);
}

export async function deleteStandingOrder(id: string, workspaceSlug: string) {
  const supabase = await createClient();
  await supabase.from("standing_orders").delete().eq("id", id);
  revalidatePath(`/app/${workspaceSlug}/orders/standing`);
}

export async function generateDueOrdersNow(workspaceSlug: string) {
  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) return 0;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("generate_due_standing_orders", {
    p_workspace_id: workspace.id,
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/app/${workspaceSlug}/orders/standing`);
  revalidatePath(`/app/${workspaceSlug}/orders`);
  return data ?? 0;
}
