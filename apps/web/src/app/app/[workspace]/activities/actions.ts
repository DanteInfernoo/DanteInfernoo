"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { activitySchema, nextRecurrenceDate } from "@crm/shared";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";

export type ActivityFormState = { error: string | null };

function readActivityFields(formData: FormData) {
  return activitySchema.safeParse({
    type_id: formData.get("type_id"),
    subject: formData.get("subject"),
    notes: formData.get("notes") || "",
    due_date: formData.get("due_date"),
    due_time: formData.get("due_time") || "",
    duration_minutes: formData.get("duration_minutes") || undefined,
    deal_id: formData.get("deal_id") || "",
    person_id: formData.get("person_id") || "",
    organization_id: formData.get("organization_id") || "",
    recurrence_interval: formData.get("recurrence_interval") || "none",
    recurrence_until: formData.get("recurrence_until") || "",
  });
}

export async function createActivity(
  workspaceSlug: string,
  _prevState: ActivityFormState,
  formData: FormData,
): Promise<ActivityFormState> {
  const parsed = readActivityFields(formData);
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
    .from("activities")
    .insert({
      workspace_id: workspace.id,
      type_id: parsed.data.type_id,
      subject: parsed.data.subject,
      notes: parsed.data.notes || null,
      due_date: parsed.data.due_date,
      due_time: parsed.data.due_time || null,
      duration_minutes: parsed.data.duration_minutes ?? null,
      deal_id: parsed.data.deal_id || null,
      person_id: parsed.data.person_id || null,
      organization_id: parsed.data.organization_id || null,
      owner_id: user?.id,
      recurrence_interval: parsed.data.recurrence_interval,
      recurrence_until: parsed.data.recurrence_until || null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  redirect(`/app/${workspaceSlug}/activities/${data.id}`);
}

export async function updateActivity(
  workspaceSlug: string,
  activityId: string,
  _prevState: ActivityFormState,
  formData: FormData,
): Promise<ActivityFormState> {
  const parsed = readActivityFields(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("activities")
    .update({
      type_id: parsed.data.type_id,
      subject: parsed.data.subject,
      notes: parsed.data.notes || null,
      due_date: parsed.data.due_date,
      due_time: parsed.data.due_time || null,
      duration_minutes: parsed.data.duration_minutes ?? null,
      deal_id: parsed.data.deal_id || null,
      person_id: parsed.data.person_id || null,
      organization_id: parsed.data.organization_id || null,
      recurrence_interval: parsed.data.recurrence_interval,
      recurrence_until: parsed.data.recurrence_until || null,
    })
    .eq("id", activityId);

  if (error) return { error: error.message };

  revalidatePath(`/app/${workspaceSlug}/activities/${activityId}`);
  return { error: null };
}

export async function deleteActivity(workspaceSlug: string, activityId: string) {
  const supabase = await createClient();
  await supabase.from("activities").delete().eq("id", activityId);
  redirect(`/app/${workspaceSlug}/activities`);
}

export async function toggleActivityDone(
  workspaceSlug: string,
  activityId: string,
  isDone: boolean,
) {
  const supabase = await createClient();
  const { data: activity, error } = await supabase
    .from("activities")
    .update({ is_done: isDone })
    .eq("id", activityId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  if (isDone && activity) {
    const nextDate = nextRecurrenceDate(
      activity.due_date,
      activity.recurrence_interval,
      activity.recurrence_until,
    );

    if (nextDate) {
      await supabase.from("activities").insert({
        workspace_id: activity.workspace_id,
        type_id: activity.type_id,
        subject: activity.subject,
        notes: activity.notes,
        due_date: nextDate,
        due_time: activity.due_time,
        duration_minutes: activity.duration_minutes,
        deal_id: activity.deal_id,
        person_id: activity.person_id,
        organization_id: activity.organization_id,
        owner_id: activity.owner_id,
        recurrence_interval: activity.recurrence_interval,
        recurrence_until: activity.recurrence_until,
      });
    }
  }

  revalidatePath(`/app/${workspaceSlug}/activities`);
}
