import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityTypeForm } from "@/components/app/activity-type-form";
import { DeleteActivityTypeButton } from "@/components/app/delete-activity-type-button";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";
import { listActivityTypes } from "@/lib/data/activity-types";

export default async function ActivityTypesSettingsPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: slug } = await params;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) notFound();

  const activityTypes = await listActivityTypes(workspace.id);

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Activity types</h1>
        <p className="text-muted-foreground text-sm">
          Define the kinds of activities your team logs — calls, visits,
          deliveries, whatever fits how you work.
        </p>
      </div>

      <ActivityTypeForm workspaceSlug={slug} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Types</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {activityTypes.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm"
            >
              <span className="flex items-center gap-2">
                <span
                  className="inline-block size-3 rounded-full"
                  style={{ backgroundColor: t.color }}
                />
                {t.name}
              </span>
              <DeleteActivityTypeButton id={t.id} workspaceSlug={slug} />
            </div>
          ))}
          {activityTypes.length === 0 ? (
            <p className="text-muted-foreground text-sm">No activity types yet.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
