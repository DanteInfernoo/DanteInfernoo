import { Fragment } from "react";
import Link from "next/link";
import { Paperclip } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NoteComposer } from "@/components/app/note-composer";
import { FileUploader } from "@/components/app/file-uploader";
import {
  DeleteNoteButton,
  DeleteFileButton,
} from "@/components/app/timeline-delete-buttons";
import { listNotesForEntity } from "@/lib/data/notes";
import { listFilesForEntity, getFileDownloadUrl } from "@/lib/data/files";
import { listActivitiesForEntity } from "@/lib/data/activities";
import { listWorkspaceMembers } from "@/lib/data/members";

type TimelineItem =
  | { kind: "note"; at: string; data: Awaited<ReturnType<typeof listNotesForEntity>>[number] }
  | { kind: "file"; at: string; data: Awaited<ReturnType<typeof listFilesForEntity>>[number] & { url: string } }
  | { kind: "activity"; at: string; data: Awaited<ReturnType<typeof listActivitiesForEntity>>[number] };

function renderBody(body: string, memberNames: string[]) {
  if (memberNames.length === 0) return body;
  const pattern = new RegExp(
    `(@(?:${memberNames.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")}))`,
    "g",
  );
  const parts = body.split(pattern);
  return parts.map((part, i) =>
    memberNames.some((n) => part === `@${n}`) ? (
      <span key={i} className="text-primary font-medium">
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

function formatBytes(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export async function EntityTimeline({
  workspaceSlug,
  workspaceId,
  entityType,
  entityId,
}: {
  workspaceSlug: string;
  workspaceId: string;
  entityType: "deal" | "person" | "organization";
  entityId: string;
}) {
  const [notes, files, activities, members] = await Promise.all([
    listNotesForEntity(entityType, entityId),
    listFilesForEntity(entityType, entityId),
    listActivitiesForEntity(entityType, entityId),
    listWorkspaceMembers(workspaceId),
  ]);

  const memberNames = members
    .map((m) => m.profile.full_name)
    .filter((n): n is string => Boolean(n));

  const filesWithUrls = await Promise.all(
    files.map(async (f) => ({ ...f, url: await getFileDownloadUrl(f.storage_path) })),
  );

  const items: TimelineItem[] = [
    ...notes.map((n): TimelineItem => ({ kind: "note", at: n.created_at, data: n })),
    ...filesWithUrls.map((f): TimelineItem => ({ kind: "file", at: f.created_at, data: f })),
    ...activities.map((a): TimelineItem => ({ kind: "activity", at: a.created_at, data: a })),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Timeline</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <NoteComposer
          workspaceSlug={workspaceSlug}
          entityType={entityType}
          entityId={entityId}
          memberNames={memberNames}
        />
        <FileUploader
          workspaceSlug={workspaceSlug}
          entityType={entityType}
          entityId={entityId}
        />

        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={`${item.kind}-${item.data.id}`} className="border-b pb-3 text-sm last:border-0">
              {item.kind === "note" ? (
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="whitespace-pre-wrap">
                      {renderBody(item.data.body, memberNames)}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {item.data.author?.full_name ?? item.data.author?.email ?? "Someone"} ·{" "}
                      {new Date(item.data.created_at).toLocaleString()}
                    </p>
                  </div>
                  <DeleteNoteButton
                    workspaceSlug={workspaceSlug}
                    entityType={entityType}
                    entityId={entityId}
                    noteId={item.data.id}
                  />
                </div>
              ) : null}

              {item.kind === "file" ? (
                <div className="flex items-center justify-between gap-2">
                  <Link
                    href={item.data.url}
                    target="_blank"
                    className="flex items-center gap-2 hover:underline"
                  >
                    <Paperclip className="size-3.5" />
                    {item.data.filename}
                    <span className="text-muted-foreground text-xs">
                      {formatBytes(item.data.size_bytes)}
                    </span>
                  </Link>
                  <DeleteFileButton
                    workspaceSlug={workspaceSlug}
                    entityType={entityType}
                    entityId={entityId}
                    fileId={item.data.id}
                    storagePath={item.data.storage_path}
                  />
                </div>
              ) : null}

              {item.kind === "activity" ? (
                <Link
                  href={`/app/${workspaceSlug}/activities/${item.data.id}`}
                  className="flex items-center gap-2 hover:underline"
                >
                  <span
                    className="inline-block size-2 rounded-full"
                    style={{ backgroundColor: item.data.type.color }}
                  />
                  {item.data.type.name}: {item.data.subject}
                  <span className="text-muted-foreground text-xs">
                    {item.data.is_done ? "done" : "scheduled"} for{" "}
                    {new Date(`${item.data.due_date}T00:00:00`).toLocaleDateString()}
                  </span>
                </Link>
              ) : null}
            </div>
          ))}
          {items.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nothing here yet.</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
