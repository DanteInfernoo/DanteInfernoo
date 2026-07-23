"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  deleteProduct,
  deletePriceList,
} from "@/app/app/[workspace]/settings/products/actions";

export function DeleteProductButton({ id, workspaceSlug }: { id: string; workspaceSlug: string }) {
  return (
    <Button variant="ghost" size="icon" onClick={() => deleteProduct(id, workspaceSlug)} aria-label="Delete product">
      <Trash2 className="text-destructive size-4" />
    </Button>
  );
}

export function DeletePriceListButton({ id, workspaceSlug }: { id: string; workspaceSlug: string }) {
  return (
    <Button variant="ghost" size="icon" onClick={() => deletePriceList(id, workspaceSlug)} aria-label="Delete price list">
      <Trash2 className="text-destructive size-4" />
    </Button>
  );
}
