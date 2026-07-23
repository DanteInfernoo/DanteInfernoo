import { notFound } from "next/navigation";
import { AppSidebar } from "@/components/app/app-sidebar";
import { getUserMemberships, getWorkspaceBySlug } from "@/lib/data/workspaces";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: slug } = await params;

  const [workspace, memberships] = await Promise.all([
    getWorkspaceBySlug(slug),
    getUserMemberships(),
  ]);

  // RLS already scopes getWorkspaceBySlug to workspaces the user is a member
  // of, so a null result here means "doesn't exist or you can't see it" —
  // either way, a 404 is the right response for both.
  if (!workspace) {
    notFound();
  }

  return (
    <div className="flex min-h-svh">
      <AppSidebar workspace={workspace} memberships={memberships} />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
