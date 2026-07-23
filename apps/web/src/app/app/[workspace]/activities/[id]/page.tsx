import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityForm } from "@/components/app/activity-form";
import { DeleteButton } from "@/components/app/delete-button";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";
import { getActivity } from "@/lib/data/activities";
import { listActivityTypes } from "@/lib/data/activity-types";
import { listOrganizations } from "@/lib/data/organizations";
import { listPersons } from "@/lib/data/persons";
import { createClient } from "@/lib/supabase/server";
import { deleteActivity } from "@/app/app/[workspace]/activities/actions";

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ workspace: string; id: string }>;
}) {
  const { workspace: slug, id } = await params;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) notFound();

  const activity = await getActivity(workspace.id, id);
  if (!activity) notFound();

  const [activityTypes, organizations, persons] = await Promise.all([
    listActivityTypes(workspace.id),
    listOrganizations(workspace.id),
    listPersons(workspace.id),
  ]);

  const supabase = await createClient();
  const { data: deals } = await supabase
    .from("deals")
    .select("id, title")
    .eq("workspace_id", workspace.id);

  return (
    <div className="flex max-w-lg flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{activity.subject}</h1>
        <DeleteButton
          action={deleteActivity.bind(null, slug, id)}
          confirmMessage="Delete this activity?"
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityForm
            workspaceSlug={slug}
            activity={activity}
            activityTypes={activityTypes}
            deals={deals ?? []}
            persons={persons.map((p) => ({ id: p.id, name: p.name }))}
            organizations={organizations}
          />
        </CardContent>
      </Card>
    </div>
  );
}
