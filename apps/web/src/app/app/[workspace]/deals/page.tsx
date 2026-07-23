import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";
import { listPipelines, getPipelineWithStages } from "@/lib/data/pipelines";
import { listOpenDealsByPipeline, listAllDealsByPipeline } from "@/lib/data/deals";
import { listDealIdsWithOpenActivity } from "@/lib/data/activities";
import { DealBoard } from "@/components/app/deal-board";
import { DealList } from "@/components/app/deal-list";
import { PipelineSelector } from "@/components/app/pipeline-selector";

export default async function DealsPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspace: string }>;
  searchParams: Promise<{
    pipeline?: string;
    view?: string;
    sort?: string;
    dir?: string;
  }>;
}) {
  const { workspace: slug } = await params;
  const sp = await searchParams;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) notFound();

  const pipelines = await listPipelines(workspace.id);

  if (pipelines.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Deals</h1>
        <p className="text-muted-foreground text-sm">
          No pipelines configured yet.
        </p>
        <Button asChild className="self-start">
          <Link href={`/app/${slug}/settings/pipelines`}>Set up a pipeline</Link>
        </Button>
      </div>
    );
  }

  const activePipelineId =
    sp.pipeline && pipelines.some((p) => p.id === sp.pipeline)
      ? sp.pipeline
      : (pipelines.find((p) => p.is_default) ?? pipelines[0]).id;

  const pipeline = await getPipelineWithStages(workspace.id, activePipelineId);
  if (!pipeline) notFound();

  const isListView = sp.view === "list";
  const sort = sp.sort ?? "created_at";
  const dir = sp.dir === "asc" ? "asc" : "desc";

  const deals = isListView
    ? await listAllDealsByPipeline(workspace.id, activePipelineId)
    : await listOpenDealsByPipeline(workspace.id, activePipelineId);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Deals</h1>
        <div className="flex items-center gap-2">
          <PipelineSelector
            workspaceSlug={slug}
            pipelines={pipelines}
            currentPipelineId={activePipelineId}
            view={sp.view ?? ""}
          />
          <Button asChild>
            <Link
              href={`/app/${slug}/deals/new?pipeline=${activePipelineId}&stage=${pipeline.stages[0]?.id ?? ""}`}
            >
              New deal
            </Link>
          </Button>
        </div>
      </div>

      {isListView ? (
        <>
          <Button asChild size="sm" variant="outline" className="self-start">
            <Link href={`/app/${slug}/deals?pipeline=${activePipelineId}`}>
              Board view
            </Link>
          </Button>
          <DealList
            workspaceSlug={slug}
            deals={deals}
            stagesById={new Map(pipeline.stages.map((s) => [s.id, s]))}
            sort={sort}
            dir={dir}
          />
        </>
      ) : (
        <DealBoard
          workspaceSlug={slug}
          stages={pipeline.stages}
          initialDeals={deals}
          dealIdsWithOpenActivity={await listDealIdsWithOpenActivity(workspace.id)}
        />
      )}
    </div>
  );
}
