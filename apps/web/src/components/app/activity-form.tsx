"use client";

import { useActionState } from "react";
import {
  createActivity,
  updateActivity,
  type ActivityFormState,
} from "@/app/app/[workspace]/activities/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActivityTypeRow } from "@/lib/data/activity-types";
import type { ActivityWithRelations } from "@/lib/data/activities";

const initialState: ActivityFormState = { error: null };

export function ActivityForm({
  workspaceSlug,
  activity,
  activityTypes,
  deals,
  persons,
  organizations,
  defaults,
}: {
  workspaceSlug: string;
  activity?: ActivityWithRelations;
  activityTypes: ActivityTypeRow[];
  deals: { id: string; title: string }[];
  persons: { id: string; name: string }[];
  organizations: { id: string; name: string }[];
  defaults?: {
    dealId?: string;
    personId?: string;
    organizationId?: string;
    dueDate?: string;
  };
}) {
  const action = activity
    ? updateActivity.bind(null, workspaceSlug, activity.id)
    : createActivity.bind(null, workspaceSlug);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="type_id">Type</Label>
          <select
            id="type_id"
            name="type_id"
            defaultValue={activity?.type.id ?? activityTypes[0]?.id}
            required
            className="border-input h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs"
          >
            {activityTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" name="subject" defaultValue={activity?.subject ?? ""} required />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="due_date">Due date</Label>
          <Input
            id="due_date"
            name="due_date"
            type="date"
            defaultValue={activity?.due_date ?? defaults?.dueDate ?? ""}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="due_time">Time</Label>
          <Input
            id="due_time"
            name="due_time"
            type="time"
            defaultValue={activity?.due_time ?? ""}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="duration_minutes">Duration (min)</Label>
          <Input
            id="duration_minutes"
            name="duration_minutes"
            type="number"
            min={1}
            defaultValue={activity?.duration_minutes ?? ""}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={activity?.notes ?? ""}
          className="border-input rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="deal_id">Deal</Label>
          <select
            id="deal_id"
            name="deal_id"
            defaultValue={activity?.deal?.id ?? defaults?.dealId ?? ""}
            className="border-input h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs"
          >
            <option value="">-- none --</option>
            {deals.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="person_id">Person</Label>
          <select
            id="person_id"
            name="person_id"
            defaultValue={activity?.person?.id ?? defaults?.personId ?? ""}
            className="border-input h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs"
          >
            <option value="">-- none --</option>
            {persons.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="organization_id">Organization</Label>
          <select
            id="organization_id"
            name="organization_id"
            defaultValue={activity?.organization?.id ?? defaults?.organizationId ?? ""}
            className="border-input h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs"
          >
            <option value="">-- none --</option>
            {organizations.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="recurrence_interval">Repeat</Label>
          <select
            id="recurrence_interval"
            name="recurrence_interval"
            defaultValue={activity?.recurrence_interval ?? "none"}
            className="border-input h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs"
          >
            <option value="none">Does not repeat</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="recurrence_until">Repeat until</Label>
          <Input
            id="recurrence_until"
            name="recurrence_until"
            type="date"
            defaultValue={activity?.recurrence_until ?? ""}
          />
        </div>
      </div>

      {state.error ? <p className="text-destructive text-sm">{state.error}</p> : null}

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Saving..." : activity ? "Save changes" : "Create activity"}
      </Button>
    </form>
  );
}
