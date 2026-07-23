import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TerritoryForm } from "@/components/app/territory-form";
import { DeleteTerritoryButton } from "@/components/app/delete-territory-button";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";
import { listTerritories } from "@/lib/data/territories";

export default async function TerritoriesSettingsPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: slug } = await params;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) notFound();

  const territories = await listTerritories(workspace.id);

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Territories</h1>
        <p className="text-muted-foreground text-sm">
          Delivery routes or sales territories, assigned per account.
        </p>
      </div>

      <TerritoryForm workspaceSlug={slug} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Territories</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {territories.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm">
              <span>{t.name}</span>
              <DeleteTerritoryButton id={t.id} workspaceSlug={slug} />
            </div>
          ))}
          {territories.length === 0 ? (
            <p className="text-muted-foreground text-sm">No territories yet.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
