"use server";

import { revalidatePath } from "next/cache";
import { sampleSchema } from "@crm/shared";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";

export type SampleFormState = { error: string | null };

export async function createSample(
  workspaceSlug: string,
  _prevState: SampleFormState,
  formData: FormData,
): Promise<SampleFormState> {
  const parsed = sampleSchema.safeParse({
    organization_id: formData.get("organization_id"),
    person_id: formData.get("person_id") || "",
    product_id: formData.get("product_id"),
    dropped_date: formData.get("dropped_date"),
    feedback: formData.get("feedback") || "",
    follow_up_in_days: formData.get("follow_up_in_days") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) return { error: "Workspace not found" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let followUpActivityId: string | null = null;

  if (parsed.data.follow_up_in_days) {
    const { data: activityType } = await supabase
      .from("activity_types")
      .select("id")
      .eq("workspace_id", workspace.id)
      .limit(1)
      .maybeSingle();

    if (activityType) {
      const dueDate = new Date(parsed.data.dropped_date);
      dueDate.setDate(dueDate.getDate() + parsed.data.follow_up_in_days);

      const { data: product } = await supabase
        .from("products")
        .select("name")
        .eq("id", parsed.data.product_id)
        .maybeSingle();

      const { data: activity } = await supabase
        .from("activities")
        .insert({
          workspace_id: workspace.id,
          type_id: activityType.id,
          subject: `Follow up on sample: ${product?.name ?? "product"}`,
          due_date: dueDate.toISOString().slice(0, 10),
          organization_id: parsed.data.organization_id,
          person_id: parsed.data.person_id || null,
          owner_id: user?.id,
        })
        .select("id")
        .single();

      followUpActivityId = activity?.id ?? null;
    }
  }

  const { error } = await supabase.from("samples").insert({
    workspace_id: workspace.id,
    organization_id: parsed.data.organization_id,
    person_id: parsed.data.person_id || null,
    product_id: parsed.data.product_id,
    dropped_date: parsed.data.dropped_date,
    feedback: parsed.data.feedback || null,
    follow_up_activity_id: followUpActivityId,
    created_by: user?.id,
  });

  if (error) return { error: error.message };

  revalidatePath(`/app/${workspaceSlug}/samples`);
  return { error: null };
}

export async function markSampleConverted(
  workspaceSlug: string,
  sampleId: string,
  orderId: string,
) {
  const supabase = await createClient();
  await supabase
    .from("samples")
    .update({ converted_order_id: orderId })
    .eq("id", sampleId);
  revalidatePath(`/app/${workspaceSlug}/samples`);
}

export async function deleteSample(id: string, workspaceSlug: string) {
  const supabase = await createClient();
  await supabase.from("samples").delete().eq("id", id);
  revalidatePath(`/app/${workspaceSlug}/samples`);
}
