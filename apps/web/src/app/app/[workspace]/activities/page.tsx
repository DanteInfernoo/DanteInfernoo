import Link from "next/link";
import { notFound } from "next/navigation";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  format,
  isSameDay,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { ActivityCalendarGrid, type CalendarDay } from "@/components/app/activity-calendar-grid";
import { ActivityChip } from "@/components/app/activity-chip";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";
import {
  listActivitiesInRange,
  listUpcomingActivities,
  type ActivityWithRelations,
} from "@/lib/data/activities";

type ViewMode = "month" | "week" | "day" | "list";

function groupByDate(activities: ActivityWithRelations[]) {
  const map = new Map<string, ActivityWithRelations[]>();
  for (const a of activities) {
    const list = map.get(a.due_date) ?? [];
    list.push(a);
    map.set(a.due_date, list);
  }
  return map;
}

export default async function ActivitiesPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspace: string }>;
  searchParams: Promise<{ view?: string; date?: string }>;
}) {
  const { workspace: slug } = await params;
  const sp = await searchParams;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) notFound();

  const view: ViewMode = (["month", "week", "day", "list"].includes(sp.view ?? "")
    ? sp.view
    : "month") as ViewMode;
  const anchor = sp.date ? new Date(`${sp.date}T00:00:00`) : new Date();
  const today = new Date();

  if (view === "list") {
    const activities = await listUpcomingActivities(workspace.id, false);
    return (
      <div className="flex max-w-2xl flex-col gap-4">
        <Header slug={slug} view={view} />
        <div className="flex flex-col gap-2">
          {activities.map((a) => (
            <div key={a.id} className="rounded-md border p-2">
              <div className="text-muted-foreground mb-1 text-xs">
                {format(new Date(`${a.due_date}T00:00:00`), "EEE, MMM d")}
              </div>
              <ActivityChip workspaceSlug={slug} activity={a} />
            </div>
          ))}
          {activities.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No upcoming activities.
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  let rangeStart: Date;
  let rangeEnd: Date;
  if (view === "month") {
    rangeStart = startOfWeek(startOfMonth(anchor));
    rangeEnd = endOfWeek(endOfMonth(anchor));
  } else if (view === "week") {
    rangeStart = startOfWeek(anchor);
    rangeEnd = endOfWeek(anchor);
  } else {
    rangeStart = anchor;
    rangeEnd = anchor;
  }

  const activities = await listActivitiesInRange(
    workspace.id,
    format(rangeStart, "yyyy-MM-dd"),
    format(rangeEnd, "yyyy-MM-dd"),
  );
  const byDate = groupByDate(activities);

  const days: CalendarDay[] = eachDayOfInterval({
    start: rangeStart,
    end: rangeEnd,
  }).map((date) => {
    const iso = format(date, "yyyy-MM-dd");
    return {
      date: iso,
      label: view === "day" ? format(date, "EEEE, MMM d") : format(date, "d"),
      isCurrentPeriod:
        view !== "month" || date.getMonth() === anchor.getMonth(),
      isToday: isSameDay(date, today),
      activities: byDate.get(iso) ?? [],
    };
  });

  let prevHref = "";
  let nextHref = "";
  const dateFmt = "yyyy-MM-dd";
  if (view === "month") {
    prevHref = `?view=month&date=${format(subMonths(anchor, 1), dateFmt)}`;
    nextHref = `?view=month&date=${format(addMonths(anchor, 1), dateFmt)}`;
  } else if (view === "week") {
    prevHref = `?view=week&date=${format(subWeeks(anchor, 1), dateFmt)}`;
    nextHref = `?view=week&date=${format(addWeeks(anchor, 1), dateFmt)}`;
  } else {
    prevHref = `?view=day&date=${format(subDays(anchor, 1), dateFmt)}`;
    nextHref = `?view=day&date=${format(addDays(anchor, 1), dateFmt)}`;
  }

  return (
    <div className="flex flex-col gap-4">
      <Header slug={slug} view={view} />
      <div className="flex items-center gap-2">
        <Button asChild size="sm" variant="outline">
          <Link href={prevHref}>Prev</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href={`?view=${view}`}>Today</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href={nextHref}>Next</Link>
        </Button>
        <span className="text-sm font-medium">{format(anchor, "MMMM yyyy")}</span>
      </div>

      {view === "day" ? (
        <div className="flex max-w-md flex-col gap-2">
          {days[0]?.activities.map((a) => (
            <ActivityChip key={a.id} workspaceSlug={slug} activity={a} />
          ))}
          {days[0]?.activities.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No activities on this day.
            </p>
          ) : null}
        </div>
      ) : (
        <ActivityCalendarGrid workspaceSlug={slug} days={days} />
      )}
    </div>
  );
}

function Header({ slug, view }: { slug: string; view: ViewMode }) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold">Activities</h1>
      <div className="flex gap-2">
        {(["month", "week", "day", "list"] as const).map((v) => (
          <Button key={v} asChild size="sm" variant={v === view ? "default" : "outline"}>
            <Link href={`/app/${slug}/activities?view=${v}`} className="capitalize">
              {v}
            </Link>
          </Button>
        ))}
        <Button asChild size="sm">
          <Link href={`/app/${slug}/activities/new`}>New activity</Link>
        </Button>
      </div>
    </div>
  );
}
