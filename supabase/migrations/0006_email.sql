-- Phase 6: Email logging + templates now; two-way Gmail/Outlook sync later.
-- email_accounts is the schema hook for that OAuth sync — designed now,
-- deliberately left unimplemented (no sync worker exists yet). Its RLS is
-- intentionally stricter than the rest of this migration: only the
-- connecting user can see their own row, since it will hold OAuth tokens.

create table public.email_templates (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null,
  subject text not null,
  body text not null,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger email_templates_set_updated_at
  before update on public.email_templates
  for each row execute procedure public.set_updated_at();

alter table public.email_templates enable row level security;

create policy "members can read email templates"
  on public.email_templates for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "members can manage email templates"
  on public.email_templates for all
  to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create type public.email_sync_status as enum ('not_connected', 'connected', 'error');

-- Schema for future OAuth sync. Not wired to any sync worker yet — no
-- provider tokens are ever written by the application today.
create table public.email_accounts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  provider text not null,
  email_address text not null,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  sync_status public.email_sync_status not null default 'not_connected',
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id, provider)
);

alter table public.email_accounts enable row level security;

create policy "users can manage only their own email account connection"
  on public.email_accounts for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create type public.email_direction as enum ('outbound', 'inbound');

create table public.emails (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  direction public.email_direction not null default 'outbound',
  subject text,
  body text not null,
  from_address text,
  to_addresses text[] not null default '{}',
  sent_at timestamptz not null default now(),
  deal_id uuid references public.deals (id) on delete cascade,
  person_id uuid references public.persons (id) on delete cascade,
  organization_id uuid references public.organizations (id) on delete cascade,
  logged_by uuid references public.profiles (id),
  -- Populated only by the future sync worker; null for every manually
  -- logged email today.
  email_account_id uuid references public.email_accounts (id) on delete set null,
  external_message_id text,
  thread_id text,
  created_at timestamptz not null default now()
);

alter table public.emails enable row level security;

create policy "members can read emails"
  on public.emails for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "members can manage emails"
  on public.emails for all
  to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create index emails_workspace_idx on public.emails (workspace_id, sent_at desc);
create index emails_deal_idx on public.emails (deal_id);
create index emails_person_idx on public.emails (person_id);
create index emails_organization_idx on public.emails (organization_id);
