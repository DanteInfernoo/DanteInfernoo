import { NextResponse } from "next/server";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";
import { listPersons } from "@/lib/data/persons";
import { getFieldDefinitionsForEntity } from "@/lib/data/fields";
import { toCsv } from "@/lib/csv";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ workspace: string }> },
) {
  const { workspace: slug } = await params;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const q = new URL(request.url).searchParams.get("q") ?? undefined;
  const [persons, fieldDefs] = await Promise.all([
    listPersons(workspace.id, q),
    getFieldDefinitionsForEntity(workspace.id, "person"),
  ]);

  const columns = [
    "name",
    "email",
    "phone",
    "organization_name",
    ...fieldDefs.map((f) => f.key),
  ];
  const rows = persons.map((p) => {
    const customFields = (p.custom_fields ?? {}) as Record<string, unknown>;
    return {
      name: p.name,
      email: p.email,
      phone: p.phone,
      organization_name: p.organization?.name ?? "",
      ...customFields,
    };
  });

  const csv = toCsv(columns, rows);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="persons.csv"`,
    },
  });
}
