"use client";

import { useActionState } from "react";
import {
  createOrder,
  updateOrder,
  type OrderFormState,
} from "@/app/app/[workspace]/orders/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OrderWithOrganization } from "@/lib/data/orders";

const initialState: OrderFormState = { error: null };

const STATUSES = ["draft", "confirmed", "in_production", "delivered", "invoiced", "paid"];

export function OrderForm({
  workspaceSlug,
  order,
  organizations,
  defaultOrganizationId,
}: {
  workspaceSlug: string;
  order?: OrderWithOrganization;
  organizations: { id: string; name: string }[];
  defaultOrganizationId?: string;
}) {
  const action = order
    ? updateOrder.bind(null, workspaceSlug, order.id)
    : createOrder.bind(null, workspaceSlug);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="organization_id">Account</Label>
        <select
          id="organization_id"
          name="organization_id"
          defaultValue={order?.organization.id ?? defaultOrganizationId ?? ""}
          required
          className="border-input h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs"
        >
          <option value="" disabled>
            -- select --
          </option>
          {organizations.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="po_number">PO number</Label>
          <Input id="po_number" name="po_number" defaultValue={order?.po_number ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={order?.status ?? "draft"}
            className="border-input h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="order_date">Order date</Label>
          <Input
            id="order_date"
            name="order_date"
            type="date"
            defaultValue={order?.order_date ?? new Date().toISOString().slice(0, 10)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="requested_delivery_date">Requested delivery</Label>
          <Input
            id="requested_delivery_date"
            name="requested_delivery_date"
            type="date"
            defaultValue={order?.requested_delivery_date ?? ""}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tax_rate">Tax rate %</Label>
          <Input
            id="tax_rate"
            name="tax_rate"
            type="number"
            step="any"
            defaultValue={order?.tax_rate ?? 0}
          />
        </div>
      </div>

      {state.error ? <p className="text-destructive text-sm">{state.error}</p> : null}

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Saving..." : order ? "Save changes" : "Create order"}
      </Button>
    </form>
  );
}
