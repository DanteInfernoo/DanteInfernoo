-- Phase 5: Notes and Files, attachable to any entity_type/entity_id (same
-- polymorphic pattern as entity_labels) — deals, persons, organizations, or
-- whatever entity type a future phase or workspace introduces. Both are
-- member-writable operational content, same tier as deals/persons/orgs.

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  body text not null,
  mentioned_user_ids uuid[] not null default '{}',
  author_id uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger notes_set_updated_at
  before update on public.notes
  for each row execute procedure public.set_updated_at();

alter table public.notes enable row level security;

create policy "members can read notes"
  on public.notes for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "members can manage notes"
  on public.notes for all
  to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create index notes_entity_idx on public.notes (entity_type, entity_id);

-- ---------------------------------------------------------------------------
-- Files: metadata rows in public.files, bytes in Supabase Storage. Storage
-- path convention is `${workspace_id}/${entity_type}/${entity_id}/${uuid}-${filename}`
-- so the storage.objects RLS policies below can derive the workspace from the
-- path itself without a metadata lookup.
-- ---------------------------------------------------------------------------
create table public.files (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  filename text not null,
  storage_path text not null,
  content_type text,
  size_bytes bigint,
  uploaded_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

alter table public.files enable row level security;

create policy "members can read files"
  on public.files for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "members can manage files"
  on public.files for all
  to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create index files_entity_idx on public.files (entity_type, entity_id);

insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false)
on conflict (id) do nothing;

create policy "members can read their workspace's attachments"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'attachments'
    and public.is_workspace_member((storage.foldername(name))[1]::uuid)
  );

create policy "members can upload to their workspace's attachments"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'attachments'
    and public.is_workspace_member((storage.foldername(name))[1]::uuid)
  );

create policy "members can delete their workspace's attachments"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'attachments'
    and public.is_workspace_member((storage.foldername(name))[1]::uuid)
  );
