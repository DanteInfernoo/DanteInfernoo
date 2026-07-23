import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PersonForm } from "@/components/app/person-form";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";
import { getFieldDefinitionsForEntity } from "@/lib/data/fields";
import { listOrganizations } from "@/lib/data/organizations";

export default async function NewPersonPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: slug } = await params;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) notFound();

  const [fieldDefs, organizations] = await Promise.all([
    getFieldDefinitionsForEntity(workspace.id, "person"),
    listOrganizations(workspace.id),
  ]);

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>New person</CardTitle>
      </CardHeader>
      <CardContent>
        <PersonForm
          workspaceSlug={slug}
          fieldDefs={fieldDefs}
          organizations={organizations}
        />
      </CardContent>
    </Card>
  );
}
