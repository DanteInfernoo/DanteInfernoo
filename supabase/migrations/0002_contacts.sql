-- Phase 2: Organizations and Persons, the two linked core CRM entities.
-- Both are workspace-scoped, both carry a custom_fields jsonb column driven
-- by custom_field_definitions (entity_type 'organization' / 'person'), and
-- both can be labeled via the existing labels/entity_labels tables.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null,
  owner_id uuid references public.profiles (id),
  custom_fields jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.persons (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  organization_id uuid references public.organizations (id) on delete set null,
  name text not null,
  email text,
  phone text,
  owner_id uuid references public.profiles (id),
  custom_fields jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger organizations_set_updated_at
  before update on public.organizations
  for each row execute procedure public.set_updated_at();

create trigger persons_set_updated_at
  before update on public.persons
  for each row execute procedure public.set_updated_at();

alter table public.organizations enable row level security;
alter table public.persons enable row level security;

create policy "members can read organizations"
  on public.organizations for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "members can manage organizations"
  on public.organizations for all
  to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "members can read persons"
  on public.persons for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "members can manage persons"
  on public.persons for all
  to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create index organizations_workspace_idx on public.organizations (workspace_id);
create index organizations_name_idx on public.organizations (workspace_id, name);
create index persons_workspace_idx on public.persons (workspace_id);
create index persons_organization_idx on public.persons (organization_id);
create index persons_name_idx on public.persons (workspace_id, name);

-- ---------------------------------------------------------------------------
-- Merge/dedupe. security invoker (the default) so RLS on every touched table
-- still applies to the calling user — merging only ever works within a
-- workspace you're a member of, same as any other read/write on these tables.
-- ---------------------------------------------------------------------------
create function public.merge_organizations(primary_id uuid, duplicate_id uuid)
returns void
language plpgsql
as $$
begin
  if not exists (
    select 1 from public.organizations a, public.organizations b
    where a.id = primary_id and b.id = duplicate_id
      and a.workspace_id = b.workspace_id
  ) then
    raise exception 'Both organizations must exist in the same workspace';
  end if;

  update public.persons
  set organization_id = primary_id
  where organization_id = duplicate_id;

  insert into public.entity_labels (label_id, entity_type, entity_id)
  select label_id, entity_type, primary_id
  from public.entity_labels
  where entity_type = 'organization' and entity_id = duplicate_id
  on conflict (label_id, entity_id) do nothing;

  update public.organizations p
  set custom_fields = coalesce(d.custom_fields, '{}'::jsonb) || p.custom_fields
  from public.organizations d
  where p.id = primary_id and d.id = duplicate_id;

  delete from public.entity_labels
  where entity_type = 'organization' and entity_id = duplicate_id;

  delete from public.organizations where id = duplicate_id;
end;
$$;

create function public.merge_persons(primary_id uuid, duplicate_id uuid)
returns void
language plpgsql
as $$
begin
  if not exists (
    select 1 from public.persons a, public.persons b
    where a.id = primary_id and b.id = duplicate_id
      and a.workspace_id = b.workspace_id
  ) then
    raise exception 'Both persons must exist in the same workspace';
  end if;

  insert into public.entity_labels (label_id, entity_type, entity_id)
  select label_id, entity_type, primary_id
  from public.entity_labels
  where entity_type = 'person' and entity_id = duplicate_id
  on conflict (label_id, entity_id) do nothing;

  update public.persons p
  set
    email = coalesce(p.email, d.email),
    phone = coalesce(p.phone, d.phone),
    organization_id = coalesce(p.organization_id, d.organization_id),
    custom_fields = coalesce(d.custom_fields, '{}'::jsonb) || p.custom_fields
  from public.persons d
  where p.id = primary_id and d.id = duplicate_id;

  delete from public.entity_labels
  where entity_type = 'person' and entity_id = duplicate_id;

  delete from public.persons where id = duplicate_id;
end;
$$;
