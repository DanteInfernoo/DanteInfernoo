"use server";

import { revalidatePath } from "next/cache";
import { emailTemplateSchema } from "@crm/shared";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";

export type EmailTemplateFormState = { error: string | null };

export async function createEmailTemplate(
  workspaceSlug: string,
  _prevState: EmailTemplateFormState,
  formData: FormData,
): Promise<EmailTemplateFormState> {
  const parsed = emailTemplateSchema.safeParse({
    name: formData.get("name"),
    subject: formData.get("subject"),
    body: formData.get("body"),
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

  const { error } = await supabase.from("email_templates").insert({
    workspace_id: workspace.id,
    name: parsed.data.name,
    subject: parsed.data.subject,
    body: parsed.data.body,
    created_by: user?.id,
  });

  if (error) return { error: error.message };

  revalidatePath(`/app/${workspaceSlug}/settings/email-templates`);
  return { error: null };
}

export async function deleteEmailTemplate(id: string, workspaceSlug: string) {
  const supabase = await createClient();
  await supabase.from("email_templates").delete().eq("id", id);
  revalidatePath(`/app/${workspaceSlug}/settings/email-templates`);
}
