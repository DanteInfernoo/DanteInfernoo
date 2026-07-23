import Link from "next/link";
import { ActivityChip } from "@/components/app/activity-chip";
import type { ActivityWithRelations } from "@/lib/data/activities";

export interface CalendarDay {
  date: string;
  label: string;
  isCurrentPeriod: boolean;
  isToday: boolean;
  activities: ActivityWithRelations[];
}

export function ActivityCalendarGrid({
  workspaceSlug,
  days,
}: {
  workspaceSlug: string;
  days: CalendarDay[];
}) {
  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day) => (
        <div
          key={day.date}
          className={`flex min-h-28 flex-col gap-1 rounded-md border p-2 ${
            day.isCurrentPeriod ? "" : "opacity-40"
          } ${day.isToday ? "border-primary" : ""}`}
        >
          <Link
            href={`/app/${workspaceSlug}/activities/new?due_date=${day.date}`}
            className="text-muted-foreground hover:text-foreground text-xs font-medium"
          >
            {day.label}
          </Link>
          <div className="flex flex-col gap-1">
            {day.activities.slice(0, 4).map((a) => (
              <ActivityChip key={a.id} workspaceSlug={workspaceSlug} activity={a} />
            ))}
            {day.activities.length > 4 ? (
              <span className="text-muted-foreground text-xs">
                +{day.activities.length - 4} more
              </span>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
