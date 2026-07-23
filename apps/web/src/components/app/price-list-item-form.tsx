"use client";

import { setPriceListItem } from "@/app/app/[workspace]/settings/products/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProductRow } from "@/lib/data/products";

export function PriceListItemForm({
  workspaceSlug,
  priceListId,
  products,
}: {
  workspaceSlug: string;
  priceListId: string;
  products: ProductRow[];
}) {
  return (
    <form
      action={(formData) => setPriceListItem(workspaceSlug, priceListId, formData)}
      className="flex items-center gap-2"
    >
      <select
        name="product_id"
        required
        className="border-input h-8 rounded-md border bg-transparent px-2 text-sm shadow-xs"
      >
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} ({p.sku})
          </option>
        ))}
      </select>
      <Input name="price" type="number" step="any" placeholder="Price" className="h-8 w-24" required />
      <Button type="submit" size="sm" variant="outline">
        Set price
      </Button>
    </form>
  );
}
