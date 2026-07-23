import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";
import { listOrganizationsWithRoute, dayName } from "@/lib/data/territories";

export default async function TerritoriesPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: slug } = await params;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) notFound();

  const organizations = await listOrganizationsWithRoute(workspace.id);

  const grouped = new Map<string, typeof organizations>();
  for (const org of organizations) {
    const key = org.territory?.name ?? "Unassigned";
    grouped.set(key, [...(grouped.get(key) ?? []), org]);
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <h1 className="text-2xl font-semibold">Territories & delivery routes</h1>

      {[...grouped.entries()].map(([territory, orgs]) => (
        <Card key={territory}>
          <CardHeader>
            <CardTitle className="text-base">{territory}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col divide-y">
            {orgs.map((org) => (
              <Link
                key={org.id}
                href={`/app/${slug}/organizations/${org.id}`}
                className="hover:bg-accent flex items-center justify-between px-2 py-1.5 text-sm"
              >
                <span>{org.name}</span>
                <span className="text-muted-foreground">{dayName(org.delivery_day)}</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      ))}
      {organizations.length === 0 ? (
        <p className="text-muted-foreground text-sm">No accounts yet.</p>
      ) : null}
    </div>
  );
}
