import Link from "next/link";
import {
  Boxes,
  Building2,
  CalendarClock,
  FlaskConical,
  GitBranch,
  LayoutDashboard,
  Mail,
  Map,
  Package,
  Settings,
  ShoppingCart,
  Tag,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { WorkspaceSwitcher } from "@/components/app/workspace-switcher";
import { GlobalSearchInput } from "@/components/app/global-search-input";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/(auth)/actions";
import type { MembershipSummary } from "@/lib/data/workspaces";

interface AppSidebarProps {
  workspace: { name: string; slug: string; enabled_modules?: unknown };
  memberships: MembershipSummary[];
}

export function AppSidebar({ workspace, memberships }: AppSidebarProps) {
  const base = `/app/${workspace.slug}`;
  const enabledModules = new Set(
    (workspace.enabled_modules as string[] | null) ?? [],
  );

  return (
    <aside className="bg-card text-card-foreground flex h-svh w-64 shrink-0 flex-col gap-4 border-r p-4">
      <WorkspaceSwitcher current={workspace} memberships={memberships} />
      <GlobalSearchInput workspaceSlug={workspace.slug} />

      <nav className="flex flex-col gap-1">
        <Link
          href={`${base}/dashboard`}
          className="hover:bg-accent hover:text-accent-foreground flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
        >
          <LayoutDashboard className="size-4" />
          Dashboard
        </Link>
        <Link
          href={`${base}/deals`}
          className="hover:bg-accent hover:text-accent-foreground flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
        >
          <GitBranch className="size-4" />
          Deals
        </Link>
        <Link
          href={`${base}/activities`}
          className="hover:bg-accent hover:text-accent-foreground flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
        >
          <CalendarClock className="size-4" />
          Activities
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
        {enabledModules.has("orders") ? (
          <Link
            href={`${base}/orders`}
            className="hover:bg-accent hover:text-accent-foreground flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
          >
            <ShoppingCart className="size-4" />
            Orders
          </Link>
        ) : null}
        {enabledModules.has("samples") ? (
          <Link
            href={`${base}/samples`}
            className="hover:bg-accent hover:text-accent-foreground flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
          >
            <FlaskConical className="size-4" />
            Samples
          </Link>
        ) : null}
        {enabledModules.has("territories") ? (
          <Link
            href={`${base}/territories`}
            className="hover:bg-accent hover:text-accent-foreground flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
          >
            <Map className="size-4" />
            Territories
          </Link>
        ) : null}
        <Link
          href={`${base}/settings/pipelines`}
          className="hover:bg-accent hover:text-accent-foreground flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
        >
          <GitBranch className="size-4" />
          Pipelines
        </Link>
        <Link
          href={`${base}/settings/activity-types`}
          className="hover:bg-accent hover:text-accent-foreground flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
        >
          <CalendarClock className="size-4" />
          Activity types
        </Link>
        <Link
          href={`${base}/settings/goals`}
          className="hover:bg-accent hover:text-accent-foreground flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
        >
          <Target className="size-4" />
          Goals
        </Link>
        <Link
          href={`${base}/settings/automation`}
          className="hover:bg-accent hover:text-accent-foreground flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
        >
          <Zap className="size-4" />
          Automation
        </Link>
        <Link
          href={`${base}/settings/email-templates`}
          className="hover:bg-accent hover:text-accent-foreground flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
        >
          <Mail className="size-4" />
          Email templates
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
        {enabledModules.has("products") ? (
          <Link
            href={`${base}/settings/products`}
            className="hover:bg-accent hover:text-accent-foreground flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
          >
            <Package className="size-4" />
            Products
          </Link>
        ) : null}
        {enabledModules.has("territories") ? (
          <Link
            href={`${base}/settings/territories`}
            className="hover:bg-accent hover:text-accent-foreground flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
          >
            <Map className="size-4" />
            Manage territories
          </Link>
        ) : null}
        <Link
          href={`${base}/settings/modules`}
          className="hover:bg-accent hover:text-accent-foreground flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
        >
          <Boxes className="size-4" />
          Modules
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
