"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function GlobalSearchInput({ workspaceSlug }: { workspaceSlug: string }) {
  const router = useRouter();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const q = new FormData(e.currentTarget).get("q") as string;
        router.push(`/app/${workspaceSlug}/search?q=${encodeURIComponent(q)}`);
      }}
      className="relative"
    >
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2" />
      <input
        name="q"
        placeholder="Search..."
        className="border-input h-8 w-full rounded-md border bg-transparent pl-7 text-sm shadow-xs"
      />
    </form>
  );
}
