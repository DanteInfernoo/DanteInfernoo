"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  addLineItem,
  deleteLineItem,
} from "@/app/app/[workspace]/line-items-actions";
import type { LineItemWithProduct } from "@/lib/data/line-items";
import type { ProductRow } from "@/lib/data/products";

export function LineItemsEditor({
  workspaceSlug,
  entityType,
  entityId,
  lineItems,
  products,
}: {
  workspaceSlug: string;
  entityType: "deal" | "order";
  entityId: string;
  lineItems: LineItemWithProduct[];
  products: ProductRow[];
}) {
  const [unitPrice, setUnitPrice] = useState("");

  const subtotal = lineItems.reduce((s, li) => s + li.line_total, 0);
  const margin = lineItems.reduce(
    (s, li) => s + (li.line_total - li.quantity * (li.unit_cost ?? 0)),
    0,
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col divide-y rounded-md border">
        {lineItems.map((li) => (
          <div key={li.id} className="flex items-center justify-between px-3 py-2 text-sm">
            <span>
              {li.quantity} × {li.product?.name ?? li.description ?? "Item"} @ ${li.unit_price.toFixed(2)}
            </span>
            <span className="flex items-center gap-3">
              <span className="font-medium">${li.line_total.toFixed(2)}</span>
              <button
                type="button"
                aria-label="Remove line item"
                onClick={() => deleteLineItem(workspaceSlug, entityType, entityId, li.id)}
              >
                <Trash2 className="text-destructive size-4" />
              </button>
            </span>
          </div>
        ))}
        {lineItems.length === 0 ? (
          <p className="text-muted-foreground px-3 py-2 text-sm">No line items yet.</p>
        ) : null}
      </div>

      <form
        action={(formData) => addLineItem(workspaceSlug, entityType, entityId, formData)}
        className="flex items-end gap-2"
      >
        <select
          name="product_id"
          onChange={(e) => {
            const product = products.find((p) => p.id === e.target.value);
            setUnitPrice(product ? String(product.base_price) : "");
          }}
          className="border-input h-9 rounded-md border bg-transparent px-2 text-sm shadow-xs"
        >
          <option value="">-- custom item --</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.sku})
            </option>
          ))}
        </select>
        <Input name="description" placeholder="Description (if custom)" className="w-40" />
        <Input name="quantity" type="number" step="any" defaultValue={1} className="w-20" />
        <Input
          name="unit_price"
          type="number"
          step="any"
          placeholder="Unit price"
          value={unitPrice}
          onChange={(e) => setUnitPrice(e.target.value)}
          className="w-24"
        />
        <Button type="submit" size="sm">
          Add
        </Button>
      </form>

      <div className="flex justify-end gap-6 text-sm">
        <span>
          Subtotal: <span className="font-medium">${subtotal.toFixed(2)}</span>
        </span>
        <span>
          Margin: <span className="font-medium">${margin.toFixed(2)}</span>
        </span>
      </div>
    </div>
  );
}
