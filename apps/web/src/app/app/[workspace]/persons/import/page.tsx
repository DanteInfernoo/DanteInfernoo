import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CsvImportForm } from "@/components/app/csv-import-form";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";
import { getFieldDefinitionsForEntity } from "@/lib/data/fields";
import { bulkImportPersons } from "@/app/app/[workspace]/persons/actions";

export default async function ImportPersonsPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: slug } = await params;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) notFound();

  const fieldDefs = await getFieldDefinitionsForEntity(workspace.id, "person");

  const targetFields = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "organization_name", label: "Organization (matched by name)" },
    ...fieldDefs.map((f) => ({ key: f.key, label: f.label })),
  ];

  async function handleImport(rows: Record<string, string>[]) {
    "use server";
    return bulkImportPersons(slug, rows);
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Import people</CardTitle>
        <CardDescription>
          Upload a CSV and map its columns. The organization column is
          matched against existing organizations by exact name.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CsvImportForm targetFields={targetFields} onImport={handleImport} />
      </CardContent>
    </Card>
  );
}
