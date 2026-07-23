-- Phase 7: Automation rule builder. Rules are admin-managed config (same
-- tier as pipelines/custom fields): trigger_type + trigger_config select
-- which event fires the rule, conditions (optional, ANDed) gate on it, and
-- actions run when it matches. The vocabulary of trigger/condition/action
-- *kinds* is necessarily code (something has to know how to execute
-- "create_activity"), but every rule instance — which stage, which
-- template, which threshold — is workspace data, not hardcoded.
--
-- Execution model: there is no background worker or scheduler available in
-- this environment (Docker is blocked here, so no pg_cron/Edge Functions),
-- so run_automations() runs synchronously, called by the app right after
-- the triggering write (e.g. right after a deal's stage_id changes). In a
-- deployment with a real scheduler, the same function could equally be
-- invoked from a queue consumer instead — nothing about its logic assumes
-- synchronous, request-time execution.

create table public.automation_rules (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null,
  entity_type text not null default 'deal',
  trigger_type text not null,
  trigger_config jsonb not null default '{}'::jsonb,
  conditions jsonb not null default '[]'::jsonb,
  actions jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger automation_rules_set_updated_at
  before update on public.automation_rules
  for each row execute procedure public.set_updated_at();

alter table public.automation_rules enable row level security;

create policy "members can read automation rules"
  on public.automation_rules for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "admins can manage automation rules"
  on public.automation_rules for all
  to authenticated
  using (public.is_workspace_admin(workspace_id))
  with check (public.is_workspace_admin(workspace_id));

create table public.automation_logs (
  id uuid primary key default gen_random_uuid(),
  rule_id uuid not null references public.automation_rules (id) on delete cascade,
  entity_id uuid not null,
  result text not null,
  detail text,
  ran_at timestamptz not null default now()
);

alter table public.automation_logs enable row level security;

create policy "members can read automation logs"
  on public.automation_logs for select
  to authenticated
  using (
    exists (
      select 1 from public.automation_rules r
      where r.id = rule_id and public.is_workspace_member(r.workspace_id)
    )
  );

-- ---------------------------------------------------------------------------
-- The engine. security definer because it needs to write activities/emails/
-- deals/automation_logs on behalf of whichever rules matched, regardless of
-- the calling user's own admin/member role — but it re-checks workspace
-- membership itself as the very first thing it does, so a caller can never
-- use it to touch a workspace they don't belong to.
-- ---------------------------------------------------------------------------
create or replace function public.run_automations(
  p_workspace_id uuid,
  p_entity_type text,
  p_entity_id uuid,
  p_event_type text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  rule record;
  deal_row public.deals%rowtype;
  action jsonb;
  condition jsonb;
  conditions_pass boolean;
  field_value numeric;
begin
  if not public.is_workspace_member(p_workspace_id) then
    return;
  end if;

  if p_entity_type = 'deal' then
    select * into deal_row from public.deals
    where id = p_entity_id and workspace_id = p_workspace_id;

    if not found then
      return;
    end if;
  end if;

  for rule in
    select * from public.automation_rules
    where workspace_id = p_workspace_id
      and entity_type = p_entity_type
      and trigger_type = p_event_type
      and is_active
  loop
    if rule.trigger_type = 'deal_stage_changed'
       and rule.trigger_config ? 'to_stage_id'
       and (rule.trigger_config ->> 'to_stage_id')::uuid is distinct from deal_row.stage_id
    then
      continue;
    end if;

    conditions_pass := true;
    for condition in select * from jsonb_array_elements(coalesce(rule.conditions, '[]'::jsonb))
    loop
      if condition ->> 'field' = 'value' then
        field_value := deal_row.value;
        conditions_pass := conditions_pass and (
          case condition ->> 'operator'
            when 'gt' then field_value > (condition ->> 'value')::numeric
            when 'gte' then field_value >= (condition ->> 'value')::numeric
            when 'lt' then field_value < (condition ->> 'value')::numeric
            when 'lte' then field_value <= (condition ->> 'value')::numeric
            when 'eq' then field_value = (condition ->> 'value')::numeric
            else true
          end
        );
      end if;
    end loop;

    if not conditions_pass then
      continue;
    end if;

    for action in select * from jsonb_array_elements(coalesce(rule.actions, '[]'::jsonb))
    loop
      if action ->> 'type' = 'create_activity' then
        insert into public.activities (
          workspace_id, type_id, subject, due_date, deal_id, person_id, organization_id
        )
        values (
          p_workspace_id,
          (action ->> 'type_id')::uuid,
          coalesce(action ->> 'subject', 'Follow up'),
          current_date + make_interval(days => coalesce((action ->> 'due_in_days')::int, 1)),
          deal_row.id,
          deal_row.person_id,
          deal_row.organization_id
        );
      elsif action ->> 'type' = 'send_email_log' then
        insert into public.emails (workspace_id, direction, subject, body, deal_id, person_id, organization_id)
        select
          p_workspace_id, 'outbound', t.subject, t.body,
          deal_row.id, deal_row.person_id, deal_row.organization_id
        from public.email_templates t
        where t.id = (action ->> 'template_id')::uuid;
      elsif action ->> 'type' = 'update_custom_field' then
        update public.deals
        set custom_fields = jsonb_set(custom_fields, array[action ->> 'key'], action -> 'value')
        where id = deal_row.id;
      end if;
    end loop;

    insert into public.automation_logs (rule_id, entity_id, result)
    values (rule.id, p_entity_id, 'success');
  end loop;
end;
$$;

create index automation_rules_workspace_idx on public.automation_rules (workspace_id, entity_type, trigger_type);
create index automation_logs_rule_idx on public.automation_logs (rule_id);
