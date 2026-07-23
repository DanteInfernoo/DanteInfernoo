import Link from "next/link";
import { Building2, LayoutDashboard, Settings, Tag, Users } from "lucide-react";
import { WorkspaceSwitcher } from "@/components/app/workspace-switcher";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/(auth)/actions";
import type { MembershipSummary } from "@/lib/data/workspaces";

interface AppSidebarProps {
  workspace: { name: string; slug: string };
  memberships: MembershipSummary[];
}

export function AppSidebar({ workspace, memberships }: AppSidebarProps) {
  const base = `/app/${workspace.slug}`;

  return (
    <aside className="bg-card text-card-foreground flex h-svh w-64 shrink-0 flex-col gap-4 border-r p-4">
      <WorkspaceSwitcher current={workspace} memberships={memberships} />

      <nav className="flex flex-col gap-1">
        <Link
          href={`${base}/dashboard`}
          className="hover:bg-accent hover:text-accent-foreground flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
        >
          <LayoutDashboard className="size-4" />
          Dashboard
        </Link>
        <Link
          href={`${base}/organizations`}
          className="hover:bg-accent hover:text-accent-foreground flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
        >
          <Building2 className="size-4" />
          Organizations
        </Link>
        <Link
          href={`${base}/persons`}
          className="hover:bg-accent hover:text-accent-foreground flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
        >
          <Users className="size-4" />
          People
        </Link>
        <Link
          href={`${base}/settings/fields`}
          className="hover:bg-accent hover:text-accent-foreground flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
        >
          <Settings className="size-4" />
          Custom fields
        </Link>
        <Link
          href={`${base}/settings/labels`}
          className="hover:bg-accent hover:text-accent-foreground flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
        >
          <Tag className="size-4" />
          Labels
        </Link>
      </nav>

      <form action={signOut} className="mt-auto">
        <Button type="submit" variant="ghost" className="w-full justify-start">
          Sign out
        </Button>
      </form>
    </aside>
  );
}
