import Link from "next/link";
import { notFound } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWorkspaceBySlug } from "@/lib/data/workspaces";
import { searchWorkspace } from "@/lib/data/search";

export default async function SearchPage({
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

  const results = q ? await searchWorkspace(workspace.id, q) : null;

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <h1 className="text-2xl font-semibold">Search</h1>
      <form className="flex gap-2">
        <Input
          name="q"
          placeholder="Search organizations, people, deals..."
          defaultValue={q}
          autoFocus
        />
        <Button type="submit">Search</Button>
      </form>

      {results ? (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Organizations ({results.organizations.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              {results.organizations.map((o) => (
                <Link
                  key={o.id}
                  href={`/app/${slug}/organizations/${o.id}`}
                  className="hover:bg-accent rounded-md px-2 py-1.5 text-sm"
                >
                  {o.name}
                </Link>
              ))}
              {results.organizations.length === 0 ? (
                <p className="text-muted-foreground text-sm">No matches.</p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">People ({results.persons.length})</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              {results.persons.map((p) => (
                <Link
                  key={p.id}
                  href={`/app/${slug}/persons/${p.id}`}
                  className="hover:bg-accent rounded-md px-2 py-1.5 text-sm"
                >
                  {p.name} {p.email ? `· ${p.email}` : ""}
                </Link>
              ))}
              {results.persons.length === 0 ? (
                <p className="text-muted-foreground text-sm">No matches.</p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Deals ({results.deals.length})</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              {results.deals.map((d) => (
                <Link
                  key={d.id}
                  href={`/app/${slug}/deals/${d.id}`}
                  className="hover:bg-accent rounded-md px-2 py-1.5 text-sm"
                >
                  {d.title}
                </Link>
              ))}
              {results.deals.length === 0 ? (
                <p className="text-muted-foreground text-sm">No matches.</p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          Search across organizations, people, and deals in this workspace.
        </p>
      )}
    </div>
  );
}
