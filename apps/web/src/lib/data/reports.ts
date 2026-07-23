import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface WonLostSummary {
  wonCount: number;
  wonValue: number;
  lostCount: number;
  lostValue: number;
  winRate: number;
}

export async function getWonLostSummary(
  workspaceId: string,
): Promise<WonLostSummary> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deals")
    .select("status, value")
    .eq("workspace_id", workspaceId)
    .in("status", ["won", "lost"]);

  if (error) throw new Error(error.message);

  const won = (data ?? []).filter((d) => d.status === "won");
  const lost = (data ?? []).filter((d) => d.status === "lost");
  const wonValue = won.reduce((s, d) => s + d.value, 0);
  const lostValue = lost.reduce((s, d) => s + d.value, 0);
  const total = won.length + lost.length;

  return {
    wonCount: won.length,
    wonValue,
    lostCount: lost.length,
    lostValue,
    winRate: total > 0 ? (won.length / total) * 100 : 0,
  };
}

export async function getAvgCycleTimeDays(workspaceId: string): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deals")
    .select("created_at, closed_at")
    .eq("workspace_id", workspaceId)
    .not("closed_at", "is", null);

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) return 0;

  const totalDays = data.reduce((sum, d) => {
    const days =
      (new Date(d.closed_at!).getTime() - new Date(d.created_at).getTime()) /
      (1000 * 60 * 60 * 24);
    return sum + days;
  }, 0);

  return totalDays / data.length;
}

export async function getRevenueByMonth(workspaceId: string, months = 6) {
  const supabase = await createClient();
  const since = new Date();
  since.setMonth(since.getMonth() - (months - 1));
  since.setDate(1);

  const { data, error } = await supabase
    .from("deals")
    .select("value, closed_at")
    .eq("workspace_id", workspaceId)
    .eq("status", "won")
    .gte("closed_at", since.toISOString());

  if (error) throw new Error(error.message);

  const byMonth = new Map<string, number>();
  for (let i = 0; i < months; i++) {
    const d = new Date(since);
    d.setMonth(d.getMonth() + i);
    byMonth.set(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, 0);
  }

  for (const deal of data ?? []) {
    const key = deal.closed_at!.slice(0, 7);
    if (byMonth.has(key)) {
      byMonth.set(key, (byMonth.get(key) ?? 0) + deal.value);
    }
  }

  return [...byMonth.entries()].map(([month, revenue]) => ({ month, revenue }));
}

export async function getRevenueByOwner(workspaceId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deals")
    .select("value, owner:profiles(id, full_name, email)")
    .eq("workspace_id", workspaceId)
    .eq("status", "won");

  if (error) throw new Error(error.message);

  const byOwner = new Map<string, number>();
  for (const deal of (data ?? []) as unknown as {
    value: number;
    owner: { full_name: string | null; email: string } | null;
  }[]) {
    const name = deal.owner?.full_name ?? deal.owner?.email ?? "Unassigned";
    byOwner.set(name, (byOwner.get(name) ?? 0) + deal.value);
  }

  return [...byOwner.entries()]
    .map(([owner, revenue]) => ({ owner, revenue }))
    .sort((a, b) => b.revenue - a.revenue);
}

export async function getRevenueByOrganization(workspaceId: string, limit = 10) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deals")
    .select("value, organization:organizations(id, name)")
    .eq("workspace_id", workspaceId)
    .eq("status", "won");

  if (error) throw new Error(error.message);

  const byOrg = new Map<string, number>();
  for (const deal of (data ?? []) as unknown as {
    value: number;
    organization: { name: string } | null;
  }[]) {
    const name = deal.organization?.name ?? "No organization";
    byOrg.set(name, (byOrg.get(name) ?? 0) + deal.value);
  }

  return [...byOrg.entries()]
    .map(([organization, revenue]) => ({ organization, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

export async function getRevenueBySource(workspaceId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deals")
    .select("value, source")
    .eq("workspace_id", workspaceId)
    .eq("status", "won");

  if (error) throw new Error(error.message);

  const bySource = new Map<string, number>();
  for (const deal of data ?? []) {
    const key = deal.source ?? "Unknown";
    bySource.set(key, (bySource.get(key) ?? 0) + deal.value);
  }

  return [...bySource.entries()]
    .map(([source, revenue]) => ({ source, revenue }))
    .sort((a, b) => b.revenue - a.revenue);
}

export async function getFunnelData(workspaceId: string, pipelineId: string) {
  const supabase = await createClient();
  const { data: stages, error: stagesError } = await supabase
    .from("stages")
    .select("id, name, sort_order")
    .eq("pipeline_id", pipelineId)
    .order("sort_order", { ascending: true });

  if (stagesError) throw new Error(stagesError.message);

  const { data: deals, error } = await supabase
    .from("deals")
    .select("stage_id, value")
    .eq("workspace_id", workspaceId)
    .eq("pipeline_id", pipelineId)
    .eq("status", "open");

  if (error) throw new Error(error.message);

  return (stages ?? []).map((stage) => {
    const inStage = (deals ?? []).filter((d) => d.stage_id === stage.id);
    return {
      stage: stage.name,
      count: inStage.length,
      value: inStage.reduce((s, d) => s + d.value, 0),
    };
  });
}

export interface StageConversion {
  stage: string;
  enteredCount: number;
  wonCount: number;
  conversionRate: number;
  avgDaysInStage: number;
}

export async function getConversionByStage(
  workspaceId: string,
  pipelineId: string,
): Promise<StageConversion[]> {
  const supabase = await createClient();
  const { data: stages, error: stagesError } = await supabase
    .from("stages")
    .select("id, name, sort_order")
    .eq("pipeline_id", pipelineId)
    .order("sort_order", { ascending: true });

  if (stagesError) throw new Error(stagesError.message);

  const { data: deals, error: dealsError } = await supabase
    .from("deals")
    .select("id, status")
    .eq("workspace_id", workspaceId)
    .eq("pipeline_id", pipelineId);

  if (dealsError) throw new Error(dealsError.message);

  const dealIds = (deals ?? []).map((d) => d.id);
  const statusById = new Map((deals ?? []).map((d) => [d.id, d.status]));

  const { data: history, error: historyError } = await supabase
    .from("deal_stage_history")
    .select("deal_id, stage_id, entered_at, exited_at")
    .in("deal_id", dealIds.length > 0 ? dealIds : ["00000000-0000-0000-0000-000000000000"]);

  if (historyError) throw new Error(historyError.message);

  return (stages ?? []).map((stage) => {
    const rows = (history ?? []).filter((h) => h.stage_id === stage.id);
    const enteredDealIds = new Set(rows.map((h) => h.deal_id));
    const wonCount = [...enteredDealIds].filter(
      (id) => statusById.get(id) === "won",
    ).length;

    const durations = rows
      .filter((h) => h.exited_at)
      .map(
        (h) =>
          (new Date(h.exited_at!).getTime() - new Date(h.entered_at).getTime()) /
          (1000 * 60 * 60 * 24),
      );
    const avgDaysInStage =
      durations.length > 0
        ? durations.reduce((a, b) => a + b, 0) / durations.length
        : 0;

    return {
      stage: stage.name,
      enteredCount: enteredDealIds.size,
      wonCount,
      conversionRate:
        enteredDealIds.size > 0 ? (wonCount / enteredDealIds.size) * 100 : 0,
      avgDaysInStage,
    };
  });
}

export async function getActivityLeaderboard(workspaceId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activities")
    .select("owner:profiles(id, full_name, email)")
    .eq("workspace_id", workspaceId)
    .eq("is_done", true);

  if (error) throw new Error(error.message);

  const byOwner = new Map<string, number>();
  for (const activity of (data ?? []) as unknown as {
    owner: { full_name: string | null; email: string } | null;
  }[]) {
    const name = activity.owner?.full_name ?? activity.owner?.email ?? "Unassigned";
    byOwner.set(name, (byOwner.get(name) ?? 0) + 1);
  }

  return [...byOwner.entries()]
    .map(([owner, completedCount]) => ({ owner, completedCount }))
    .sort((a, b) => b.completedCount - a.completedCount);
}
