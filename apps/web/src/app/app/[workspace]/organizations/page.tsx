import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";
import { listOrganizations } from "@/lib/data/organizations";

export default async function OrganizationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspace: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { workspace: slug } = await params;
  const { q } = await searchParams;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) notFound();

  const organizations = await listOrganizations(workspace.id, q);

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Organizations</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/app/${slug}/organizations/import`}>Import CSV</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/app/${slug}/organizations/export${q ? `?q=${q}` : ""}`}>
              Export CSV
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/app/${slug}/organizations/new`}>New organization</Link>
          </Button>
        </div>
      </div>

      <form className="flex gap-2">
        <Input name="q" placeholder="Search by name..." defaultValue={q} />
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      <div className="flex flex-col divide-y rounded-lg border">
        {organizations.map((org) => (
          <Link
            key={org.id}
            href={`/app/${slug}/organizations/${org.id}`}
            className="hover:bg-accent flex items-center justify-between px-4 py-3 text-sm"
          >
            <span>{org.name}</span>
          </Link>
        ))}
        {organizations.length === 0 ? (
          <p className="text-muted-foreground px-4 py-6 text-sm">
            No organizations yet.
          </p>
        ) : null}
      </div>
    </div>
  );
}
