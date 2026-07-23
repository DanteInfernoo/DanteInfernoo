import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DealForm } from "@/components/app/deal-form";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";
import { getFieldDefinitionsForEntity } from "@/lib/data/fields";
import { listOrganizations } from "@/lib/data/organizations";
import { listPersons } from "@/lib/data/persons";
import { getPipelineWithStages } from "@/lib/data/pipelines";

export default async function NewDealPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspace: string }>;
  searchParams: Promise<{ pipeline?: string; stage?: string }>;
}) {
  const { workspace: slug } = await params;
  const { pipeline: pipelineId, stage: stageId } = await searchParams;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) notFound();
  if (!pipelineId || !stageId) notFound();

  const pipeline = await getPipelineWithStages(workspace.id, pipelineId);
  if (!pipeline) notFound();

  const [fieldDefs, organizations, persons] = await Promise.all([
    getFieldDefinitionsForEntity(workspace.id, "deal"),
    listOrganizations(workspace.id),
    listPersons(workspace.id),
  ]);

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>New deal in {pipeline.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <DealForm
          workspaceSlug={slug}
          pipelineId={pipelineId}
          stageId={stageId}
          fieldDefs={fieldDefs}
          organizations={organizations}
          persons={persons.map((p) => ({ id: p.id, name: p.name }))}
        />
      </CardContent>
    </Card>
  );
}
