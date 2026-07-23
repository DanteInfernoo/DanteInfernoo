"use client";

import { useDraggable } from "@dnd-kit/core";
import { daysSince, isStageRotten } from "@crm/shared";
import { Card, CardContent } from "@/components/ui/card";
import type { DealWithRelations } from "@/lib/data/deals";
import Link from "next/link";

export function DealCard({
  deal,
  rottenDays,
  workspaceSlug,
  hasNextActivity,
}: {
  deal: DealWithRelations;
  rottenDays: number | null;
  workspaceSlug: string;
  hasNextActivity: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: deal.id });

  const rotten = isStageRotten(deal.stage_entered_at, rottenDays);
  const days = daysSince(deal.stage_entered_at);

  return (
    <Card
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={
        transform
          ? {
              transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
              opacity: isDragging ? 0.5 : 1,
            }
          : undefined
      }
      className="cursor-grab gap-2 py-3 active:cursor-grabbing"
    >
      <CardContent className="flex flex-col gap-1 px-3">
        <Link
          href={`/app/${workspaceSlug}/deals/${deal.id}`}
          className="font-medium hover:underline"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {deal.title}
        </Link>
        <span className="text-sm font-semibold">
          {deal.value.toLocaleString(undefined, {
            style: "currency",
            currency: deal.currency,
          })}
        </span>
        {deal.organization ? (
          <span className="text-muted-foreground text-xs">
            {deal.organization.name}
          </span>
        ) : null}
        <div className="flex items-center justify-between text-xs">
          <span className={rotten ? "font-medium text-red-600" : "text-muted-foreground"}>
            {days}d in stage{rotten ? " · rotting" : ""}
          </span>
          <span className="text-muted-foreground">
            {deal.owner?.full_name ?? deal.owner?.email ?? ""}
          </span>
        </div>
        {!hasNextActivity ? (
          <span className="w-fit rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            No next activity
          </span>
        ) : null}
      </CardContent>
    </Card>
  );
}
