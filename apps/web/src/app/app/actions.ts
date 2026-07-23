"use server";

import { redirect } from "next/navigation";
import { workspaceCreateSchema } from "@crm/shared";
import { createClient } from "@/lib/supabase/server";

export type CreateWorkspaceState = { error: string | null };

export async function createWorkspace(
  _prevState: CreateWorkspaceState,
  formData: FormData,
): Promise<CreateWorkspaceState> {
  const parsed = workspaceCreateSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .insert({ name: parsed.data.name, slug: parsed.data.slug, created_by: user.id })
    .select("id, slug")
    .single();

  if (workspaceError) {
    return {
      error: workspaceError.code === "23505" ? "That slug is already taken" : workspaceError.message,
    };
  }

  const { error: memberError } = await supabase
    .from("workspace_members")
    .insert({ workspace_id: workspace.id, user_id: user.id, role: "owner" });

  if (memberError) {
    return { error: memberError.message };
  }

  redirect(`/app/${workspace.slug}/dashboard`);
}
