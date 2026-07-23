import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@crm/shared";

export type GoalRow = Database["public"]["Tables"]["goals"]["Row"];
export type GoalWithUser = GoalRow & {
  user: { id: string; full_name: string | null; email: string } | null;
};

export async function listGoalsForPeriod(workspaceId: string, period: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("goals")
    .select("*, user:profiles(id, full_name, email)")
    .eq("workspace_id", workspaceId)
    .eq("period", period);

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as GoalWithUser[];
}

function periodBounds(period: string) {
  const [year, month] = period.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  return { start: start.toISOString(), end: end.toISOString() };
}

export async function getGoalActual(
  workspaceId: string,
  goal: GoalRow,
): Promise<number> {
  const supabase = await createClient();
  const { start, end } = periodBounds(goal.period);

  if (goal.metric_type === "revenue") {
    let query = supabase
      .from("deals")
      .select("value")
      .eq("workspace_id", workspaceId)
      .eq("status", "won")
      .gte("closed_at", start)
      .lt("closed_at", end);
    if (goal.user_id) query = query.eq("owner_id", goal.user_id);
    const { data } = await query;
    return (data ?? []).reduce((s, d) => s + d.value, 0);
  }

  if (goal.metric_type === "deals_won") {
    let query = supabase
      .from("deals")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .eq("status", "won")
      .gte("closed_at", start)
      .lt("closed_at", end);
    if (goal.user_id) query = query.eq("owner_id", goal.user_id);
    const { count } = await query;
    return count ?? 0;
  }

  // activities_completed
  let query = supabase
    .from("activities")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .eq("is_done", true)
    .gte("done_at", start)
    .lt("done_at", end);
  if (goal.user_id) query = query.eq("owner_id", goal.user_id);
  const { count } = await query;
  return count ?? 0;
}
