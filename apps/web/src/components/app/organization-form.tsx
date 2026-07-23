"use client";

import { useActionState } from "react";
import {
  createOrganization,
  updateOrganization,
  type OrgFormState,
} from "@/app/app/[workspace]/organizations/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomFieldsFieldset } from "@/components/app/custom-fields-fieldset";
import type { FieldDefinitionRow } from "@/lib/data/fields";
import type { OrganizationRow } from "@/lib/data/organizations";

const initialState: OrgFormState = { error: null };

export function OrganizationForm({
  workspaceSlug,
  organization,
  fieldDefs,
}: {
  workspaceSlug: string;
  organization?: OrganizationRow;
  fieldDefs: FieldDefinitionRow[];
}) {
  const action = organization
    ? updateOrganization.bind(null, workspaceSlug, organization.id)
    : createOrganization.bind(null, workspaceSlug);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={organization?.name ?? ""}
          required
        />
      </div>

      <CustomFieldsFieldset
        fieldDefs={fieldDefs}
        values={organization?.custom_fields as Record<string, unknown>}
      />

      {state.error ? (
        <p className="text-destructive text-sm">{state.error}</p>
      ) : null}

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Saving..." : organization ? "Save changes" : "Create organization"}
      </Button>
    </form>
  );
}
