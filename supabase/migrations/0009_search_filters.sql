-- Phase 9: Global search (no new schema — it queries organizations/persons/
-- deals directly) and saved filters. A saved filter is just a name plus the
-- serialized query-string state of a list view (search text, sort, status),
-- scoped to whichever entity_type it was saved from. Private filters are
-- visible only to their owner; shared filters are visible to the whole
-- workspace but still only editable by their owner.

create table public.saved_filters (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  entity_type text not null,
  name text not null,
  filter_params jsonb not null default '{}'::jsonb,
  is_shared boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.saved_filters enable row level security;

create policy "members can read shared filters and their own private ones"
  on public.saved_filters for select
  to authenticated
  using (
    public.is_workspace_member(workspace_id)
    and (is_shared or owner_id = auth.uid())
  );

create policy "users can create their own saved filters"
  on public.saved_filters for insert
  to authenticated
  with check (public.is_workspace_member(workspace_id) and owner_id = auth.uid());

create policy "users can update their own saved filters"
  on public.saved_filters for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "users can delete their own saved filters"
  on public.saved_filters for delete
  to authenticated
  using (owner_id = auth.uid());

create index saved_filters_workspace_entity_idx
  on public.saved_filters (workspace_id, entity_type);
