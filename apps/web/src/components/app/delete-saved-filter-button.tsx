"use client";

import { X } from "lucide-react";
import { deleteSavedFilter } from "@/app/app/[workspace]/saved-filters-actions";

export function DeleteSavedFilterButton({
  id,
  listPath,
}: {
  id: string;
  listPath: string;
}) {
  return (
    <button
      type="button"
      aria-label="Delete saved filter"
      onClick={() => deleteSavedFilter(id, listPath)}
    >
      <X className="size-3" />
    </button>
  );
}
