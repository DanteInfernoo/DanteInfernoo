"use client";

import { useRouter } from "next/navigation";

export function PipelineSelector({
  workspaceSlug,
  pipelines,
  currentPipelineId,
  view,
}: {
  workspaceSlug: string;
  pipelines: { id: string; name: string }[];
  currentPipelineId: string;
  view: string;
}) {
  const router = useRouter();

  return (
    <select
      value={currentPipelineId}
      onChange={(e) => {
        const params = new URLSearchParams({ pipeline: e.target.value });
        if (view === "list") params.set("view", "list");
        router.push(`/app/${workspaceSlug}/deals?${params.toString()}`);
      }}
      className="border-input h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs"
    >
      {pipelines.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  );
}
