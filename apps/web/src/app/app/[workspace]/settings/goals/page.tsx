import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoalForm } from "@/components/app/goal-form";
import { DeleteGoalButton } from "@/components/app/delete-goal-button";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";
import { listWorkspaceMembers } from "@/lib/data/members";
import { listGoalsForPeriod } from "@/lib/data/goals";

export default async function GoalsSettingsPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: slug } = await params;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) notFound();

  const currentPeriod = new Date().toISOString().slice(0, 7);
  const [members, goals] = await Promise.all([
    listWorkspaceMembers(workspace.id),
    listGoalsForPeriod(workspace.id, currentPeriod),
  ]);

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Goals</h1>
        <p className="text-muted-foreground text-sm">
          Monthly targets, tracked on the dashboard.
        </p>
      </div>

      <GoalForm workspaceSlug={slug} members={members.map((m) => m.profile)} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">This month's goals</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {goals.map((g) => (
            <div key={g.id} className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm">
              <span>
                {g.metric_type.replace("_", " ")} — {g.user?.full_name ?? g.user?.email ?? "Whole workspace"} — target{" "}
                {g.target_value}
              </span>
              <DeleteGoalButton id={g.id} workspaceSlug={slug} />
            </div>
          ))}
          {goals.length === 0 ? (
            <p className="text-muted-foreground text-sm">No goals set for this month.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
