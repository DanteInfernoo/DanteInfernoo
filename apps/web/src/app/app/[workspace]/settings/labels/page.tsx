import { notFound } from "next/navigation";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";
import { listAllLabels } from "@/lib/data/labels";
import { LabelForm } from "@/components/app/label-form";
import { DeleteLabelButton } from "@/components/app/delete-label-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function LabelsSettingsPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: slug } = await params;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) notFound();

  const labels = await listAllLabels(workspace.id);
  const byEntity = Object.groupBy(labels, (l) => l.entity_type);

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Labels</h1>
        <p className="text-muted-foreground text-sm">
          Colored tags for any entity in this workspace.
        </p>
      </div>

      <LabelForm workspaceSlug={slug} />

      <div className="flex flex-col gap-4">
        {Object.entries(byEntity).map(([entityType, defs]) => (
          <Card key={entityType}>
            <CardHeader>
              <CardTitle className="text-base capitalize">{entityType}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              {defs?.map((l) => (
                <div
                  key={l.id}
                  className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block size-3 rounded-full"
                      style={{ backgroundColor: l.color }}
                    />
                    {l.name}
                  </span>
                  <DeleteLabelButton id={l.id} workspaceSlug={slug} />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
        {labels.length === 0 ? (
          <p className="text-muted-foreground text-sm">No labels yet.</p>
        ) : null}
      </div>
    </div>
  );
}
