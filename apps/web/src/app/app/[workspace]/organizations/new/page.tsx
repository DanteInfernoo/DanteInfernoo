import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrganizationForm } from "@/components/app/organization-form";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";
import { getFieldDefinitionsForEntity } from "@/lib/data/fields";

export default async function NewOrganizationPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: slug } = await params;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) notFound();

  const fieldDefs = await getFieldDefinitionsForEntity(
    workspace.id,
    "organization",
  );

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>New organization</CardTitle>
      </CardHeader>
      <CardContent>
        <OrganizationForm workspaceSlug={slug} fieldDefs={fieldDefs} />
      </CardContent>
    </Card>
  );
}
