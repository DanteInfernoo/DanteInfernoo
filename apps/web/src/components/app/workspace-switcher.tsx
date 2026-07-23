"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkspaceSwitcherProps {
  current: { name: string; slug: string };
  memberships: { workspace: { name: string; slug: string } }[];
}

export function WorkspaceSwitcher({
  current,
  memberships,
}: WorkspaceSwitcherProps) {
  const [open, setOpen] = useState(false);
  const others = memberships.filter((m) => m.workspace.slug !== current.slug);

  return (
    <div className="relative">
      <Button
        variant="outline"
        className="w-full justify-between"
        onClick={() => setOpen((v) => !v)}
      >
        {current.name}
        <ChevronsUpDown className="size-4" />
      </Button>
      {open ? (
        <div className="bg-popover text-popover-foreground absolute top-full left-0 z-10 mt-1 w-full rounded-md border p-1 shadow-md">
          {others.map((m) => (
            <Link
              key={m.workspace.slug}
              href={`/app/${m.workspace.slug}/dashboard`}
              className="hover:bg-accent hover:text-accent-foreground block rounded-sm px-2 py-1.5 text-sm"
              onClick={() => setOpen(false)}
            >
              {m.workspace.name}
            </Link>
          ))}
          <Link
            href="/app/onboarding"
            className="hover:bg-accent hover:text-accent-foreground block rounded-sm px-2 py-1.5 text-sm"
            onClick={() => setOpen(false)}
          >
            + New workspace
          </Link>
        </div>
      ) : null}
    </div>
  );
}
