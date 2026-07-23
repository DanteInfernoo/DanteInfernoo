import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrganizationForm } from "@/components/app/organization-form";
import { DeleteButton } from "@/components/app/delete-button";
import { LabelAttacher } from "@/components/app/label-attacher";
import { EntityTimeline } from "@/components/app/entity-timeline";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";
import {
  getOrganization,
  listPersonsForOrganization,
} from "@/lib/data/organizations";
import { getFieldDefinitionsForEntity } from "@/lib/data/fields";
import { listEntityLabels, listLabels } from "@/lib/data/labels";
import { deleteOrganization } from "@/app/app/[workspace]/organizations/actions";

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ workspace: string; id: string }>;
}) {
  const { workspace: slug, id } = await params;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) notFound();

  const organization = await getOrganization(workspace.id, id);
  if (!organization) notFound();

  const [fieldDefs, persons, attachedLabels, availableLabels] =
    await Promise.all([
      getFieldDefinitionsForEntity(workspace.id, "organization"),
      listPersonsForOrganization(workspace.id, id),
      listEntityLabels("organization", id),
      listLabels(workspace.id, "organization"),
    ]);

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{organization.name}</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/app/${slug}/organizations/merge?a=${id}`}>Merge</Link>
          </Button>
          <DeleteButton
            action={deleteOrganization.bind(null, slug, id)}
            confirmMessage="Delete this organization? This cannot be undone."
          />
        </div>
      </div>

      <LabelAttacher
        workspaceSlug={slug}
        entityType="organization"
        entityId={id}
        attached={attachedLabels}
        available={availableLabels}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <OrganizationForm
            workspaceSlug={slug}
            organization={organization}
            fieldDefs={fieldDefs}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">People at this organization</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {persons.map((p) => (
            <Link
              key={p.id}
              href={`/app/${slug}/persons/${p.id}`}
              className="hover:bg-accent rounded-md px-2 py-1.5 text-sm"
            >
              {p.name} {p.email ? `· ${p.email}` : ""}
            </Link>
          ))}
          {persons.length === 0 ? (
            <p className="text-muted-foreground text-sm">No contacts yet.</p>
          ) : null}
        </CardContent>
      </Card>

      <EntityTimeline
        workspaceSlug={slug}
        workspaceId={workspace.id}
        entityType="organization"
        entityId={id}
      />
    </div>
  );
}
