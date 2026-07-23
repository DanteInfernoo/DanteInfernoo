import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/app/stat-card";
import { GoalProgress } from "@/components/app/goal-progress";
import { RevenueByMonthChart } from "@/components/app/charts/revenue-by-month-chart";
import { FunnelBarChart } from "@/components/app/charts/funnel-bar-chart";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";
import { getDefaultPipeline } from "@/lib/data/pipelines";
import { listGoalsForPeriod, getGoalActual } from "@/lib/data/goals";
import {
  getWonLostSummary,
  getAvgCycleTimeDays,
  getRevenueByMonth,
  getRevenueByOwner,
  getRevenueByOrganization,
  getRevenueBySource,
  getFunnelData,
  getConversionByStage,
  getActivityLeaderboard,
} from "@/lib/data/reports";

const currency = (n: number) =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace } = await params;
  const ws = await getWorkspaceBySlug(workspace);
  if (!ws) return null;

  const pipeline = await getDefaultPipeline(ws.id);
  const currentPeriod = new Date().toISOString().slice(0, 7);

  const [
    summary,
    avgCycleDays,
    revenueByMonth,
    revenueByOwner,
    revenueByOrg,
    revenueBySource,
    funnel,
    conversion,
    leaderboard,
    goals,
  ] = await Promise.all([
    getWonLostSummary(ws.id),
    getAvgCycleTimeDays(ws.id),
    getRevenueByMonth(ws.id),
    getRevenueByOwner(ws.id),
    getRevenueByOrganization(ws.id),
    getRevenueBySource(ws.id),
    pipeline ? getFunnelData(ws.id, pipeline.id) : Promise.resolve([]),
    pipeline ? getConversionByStage(ws.id, pipeline.id) : Promise.resolve([]),
    getActivityLeaderboard(ws.id),
    listGoalsForPeriod(ws.id, currentPeriod),
  ]);

  const goalsWithActuals = await Promise.all(
    goals.map(async (g) => ({ ...g, actual: await getGoalActual(ws.id, g) })),
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Won" value={currency(summary.wonValue)} sublabel={`${summary.wonCount} deals`} />
        <StatCard label="Lost" value={currency(summary.lostValue)} sublabel={`${summary.lostCount} deals`} />
        <StatCard label="Win rate" value={`${summary.winRate.toFixed(0)}%`} />
        <StatCard label="Avg cycle time" value={`${avgCycleDays.toFixed(1)}d`} />
      </div>

      {goalsWithActuals.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Goals this month</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {goalsWithActuals.map((g) => (
              <GoalProgress
                key={g.id}
                label={`${g.metric_type.replace("_", " ")} — ${g.user?.full_name ?? g.user?.email ?? "Whole workspace"}`}
                actual={g.actual}
                target={g.target_value}
                isCurrency={g.metric_type === "revenue"}
              />
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue by month</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueByMonthChart data={revenueByMonth} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Open pipeline funnel {pipeline ? `(${pipeline.name})` : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FunnelBarChart data={funnel} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Conversion & time by stage</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left">
              <tr>
                <th className="px-2 py-1 font-medium">Stage</th>
                <th className="px-2 py-1 font-medium">Entered</th>
                <th className="px-2 py-1 font-medium">Won</th>
                <th className="px-2 py-1 font-medium">Conversion</th>
                <th className="px-2 py-1 font-medium">Avg days in stage</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {conversion.map((c) => (
                <tr key={c.stage}>
                  <td className="px-2 py-1">{c.stage}</td>
                  <td className="px-2 py-1">{c.enteredCount}</td>
                  <td className="px-2 py-1">{c.wonCount}</td>
                  <td className="px-2 py-1">{c.conversionRate.toFixed(0)}%</td>
                  <td className="px-2 py-1">{c.avgDaysInStage.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue by owner</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            {revenueByOwner.map((r) => (
              <div key={r.owner} className="flex justify-between">
                <span>{r.owner}</span>
                <span className="font-medium">{currency(r.revenue)}</span>
              </div>
            ))}
            {revenueByOwner.length === 0 ? (
              <p className="text-muted-foreground">No won deals yet.</p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue by account</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            {revenueByOrg.map((r) => (
              <div key={r.organization} className="flex justify-between">
                <span>{r.organization}</span>
                <span className="font-medium">{currency(r.revenue)}</span>
              </div>
            ))}
            {revenueByOrg.length === 0 ? (
              <p className="text-muted-foreground">No won deals yet.</p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue by source</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            {revenueBySource.map((r) => (
              <div key={r.source} className="flex justify-between">
                <span>{r.source}</span>
                <span className="font-medium">{currency(r.revenue)}</span>
              </div>
            ))}
            {revenueBySource.length === 0 ? (
              <p className="text-muted-foreground">No won deals yet.</p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity leaderboard</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-sm">
          {leaderboard.map((l) => (
            <div key={l.owner} className="flex justify-between">
              <span>{l.owner}</span>
              <span className="font-medium">{l.completedCount} completed</span>
            </div>
          ))}
          {leaderboard.length === 0 ? (
            <p className="text-muted-foreground">No completed activities yet.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
