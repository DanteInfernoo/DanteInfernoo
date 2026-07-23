import Link from "next/link";
import { DeleteSavedFilterButton } from "@/components/app/delete-saved-filter-button";
import type { SavedFilterRow } from "@/lib/data/saved-filters";

export function SavedFiltersList({
  filters,
  basePath,
  listPath,
  currentUserId,
}: {
  filters: SavedFilterRow[];
  basePath: string;
  listPath: string;
  currentUserId: string | undefined;
}) {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((f) => {
        const params = new URLSearchParams(
          f.filter_params as Record<string, string>,
        ).toString();
        return (
          <span
            key={f.id}
            className="bg-muted flex items-center gap-1 rounded-full px-2 py-1 text-xs"
          >
            <Link href={`${basePath}${params ? `?${params}` : ""}`}>
              {f.name}
              {f.is_shared ? " · shared" : ""}
            </Link>
            {f.owner_id === currentUserId ? (
              <DeleteSavedFilterButton id={f.id} listPath={listPath} />
            ) : null}
          </span>
        );
      })}
    </div>
  );
}
