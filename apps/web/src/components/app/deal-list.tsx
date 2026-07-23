import Link from "next/link";
import type { DealWithRelations } from "@/lib/data/deals";
import type { StageRow } from "@/lib/data/pipelines";

function sortDeals(
  deals: DealWithRelations[],
  sort: string,
  dir: "asc" | "desc",
) {
  const factor = dir === "asc" ? 1 : -1;
  return [...deals].sort((a, b) => {
    if (sort === "value") return (a.value - b.value) * factor;
    if (sort === "title") return a.title.localeCompare(b.title) * factor;
    if (sort === "created_at")
      return (
        (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) *
        factor
      );
    return 0;
  });
}

function sortLink(
  workspaceSlug: string,
  column: string,
  currentSort: string,
  currentDir: string,
) {
  const nextDir = currentSort === column && currentDir === "asc" ? "desc" : "asc";
  return `/app/${workspaceSlug}/deals?view=list&sort=${column}&dir=${nextDir}`;
}

export function DealList({
  workspaceSlug,
  deals,
  stagesById,
  sort,
  dir,
}: {
  workspaceSlug: string;
  deals: DealWithRelations[];
  stagesById: Map<string, StageRow>;
  sort: string;
  dir: "asc" | "desc";
}) {
  const sorted = sortDeals(deals, sort, dir);

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="px-3 py-2 font-medium">
              <Link href={sortLink(workspaceSlug, "title", sort, dir)}>
                Title
              </Link>
            </th>
            <th className="px-3 py-2 font-medium">
              <Link href={sortLink(workspaceSlug, "value", sort, dir)}>
                Value
              </Link>
            </th>
            <th className="px-3 py-2 font-medium">Stage</th>
            <th className="px-3 py-2 font-medium">Organization</th>
            <th className="px-3 py-2 font-medium">Status</th>
            <th className="px-3 py-2 font-medium">
              <Link href={sortLink(workspaceSlug, "created_at", sort, dir)}>
                Created
              </Link>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {sorted.map((deal) => (
            <tr key={deal.id} className="hover:bg-accent">
              <td className="px-3 py-2">
                <Link
                  href={`/app/${workspaceSlug}/deals/${deal.id}`}
                  className="hover:underline"
                >
                  {deal.title}
                </Link>
              </td>
              <td className="px-3 py-2">
                {deal.value.toLocaleString(undefined, {
                  style: "currency",
                  currency: deal.currency,
                })}
              </td>
              <td className="px-3 py-2">
                {stagesById.get(deal.stage_id)?.name ?? ""}
              </td>
              <td className="px-3 py-2">{deal.organization?.name ?? ""}</td>
              <td className="px-3 py-2 capitalize">{deal.status}</td>
              <td className="px-3 py-2">
                {new Date(deal.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-muted-foreground px-3 py-6 text-center">
                No deals yet.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
