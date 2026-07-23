"use server";

import { revalidatePath } from "next/cache";
import { noteSchema, emailLogSchema } from "@crm/shared";
import { parseMentions } from "@crm/shared";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";
import { listWorkspaceMembers } from "@/lib/data/members";

export type NoteFormState = { error: string | null };

function entityPath(workspaceSlug: string, entityType: string, entityId: string) {
  const segment = entityType === "organization" ? "organizations" : `${entityType}s`;
  return `/app/${workspaceSlug}/${segment}/${entityId}`;
}

export async function createNote(
  workspaceSlug: string,
  entityType: string,
  entityId: string,
  _prevState: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const parsed = noteSchema.safeParse({ body: formData.get("body") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) return { error: "Workspace not found" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const members = await listWorkspaceMembers(workspace.id);
  const mentionedUserIds = parseMentions(
    parsed.data.body,
    members.map((m) => m.profile),
  );

  const { error } = await supabase.from("notes").insert({
    workspace_id: workspace.id,
    entity_type: entityType,
    entity_id: entityId,
    body: parsed.data.body,
    mentioned_user_ids: mentionedUserIds,
    author_id: user?.id,
  });

  if (error) return { error: error.message };

  revalidatePath(entityPath(workspaceSlug, entityType, entityId));
  return { error: null };
}

export async function deleteNote(
  workspaceSlug: string,
  entityType: string,
  entityId: string,
  noteId: string,
) {
  const supabase = await createClient();
  await supabase.from("notes").delete().eq("id", noteId);
  revalidatePath(entityPath(workspaceSlug, entityType, entityId));
}

export async function uploadFile(
  workspaceSlug: string,
  entityType: string,
  entityId: string,
  formData: FormData,
) {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return;

  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const storagePath = `${workspace.id}/${entityType}/${entityId}/${crypto.randomUUID()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("attachments")
    .upload(storagePath, file, { contentType: file.type });

  if (uploadError) throw new Error(uploadError.message);

  const { error } = await supabase.from("files").insert({
    workspace_id: workspace.id,
    entity_type: entityType,
    entity_id: entityId,
    filename: file.name,
    storage_path: storagePath,
    content_type: file.type || null,
    size_bytes: file.size,
    uploaded_by: user?.id,
  });

  if (error) throw new Error(error.message);

  revalidatePath(entityPath(workspaceSlug, entityType, entityId));
}

export async function deleteFile(
  workspaceSlug: string,
  entityType: string,
  entityId: string,
  fileId: string,
  storagePath: string,
) {
  const supabase = await createClient();
  await supabase.storage.from("attachments").remove([storagePath]);
  await supabase.from("files").delete().eq("id", fileId);
  revalidatePath(entityPath(workspaceSlug, entityType, entityId));
}

export type EmailLogFormState = { error: string | null };

export async function logEmail(
  workspaceSlug: string,
  entityType: "deal" | "person" | "organization",
  entityId: string,
  _prevState: EmailLogFormState,
  formData: FormData,
): Promise<EmailLogFormState> {
  const parsed = emailLogSchema.safeParse({
    direction: formData.get("direction") || "outbound",
    subject: formData.get("subject") || "",
    body: formData.get("body"),
    from_address: formData.get("from_address") || "",
    to_addresses: formData.get("to_addresses") || "",
    sent_at: formData.get("sent_at") || "",
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

  const { error } = await supabase.from("emails").insert({
    workspace_id: workspace.id,
    direction: parsed.data.direction,
    subject: parsed.data.subject || null,
    body: parsed.data.body,
    from_address: parsed.data.from_address || null,
    to_addresses: parsed.data.to_addresses
      ? parsed.data.to_addresses.split(",").map((s) => s.trim()).filter(Boolean)
      : [],
    sent_at: parsed.data.sent_at || new Date().toISOString(),
    deal_id: entityType === "deal" ? entityId : null,
    person_id: entityType === "person" ? entityId : null,
    organization_id: entityType === "organization" ? entityId : null,
    logged_by: user?.id,
  });

  if (error) return { error: error.message };

  revalidatePath(entityPath(workspaceSlug, entityType, entityId));
  return { error: null };
}

export async function deleteEmail(
  workspaceSlug: string,
  entityType: string,
  entityId: string,
  emailId: string,
) {
  const supabase = await createClient();
  await supabase.from("emails").delete().eq("id", emailId);
  revalidatePath(entityPath(workspaceSlug, entityType, entityId));
}
