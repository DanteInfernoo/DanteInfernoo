import { NextResponse } from "next/server";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";
import { listOrganizations } from "@/lib/data/organizations";
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
  const [organizations, fieldDefs] = await Promise.all([
    listOrganizations(workspace.id, q),
    getFieldDefinitionsForEntity(workspace.id, "organization"),
  ]);

  const columns = ["name", ...fieldDefs.map((f) => f.key)];
  const rows = organizations.map((org) => {
    const customFields = (org.custom_fields ?? {}) as Record<string, unknown>;
    return { name: org.name, ...customFields };
  });

  const csv = toCsv(columns, rows);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="organizations.csv"`,
    },
  });
}
