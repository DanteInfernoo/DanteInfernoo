"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";

export async function toggleModule(
  workspaceSlug: string,
  moduleKey: string,
  enabled: boolean,
) {
  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) return;

  const current = (workspace.enabled_modules as string[] | null) ?? [];
  const next = enabled
    ? [...new Set([...current, moduleKey])]
    : current.filter((m) => m !== moduleKey);

  const supabase = await createClient();
  await supabase
    .from("workspaces")
    .update({ enabled_modules: next })
    .eq("id", workspace.id);

  revalidatePath(`/app/${workspaceSlug}`, "layout");
}
