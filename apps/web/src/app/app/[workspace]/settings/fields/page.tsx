import { notFound } from "next/navigation";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";
import { getFieldDefinitions } from "@/lib/data/fields";
import { FieldDefinitionForm } from "@/components/app/field-definition-form";
import { DeleteFieldButton } from "@/components/app/delete-field-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function FieldsSettingsPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: slug } = await params;
  const workspace = await getWorkspaceBySlug(slug);

  if (!workspace) {
    notFound();
  }

  const fields = await getFieldDefinitions(workspace.id);
  const byEntity = Object.groupBy(fields, (f) => f.entity_type);

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Custom fields</h1>
        <p className="text-muted-foreground text-sm">
          Define the fields that appear on any entity in this workspace —
          people, organizations, deals, or anything else you add later.
        </p>
      </div>

      <FieldDefinitionForm workspaceSlug={slug} />

      <div className="flex flex-col gap-4">
        {Object.entries(byEntity).map(([entityType, defs]) => (
          <Card key={entityType}>
            <CardHeader>
              <CardTitle className="text-base capitalize">{entityType}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              {defs?.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm"
                >
                  <span>
                    {f.label}{" "}
                    <span className="text-muted-foreground">
                      ({f.field_type}
                      {f.is_required ? ", required" : ""})
                    </span>
                  </span>
                  <DeleteFieldButton id={f.id} workspaceSlug={slug} />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
        {fields.length === 0 ? (
          <p className="text-muted-foreground text-sm">No custom fields yet.</p>
        ) : null}
      </div>
    </div>
  );
}
