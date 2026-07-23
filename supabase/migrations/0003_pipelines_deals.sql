-- Phase 3: Pipelines, Stages, and Deals.
-- Pipelines/stages are workspace-defined configuration (admin-managed, same
-- tier as custom_field_definitions); deals are operational records members
-- read/write like organizations and persons.

create table public.pipelines (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null,
  is_default boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.stages (
  id uuid primary key default gen_random_uuid(),
  pipeline_id uuid not null references public.pipelines (id) on delete cascade,
  name text not null,
  probability integer not null default 50 check (probability between 0 and 100),
  rotten_days integer, -- null = no rot warning for this stage
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create type public.deal_status as enum ('open', 'won', 'lost');

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  pipeline_id uuid not null references public.pipelines (id),
  stage_id uuid not null references public.stages (id),
  title text not null,
  value numeric(14, 2) not null default 0,
  currency text not null default 'USD',
  organization_id uuid references public.organizations (id) on delete set null,
  person_id uuid references public.persons (id) on delete set null,
  owner_id uuid references public.profiles (id),
  status public.deal_status not null default 'open',
  lost_reason text,
  expected_close_date date,
  stage_entered_at timestamptz not null default now(),
  closed_at timestamptz,
  custom_fields jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger deals_set_updated_at
  before update on public.deals
  for each row execute procedure public.set_updated_at();

create or replace function public.deals_track_stage_and_close()
returns trigger
language plpgsql
as $$
begin
  if new.stage_id is distinct from old.stage_id then
    new.stage_entered_at = now();
  end if;

  if new.status is distinct from old.status then
    if new.status in ('won', 'lost') then
      new.closed_at = now();
    else
      new.closed_at = null;
      new.lost_reason = null;
    end if;
  end if;

  return new;
end;
$$;

create trigger deals_track_stage_and_close
  before update on public.deals
  for each row execute procedure public.deals_track_stage_and_close();

alter table public.pipelines enable row level security;
alter table public.stages enable row level security;
alter table public.deals enable row level security;

create policy "members can read pipelines"
  on public.pipelines for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "admins can manage pipelines"
  on public.pipelines for all
  to authenticated
  using (public.is_workspace_admin(workspace_id))
  with check (public.is_workspace_admin(workspace_id));

-- stages inherit their workspace through pipelines, so the check is a join.
create policy "members can read stages"
  on public.stages for select
  to authenticated
  using (
    exists (
      select 1 from public.pipelines p
      where p.id = pipeline_id and public.is_workspace_member(p.workspace_id)
    )
  );

create policy "admins can manage stages"
  on public.stages for all
  to authenticated
  using (
    exists (
      select 1 from public.pipelines p
      where p.id = pipeline_id and public.is_workspace_admin(p.workspace_id)
    )
  )
  with check (
    exists (
      select 1 from public.pipelines p
      where p.id = pipeline_id and public.is_workspace_admin(p.workspace_id)
    )
  );

create policy "members can read deals"
  on public.deals for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "members can manage deals"
  on public.deals for all
  to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create index stages_pipeline_idx on public.stages (pipeline_id, sort_order);
create index deals_workspace_idx on public.deals (workspace_id);
create index deals_pipeline_stage_idx on public.deals (pipeline_id, stage_id);
create index deals_organization_idx on public.deals (organization_id);
create index deals_person_idx on public.deals (person_id);
