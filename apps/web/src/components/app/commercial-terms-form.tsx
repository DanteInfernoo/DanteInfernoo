"use client";

import { useActionState } from "react";
import {
  updateCommercialTerms,
  type CommercialTermsFormState,
} from "@/app/app/[workspace]/organizations/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OrganizationRow } from "@/lib/data/organizations";
import type { TerritoryRow } from "@/lib/data/territories";

const initialState: CommercialTermsFormState = { error: null };

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function CommercialTermsForm({
  workspaceSlug,
  organization,
  territories,
  potentialParents,
  showDistributorFields,
}: {
  workspaceSlug: string;
  organization: OrganizationRow;
  territories: TerritoryRow[];
  potentialParents: { id: string; name: string }[];
  showDistributorFields: boolean;
}) {
  const action = updateCommercialTerms.bind(null, workspaceSlug, organization.id);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {showDistributorFields ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="account_type">Account type</Label>
            <Input
              id="account_type"
              name="account_type"
              placeholder="direct, distributor, location"
              defaultValue={organization.account_type ?? ""}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="parent_organization_id">Parent account</Label>
            <select
              id="parent_organization_id"
              name="parent_organization_id"
              defaultValue={organization.parent_organization_id ?? ""}
              className="border-input h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs"
            >
              <option value="">-- none --</option>
              {potentialParents.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="territory_id">Territory</Label>
          <select
            id="territory_id"
            name="territory_id"
            defaultValue={organization.territory_id ?? ""}
            className="border-input h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs"
          >
            <option value="">-- none --</option>
            {territories.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="delivery_day">Delivery day</Label>
          <select
            id="delivery_day"
            name="delivery_day"
            defaultValue={organization.delivery_day ?? ""}
            className="border-input h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs"
          >
            <option value="">-- none --</option>
            {DAYS.map((d, i) => (
              <option key={d} value={i}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="payment_terms">Payment terms</Label>
          <select
            id="payment_terms"
            name="payment_terms"
            defaultValue={organization.payment_terms ?? ""}
            className="border-input h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs"
          >
            <option value="">-- none --</option>
            <option value="cod">COD</option>
            <option value="net_15">Net 15</option>
            <option value="net_30">Net 30</option>
            <option value="net_60">Net 60</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="credit_limit">Credit limit</Label>
          <Input
            id="credit_limit"
            name="credit_limit"
            type="number"
            step="any"
            defaultValue={organization.credit_limit ?? ""}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="outstanding_balance">Outstanding balance</Label>
          <Input
            id="outstanding_balance"
            name="outstanding_balance"
            type="number"
            step="any"
            defaultValue={organization.outstanding_balance}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="is_tax_exempt"
          defaultChecked={organization.is_tax_exempt}
          className="size-4"
        />
        Tax exempt
      </label>

      {state.error ? <p className="text-destructive text-sm">{state.error}</p> : null}
      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Saving..." : "Save terms"}
      </Button>
    </form>
  );
}
