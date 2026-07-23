import Link from "next/link";
import { isActivityOverdue } from "@crm/shared";
import { ActivityDoneToggle } from "@/components/app/activity-done-toggle";
import type { ActivityWithRelations } from "@/lib/data/activities";

export function ActivityChip({
  workspaceSlug,
  activity,
}: {
  workspaceSlug: string;
  activity: ActivityWithRelations;
}) {
  const overdue = isActivityOverdue(activity.due_date, activity.is_done);

  return (
    <div
      className={`flex items-center gap-1.5 rounded px-1.5 py-0.5 text-xs ${
        overdue ? "bg-red-50 dark:bg-red-950" : "bg-muted"
      }`}
    >
      <ActivityDoneToggle
        workspaceSlug={workspaceSlug}
        activityId={activity.id}
        isDone={activity.is_done}
      />
      <span
        className="inline-block size-2 shrink-0 rounded-full"
        style={{ backgroundColor: activity.type.color }}
      />
      <Link
        href={`/app/${workspaceSlug}/activities/${activity.id}`}
        className={`truncate hover:underline ${activity.is_done ? "line-through opacity-60" : ""} ${overdue ? "font-medium text-red-600 dark:text-red-400" : ""}`}
      >
        {activity.due_time ? `${activity.due_time.slice(0, 5)} ` : ""}
        {activity.subject}
      </Link>
    </div>
  );
}
