import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StageForm } from "@/components/app/stage-form";
import { StageRowActions } from "@/components/app/stage-row-actions";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";
import { getPipelineWithStages } from "@/lib/data/pipelines";

export default async function PipelineDetailPage({
  params,
}: {
  params: Promise<{ workspace: string; pipelineId: string }>;
}) {
  const { workspace: slug, pipelineId } = await params;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) notFound();

  const pipeline = await getPipelineWithStages(workspace.id, pipelineId);
  if (!pipeline) notFound();

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-semibold">{pipeline.name} — Stages</h1>

      <StageForm workspaceSlug={slug} pipelineId={pipelineId} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stages, in order</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y">
          {pipeline.stages.map((stage) => (
            <div
              key={stage.id}
              className="flex items-center justify-between py-2 text-sm"
            >
              <span>
                {stage.name}{" "}
                <span className="text-muted-foreground">
                  ({stage.probability}%
                  {stage.rotten_days ? `, rots after ${stage.rotten_days}d` : ""})
                </span>
              </span>
              <StageRowActions
                workspaceSlug={slug}
                pipelineId={pipelineId}
                stageId={stage.id}
              />
            </div>
          ))}
          {pipeline.stages.length === 0 ? (
            <p className="text-muted-foreground py-2 text-sm">No stages yet.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
