import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CsvImportForm } from "@/components/app/csv-import-form";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";
import { getFieldDefinitionsForEntity } from "@/lib/data/fields";
import { bulkImportOrganizations } from "@/app/app/[workspace]/organizations/actions";

export default async function ImportOrganizationsPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: slug } = await params;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) notFound();

  const fieldDefs = await getFieldDefinitionsForEntity(
    workspace.id,
    "organization",
  );

  const targetFields = [
    { key: "name", label: "Name" },
    ...fieldDefs.map((f) => ({ key: f.key, label: f.label })),
  ];

  async function handleImport(rows: Record<string, string>[]) {
    "use server";
    return bulkImportOrganizations(slug, rows);
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Import organizations</CardTitle>
        <CardDescription>
          Upload a CSV and map its columns to fields on this workspace.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CsvImportForm targetFields={targetFields} onImport={handleImport} />
      </CardContent>
    </Card>
  );
}
