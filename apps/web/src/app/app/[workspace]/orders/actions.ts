"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { orderSchema } from "@crm/shared";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";

export type OrderFormState = { error: string | null };

function readOrderFields(formData: FormData) {
  return orderSchema.safeParse({
    organization_id: formData.get("organization_id"),
    po_number: formData.get("po_number") || "",
    order_date: formData.get("order_date"),
    requested_delivery_date: formData.get("requested_delivery_date") || "",
    status: formData.get("status") || "draft",
    tax_rate: formData.get("tax_rate") || 0,
  });
}

export async function createOrder(
  workspaceSlug: string,
  _prevState: OrderFormState,
  formData: FormData,
): Promise<OrderFormState> {
  const parsed = readOrderFields(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) return { error: "Workspace not found" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("orders")
    .insert({
      workspace_id: workspace.id,
      organization_id: parsed.data.organization_id,
      po_number: parsed.data.po_number || null,
      order_date: parsed.data.order_date,
      requested_delivery_date: parsed.data.requested_delivery_date || null,
      status: parsed.data.status,
      tax_rate: parsed.data.tax_rate,
      created_by: user?.id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  redirect(`/app/${workspaceSlug}/orders/${data.id}`);
}

export async function updateOrder(
  workspaceSlug: string,
  orderId: string,
  _prevState: OrderFormState,
  formData: FormData,
): Promise<OrderFormState> {
  const parsed = readOrderFields(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({
      organization_id: parsed.data.organization_id,
      po_number: parsed.data.po_number || null,
      order_date: parsed.data.order_date,
      requested_delivery_date: parsed.data.requested_delivery_date || null,
      status: parsed.data.status,
      tax_rate: parsed.data.tax_rate,
    })
    .eq("id", orderId);

  if (error) return { error: error.message };

  await supabase.rpc("recalculate_order_totals", { p_order_id: orderId });

  revalidatePath(`/app/${workspaceSlug}/orders/${orderId}`);
  return { error: null };
}

export async function deleteOrder(workspaceSlug: string, orderId: string) {
  const supabase = await createClient();
  await supabase.from("orders").delete().eq("id", orderId);
  redirect(`/app/${workspaceSlug}/orders`);
}

export async function reorderFromLast(
  workspaceSlug: string,
  organizationId: string,
) {
  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) return;

  const supabase = await createClient();
  const { data: lastOrder } = await supabase
    .from("orders")
    .select("id, tax_rate")
    .eq("organization_id", organizationId)
    .order("order_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!lastOrder) return;

  const { data: lineItems } = await supabase
    .from("line_items")
    .select("product_id, description, quantity, unit_price, unit_cost")
    .eq("entity_type", "order")
    .eq("entity_id", lastOrder.id);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: newOrder, error } = await supabase
    .from("orders")
    .insert({
      workspace_id: workspace.id,
      organization_id: organizationId,
      order_date: new Date().toISOString().slice(0, 10),
      status: "draft",
      tax_rate: lastOrder.tax_rate,
      created_by: user?.id,
    })
    .select("id")
    .single();

  if (error || !newOrder) return;

  if (lineItems && lineItems.length > 0) {
    await supabase.from("line_items").insert(
      lineItems.map((li) => ({
        workspace_id: workspace.id,
        entity_type: "order" as const,
        entity_id: newOrder.id,
        product_id: li.product_id,
        description: li.description,
        quantity: li.quantity,
        unit_price: li.unit_price,
        unit_cost: li.unit_cost,
      })),
    );
  }

  redirect(`/app/${workspaceSlug}/orders/${newOrder.id}`);
}
