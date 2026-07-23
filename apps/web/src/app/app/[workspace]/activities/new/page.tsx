import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityForm } from "@/components/app/activity-form";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";
import { listActivityTypes } from "@/lib/data/activity-types";
import { listOrganizations } from "@/lib/data/organizations";
import { listPersons } from "@/lib/data/persons";
import { createClient } from "@/lib/supabase/server";

export default async function NewActivityPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspace: string }>;
  searchParams: Promise<{
    due_date?: string;
    deal_id?: string;
    person_id?: string;
    organization_id?: string;
  }>;
}) {
  const { workspace: slug } = await params;
  const sp = await searchParams;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) notFound();

  const [activityTypes, organizations, persons] = await Promise.all([
    listActivityTypes(workspace.id),
    listOrganizations(workspace.id),
    listPersons(workspace.id),
  ]);

  const supabase = await createClient();
  const { data: deals } = await supabase
    .from("deals")
    .select("id, title")
    .eq("workspace_id", workspace.id)
    .eq("status", "open");

  if (activityTypes.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No activity types configured yet — add one in Settings first.
      </p>
    );
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>New activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ActivityForm
          workspaceSlug={slug}
          activityTypes={activityTypes}
          deals={deals ?? []}
          persons={persons.map((p) => ({ id: p.id, name: p.name }))}
          organizations={organizations}
          defaults={{
            dueDate: sp.due_date,
            dealId: sp.deal_id,
            personId: sp.person_id,
            organizationId: sp.organization_id,
          }}
        />
      </CardContent>
    </Card>
  );
}
