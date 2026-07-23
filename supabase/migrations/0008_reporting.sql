-- Phase 8: Reporting & Dashboard. Adds what the reports need that the
-- schema didn't already carry: a generic lead-source field on deals (every
-- business tracks where a deal came from; nothing industry-specific about
-- "referral" vs "cold call" vs "website"), a stage-transition history table
-- so conversion-rate-by-stage and time-in-stage are real historical
-- queries rather than guesses from the current stage_id alone, and a
-- goals table for target-vs-actual tracking.

alter table public.deals add column source text;

create table public.deal_stage_history (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals (id) on delete cascade,
  stage_id uuid not null references public.stages (id),
  entered_at timestamptz not null default now(),
  exited_at timestamptz
);

alter table public.deal_stage_history enable row level security;

create policy "members can read stage history"
  on public.deal_stage_history for select
  to authenticated
  using (
    exists (
      select 1 from public.deals d
      where d.id = deal_id and public.is_workspace_member(d.workspace_id)
    )
  );

-- No direct write policy: history rows are only ever written by the trigger
-- below (security definer), never by application code.

create or replace function public.deals_track_stage_history()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.deal_stage_history (deal_id, stage_id)
    values (new.id, new.stage_id);
  elsif tg_op = 'UPDATE' and new.stage_id is distinct from old.stage_id then
    update public.deal_stage_history
    set exited_at = now()
    where deal_id = new.id and exited_at is null;

    insert into public.deal_stage_history (deal_id, stage_id)
    values (new.id, new.stage_id);
  end if;
  return new;
end;
$$;

create trigger deals_track_stage_history_insert
  after insert on public.deals
  for each row execute procedure public.deals_track_stage_history();

create trigger deals_track_stage_history_update
  after update on public.deals
  for each row execute procedure public.deals_track_stage_history();

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid references public.profiles (id), -- null = whole-workspace goal
  metric_type text not null, -- 'revenue' | 'deals_won' | 'activities_completed'
  period text not null, -- 'YYYY-MM'
  target_value numeric(14, 2) not null,
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id, metric_type, period)
);

alter table public.goals enable row level security;

create policy "members can read goals"
  on public.goals for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "admins can manage goals"
  on public.goals for all
  to authenticated
  using (public.is_workspace_admin(workspace_id))
  with check (public.is_workspace_admin(workspace_id));

create index deal_stage_history_deal_idx on public.deal_stage_history (deal_id);
create index deal_stage_history_stage_idx on public.deal_stage_history (stage_id);
create index goals_workspace_period_idx on public.goals (workspace_id, period);
