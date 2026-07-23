import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PersonForm } from "@/components/app/person-form";
import { DeleteButton } from "@/components/app/delete-button";
import { LabelAttacher } from "@/components/app/label-attacher";
import { EntityTimeline } from "@/components/app/entity-timeline";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";
import { getPerson } from "@/lib/data/persons";
import { listOrganizations } from "@/lib/data/organizations";
import { getFieldDefinitionsForEntity } from "@/lib/data/fields";
import { listEntityLabels, listLabels } from "@/lib/data/labels";
import { deletePerson } from "@/app/app/[workspace]/persons/actions";

export default async function PersonDetailPage({
  params,
}: {
  params: Promise<{ workspace: string; id: string }>;
}) {
  const { workspace: slug, id } = await params;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) notFound();

  const person = await getPerson(workspace.id, id);
  if (!person) notFound();

  const [fieldDefs, organizations, attachedLabels, availableLabels] =
    await Promise.all([
      getFieldDefinitionsForEntity(workspace.id, "person"),
      listOrganizations(workspace.id),
      listEntityLabels("person", id),
      listLabels(workspace.id, "person"),
    ]);

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{person.name}</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/app/${slug}/persons/merge?a=${id}`}>Merge</Link>
          </Button>
          <DeleteButton
            action={deletePerson.bind(null, slug, id)}
            confirmMessage="Delete this person? This cannot be undone."
          />
        </div>
      </div>

      <LabelAttacher
        workspaceSlug={slug}
        entityType="person"
        entityId={id}
        attached={attachedLabels}
        available={availableLabels}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <PersonForm
            workspaceSlug={slug}
            person={person}
            fieldDefs={fieldDefs}
            organizations={organizations}
          />
        </CardContent>
      </Card>

      <EntityTimeline
        workspaceSlug={slug}
        workspaceId={workspace.id}
        entityType="person"
        entityId={id}
      />
    </div>
  );
}
