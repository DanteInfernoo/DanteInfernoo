-- Phase 4: Activities. Types (call, visit, email, task, sample drop,
-- delivery, deadline, or whatever a workspace defines) are admin-managed
-- config, same tier as custom fields/labels/pipelines. Activities themselves
-- are member-writable operational records, same tier as deals/persons/orgs.

create table public.activity_types (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null,
  icon text not null default 'circle',
  color text not null default '#6b7280',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (workspace_id, name)
);

create type public.recurrence_interval as enum ('none', 'daily', 'weekly', 'monthly');

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  type_id uuid not null references public.activity_types (id),
  subject text not null,
  notes text,
  due_date date not null,
  due_time time,
  duration_minutes integer,
  is_done boolean not null default false,
  done_at timestamptz,
  owner_id uuid references public.profiles (id),
  deal_id uuid references public.deals (id) on delete cascade,
  person_id uuid references public.persons (id) on delete cascade,
  organization_id uuid references public.organizations (id) on delete cascade,
  recurrence_interval public.recurrence_interval not null default 'none',
  recurrence_until date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger activities_set_updated_at
  before update on public.activities
  for each row execute procedure public.set_updated_at();

create or replace function public.activities_track_done_at()
returns trigger
language plpgsql
as $$
begin
  if new.is_done is distinct from old.is_done then
    new.done_at = case when new.is_done then now() else null end;
  end if;
  return new;
end;
$$;

create trigger activities_track_done_at
  before update on public.activities
  for each row execute procedure public.activities_track_done_at();

alter table public.activity_types enable row level security;
alter table public.activities enable row level security;

create policy "members can read activity types"
  on public.activity_types for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "admins can manage activity types"
  on public.activity_types for all
  to authenticated
  using (public.is_workspace_admin(workspace_id))
  with check (public.is_workspace_admin(workspace_id));

create policy "members can read activities"
  on public.activities for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "members can manage activities"
  on public.activities for all
  to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create index activities_workspace_due_idx on public.activities (workspace_id, due_date);
create index activities_deal_idx on public.activities (deal_id);
create index activities_person_idx on public.activities (person_id);
create index activities_organization_idx on public.activities (organization_id);
