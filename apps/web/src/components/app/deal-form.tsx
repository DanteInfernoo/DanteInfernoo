"use client";

import { useActionState } from "react";
import {
  createDeal,
  updateDeal,
  type DealFormState,
} from "@/app/app/[workspace]/deals/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomFieldsFieldset } from "@/components/app/custom-fields-fieldset";
import type { FieldDefinitionRow } from "@/lib/data/fields";
import type { DealWithRelations } from "@/lib/data/deals";

const initialState: DealFormState = { error: null };

export function DealForm({
  workspaceSlug,
  deal,
  pipelineId,
  stageId,
  fieldDefs,
  organizations,
  persons,
}: {
  workspaceSlug: string;
  deal?: DealWithRelations;
  pipelineId?: string;
  stageId?: string;
  fieldDefs: FieldDefinitionRow[];
  organizations: { id: string; name: string }[];
  persons: { id: string; name: string }[];
}) {
  const action = deal
    ? updateDeal.bind(null, workspaceSlug, deal.id)
    : createDeal.bind(null, workspaceSlug, pipelineId!, stageId!);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={deal?.title ?? ""} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="value">Value</Label>
          <Input
            id="value"
            name="value"
            type="number"
            step="any"
            min={0}
            defaultValue={deal?.value ?? 0}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="currency">Currency</Label>
          <Input id="currency" name="currency" defaultValue={deal?.currency ?? "USD"} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="expected_close_date">Expected close date</Label>
        <Input
          id="expected_close_date"
          name="expected_close_date"
          type="date"
          defaultValue={deal?.expected_close_date ?? ""}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="organization_id">Organization</Label>
        <select
          id="organization_id"
          name="organization_id"
          defaultValue={deal?.organization?.id ?? ""}
          className="border-input h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs"
        >
          <option value="">-- none --</option>
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="person_id">Contact</Label>
        <select
          id="person_id"
          name="person_id"
          defaultValue={deal?.person?.id ?? ""}
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

      <CustomFieldsFieldset
        fieldDefs={fieldDefs}
        values={deal?.custom_fields as Record<string, unknown>}
      />

      {state.error ? <p className="text-destructive text-sm">{state.error}</p> : null}

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Saving..." : deal ? "Save changes" : "Create deal"}
      </Button>
    </form>
  );
}
