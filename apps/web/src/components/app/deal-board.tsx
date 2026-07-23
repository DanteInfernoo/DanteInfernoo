"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { DndContext, useDroppable, type DragEndEvent } from "@dnd-kit/core";
import { weightedForecast } from "@crm/shared";
import { DealCard } from "@/components/app/deal-card";
import { Button } from "@/components/ui/button";
import { updateDealStage } from "@/app/app/[workspace]/deals/actions";
import type { StageRow } from "@/lib/data/pipelines";
import type { DealWithRelations } from "@/lib/data/deals";

function StageColumn({
  stage,
  deals,
  workspaceSlug,
}: {
  stage: StageRow;
  deals: DealWithRelations[];
  workspaceSlug: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  const total = deals.reduce((sum, d) => sum + d.value, 0);

  return (
    <div
      ref={setNodeRef}
      className={`flex w-72 shrink-0 flex-col gap-2 rounded-lg border p-2 ${
        isOver ? "bg-accent" : ""
      }`}
    >
      <div className="flex items-center justify-between px-1">
        <span className="text-sm font-medium">{stage.name}</span>
        <span className="text-muted-foreground text-xs">
          {deals.length} · {total.toLocaleString(undefined, { style: "currency", currency: "USD" })}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {deals.map((deal) => (
          <DealCard
            key={deal.id}
            deal={deal}
            rottenDays={stage.rotten_days}
            workspaceSlug={workspaceSlug}
          />
        ))}
      </div>
    </div>
  );
}

export function DealBoard({
  workspaceSlug,
  stages,
  initialDeals,
}: {
  workspaceSlug: string;
  stages: StageRow[];
  initialDeals: DealWithRelations[];
}) {
  const [deals, setDeals] = useState(initialDeals);
  const [, startTransition] = useTransition();

  const dealsByStage = useMemo(() => {
    const map = new Map<string, DealWithRelations[]>();
    for (const stage of stages) map.set(stage.id, []);
    for (const deal of deals) {
      map.get(deal.stage_id)?.push(deal);
    }
    return map;
  }, [deals, stages]);

  const forecast = useMemo(
    () => weightedForecast(deals, stages),
    [deals, stages],
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const dealId = active.id as string;
    const newStageId = over.id as string;

    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage_id: newStageId } : d)),
    );

    startTransition(() => {
      updateDealStage(workspaceSlug, dealId, newStageId).catch(() => {
        setDeals(initialDeals);
      });
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm">
          Weighted forecast:{" "}
          <span className="font-semibold">
            {forecast.toLocaleString(undefined, {
              style: "currency",
              currency: "USD",
            })}
          </span>
        </p>
        <Button asChild size="sm" variant="outline">
          <Link href={`/app/${workspaceSlug}/deals?view=list`}>List view</Link>
        </Button>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {stages.map((stage) => (
            <StageColumn
              key={stage.id}
              stage={stage}
              deals={dealsByStage.get(stage.id) ?? []}
              workspaceSlug={workspaceSlug}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
