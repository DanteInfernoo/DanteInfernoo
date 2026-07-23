"use client";

import { useRef, useState, useTransition } from "react";
import { uploadFile } from "@/app/app/[workspace]/timeline-actions";

export function FileUploader({
  workspaceSlug,
  entityType,
  entityId,
}: {
  workspaceSlug: string;
  entityType: string;
  entityId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1">
      <input
        ref={inputRef}
        type="file"
        className="text-sm"
        disabled={isPending}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const formData = new FormData();
          formData.set("file", file);
          setError(null);
          startTransition(async () => {
            try {
              await uploadFile(workspaceSlug, entityType, entityId, formData);
              if (inputRef.current) inputRef.current.value = "";
            } catch (err) {
              setError(err instanceof Error ? err.message : "Upload failed");
            }
          });
        }}
      />
      {isPending ? <p className="text-muted-foreground text-xs">Uploading...</p> : null}
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </div>
  );
}
