import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PipelineForm } from "@/components/app/pipeline-form";
import {
  SetDefaultButton,
  DeletePipelineButton,
} from "@/components/app/pipeline-list-actions";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";
import { listPipelines } from "@/lib/data/pipelines";

export default async function PipelinesSettingsPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: slug } = await params;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) notFound();

  const pipelines = await listPipelines(workspace.id);

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Pipelines</h1>
        <p className="text-muted-foreground text-sm">
          Each pipeline has its own stages and win probabilities.
        </p>
      </div>

      <PipelineForm workspaceSlug={slug} />

      <div className="flex flex-col gap-2">
        {pipelines.map((p) => (
          <Card key={p.id}>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">
                <Link href={`/app/${slug}/settings/pipelines/${p.id}`} className="hover:underline">
                  {p.name}
                </Link>
                {p.is_default ? (
                  <span className="text-muted-foreground ml-2 text-xs font-normal">
                    (default)
                  </span>
                ) : null}
              </CardTitle>
              <div className="flex gap-2">
                {!p.is_default ? (
                  <SetDefaultButton workspaceSlug={slug} pipelineId={p.id} />
                ) : null}
                <DeletePipelineButton workspaceSlug={slug} pipelineId={p.id} />
              </div>
            </CardHeader>
            <CardContent />
          </Card>
        ))}
        {pipelines.length === 0 ? (
          <p className="text-muted-foreground text-sm">No pipelines yet.</p>
        ) : null}
      </div>
    </div>
  );
}
