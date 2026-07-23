"use client";

import { useActionState, useState } from "react";
import {
  createAutomationRule,
  type AutomationRuleFormState,
} from "@/app/app/[workspace]/settings/automation/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StageRow } from "@/lib/data/pipelines";
import type { ActivityTypeRow } from "@/lib/data/activity-types";
import type { EmailTemplateRow } from "@/lib/data/email-templates";

const initialState: AutomationRuleFormState = { error: null };

export function AutomationRuleForm({
  workspaceSlug,
  stages,
  activityTypes,
  emailTemplates,
}: {
  workspaceSlug: string;
  stages: StageRow[];
  activityTypes: ActivityTypeRow[];
  emailTemplates: EmailTemplateRow[];
}) {
  const action = createAutomationRule.bind(null, workspaceSlug);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [triggerType, setTriggerType] = useState("deal_stage_changed");

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-lg border p-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Rule name</Label>
          <Input id="name" name="name" placeholder="e.g. Negotiation kickoff" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="trigger_type">When...</Label>
          <select
            id="trigger_type"
            name="trigger_type"
            value={triggerType}
            onChange={(e) => setTriggerType(e.target.value)}
            className="border-input h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs"
          >
            <option value="deal_stage_changed">Deal moves to stage...</option>
            <option value="deal_won">Deal is won</option>
            <option value="deal_lost">Deal is lost</option>
          </select>
        </div>
      </div>

      {triggerType === "deal_stage_changed" ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="to_stage_id">Stage</Label>
          <select
            id="to_stage_id"
            name="to_stage_id"
            required
            className="border-input h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs"
          >
            {stages.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <Label>And (optional condition)</Label>
        <div className="grid grid-cols-3 gap-2">
          <span className="flex items-center text-sm">Deal value</span>
          <select
            name="condition_operator"
            defaultValue=""
            className="border-input h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs"
          >
            <option value="">-- no condition --</option>
            <option value="gt">is greater than</option>
            <option value="gte">is at least</option>
            <option value="lt">is less than</option>
            <option value="lte">is at most</option>
            <option value="eq">equals</option>
          </select>
          <Input name="condition_value" type="number" step="any" placeholder="amount" />
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t pt-3">
        <Label>Then, create an activity (optional)</Label>
        <div className="grid grid-cols-3 gap-2">
          <select
            name="activity_type_id"
            defaultValue=""
            className="border-input h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs"
          >
            <option value="">-- skip --</option>
            {activityTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <Input name="activity_subject" placeholder="Subject" />
          <Input name="activity_due_in_days" type="number" min={1} placeholder="Due in N days" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5 border-t pt-3">
        <Label htmlFor="email_template_id">And log this email template (optional)</Label>
        <select
          id="email_template_id"
          name="email_template_id"
          defaultValue=""
          className="border-input h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs"
        >
          <option value="">-- skip --</option>
          {emailTemplates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {state.error ? <p className="text-destructive text-sm">{state.error}</p> : null}
      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Saving..." : "Create rule"}
      </Button>
    </form>
  );
}
