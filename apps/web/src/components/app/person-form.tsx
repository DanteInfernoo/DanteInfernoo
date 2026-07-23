"use client";

import { useActionState } from "react";
import {
  createPerson,
  updatePerson,
  type PersonFormState,
} from "@/app/app/[workspace]/persons/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomFieldsFieldset } from "@/components/app/custom-fields-fieldset";
import type { FieldDefinitionRow } from "@/lib/data/fields";
import type { PersonWithOrg } from "@/lib/data/persons";

const initialState: PersonFormState = { error: null };

export function PersonForm({
  workspaceSlug,
  person,
  fieldDefs,
  organizations,
}: {
  workspaceSlug: string;
  person?: PersonWithOrg;
  fieldDefs: FieldDefinitionRow[];
  organizations: { id: string; name: string }[];
}) {
  const action = person
    ? updatePerson.bind(null, workspaceSlug, person.id)
    : createPerson.bind(null, workspaceSlug);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={person?.name ?? ""} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" defaultValue={person?.email ?? ""} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" defaultValue={person?.phone ?? ""} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="organization_id">Organization</Label>
        <select
          id="organization_id"
          name="organization_id"
          defaultValue={person?.organization?.id ?? ""}
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

      <CustomFieldsFieldset
        fieldDefs={fieldDefs}
        values={person?.custom_fields as Record<string, unknown>}
      />

      {state.error ? (
        <p className="text-destructive text-sm">{state.error}</p>
      ) : null}

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Saving..." : person ? "Save changes" : "Create person"}
      </Button>
    </form>
  );
}
