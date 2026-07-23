"use client";

import { toggleActivityDone } from "@/app/app/[workspace]/activities/actions";

export function ActivityDoneToggle({
  workspaceSlug,
  activityId,
  isDone,
}: {
  workspaceSlug: string;
  activityId: string;
  isDone: boolean;
}) {
  return (
    <input
      type="checkbox"
      defaultChecked={isDone}
      className="size-4"
      onChange={(e) =>
        toggleActivityDone(workspaceSlug, activityId, e.target.checked)
      }
      onClick={(e) => e.stopPropagation()}
    />
  );
}
