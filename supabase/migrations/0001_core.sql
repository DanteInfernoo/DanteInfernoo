-- Phase 1: workspaces, membership, profiles, and the generic custom-field engine.
-- Every tenant-scoped table carries workspace_id and is protected by RLS keyed
-- off workspace_members, so a workspace can only ever see its own data.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Profiles (one row per auth.users, kept in sync by trigger below)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are readable by any authenticated user"
  on public.profiles for select
  to authenticated
  using (true);

create policy "users can update their own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid());

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Workspaces (the tenant boundary) and membership
-- ---------------------------------------------------------------------------
create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  enabled_modules jsonb not null default '[]'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create type public.workspace_role as enum ('owner', 'admin', 'member');

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.workspace_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

-- Helper: is the current JWT holder a member of the given workspace?
-- security definer + a fixed search_path avoids recursive-RLS lookups on
-- workspace_members while still respecting who can call it (authenticated only).
create function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.workspace_members m
    where m.workspace_id = target_workspace_id
      and m.user_id = auth.uid()
  );
$$;

create function public.is_workspace_admin(target_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.workspace_members m
    where m.workspace_id = target_workspace_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
  );
$$;

-- Used only by the "creator can seed the first membership row" policy below.
-- Must be security definer: a brand-new workspace has no members yet, so an
-- inline EXISTS against public.workspaces in the policy itself would be
-- blocked by workspaces' own membership-gated SELECT policy (chicken-and-egg).
create function public.is_workspace_creator(target_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.workspaces w
    where w.id = target_workspace_id
      and w.created_by = auth.uid()
  );
$$;

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;

create policy "members can read their workspaces"
  on public.workspaces for select
  to authenticated
  using (public.is_workspace_member(id));

create policy "authenticated users can create a workspace"
  on public.workspaces for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "admins can update their workspace"
  on public.workspaces for update
  to authenticated
  using (public.is_workspace_admin(id));

create policy "members can read membership rows in their workspaces"
  on public.workspace_members for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "admins can manage membership"
  on public.workspace_members for insert
  to authenticated
  with check (public.is_workspace_admin(workspace_id));

create policy "admins can update membership"
  on public.workspace_members for update
  to authenticated
  using (public.is_workspace_admin(workspace_id));

create policy "admins can remove members"
  on public.workspace_members for delete
  to authenticated
  using (public.is_workspace_admin(workspace_id));

-- A freshly created workspace has no members yet, so the creator must be able
-- to insert the first (owner) membership row for a workspace they just made.
create policy "creator can seed the first membership row"
  on public.workspace_members for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and public.is_workspace_creator(workspace_id)
  );

-- ---------------------------------------------------------------------------
-- Custom field definitions (the generic schema engine)
-- Any entity_type (a free-form string like 'deal', 'person', 'organization',
-- or a future entity a workspace invents) can have workspace-defined fields.
-- ---------------------------------------------------------------------------
create type public.custom_field_type as enum (
  'text', 'number', 'date', 'dropdown', 'multiselect', 'currency', 'checkbox'
);

create table public.custom_field_definitions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  entity_type text not null,
  key text not null,
  label text not null,
  field_type public.custom_field_type not null,
  options jsonb not null default '[]'::jsonb, -- [{ "value": "buyer", "label": "Buyer", "color": "#..." }]
  is_required boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (workspace_id, entity_type, key)
);

alter table public.custom_field_definitions enable row level security;

create policy "members can read field definitions"
  on public.custom_field_definitions for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "admins can manage field definitions"
  on public.custom_field_definitions for all
  to authenticated
  using (public.is_workspace_admin(workspace_id))
  with check (public.is_workspace_admin(workspace_id));

-- ---------------------------------------------------------------------------
-- Labels (colored tags any entity_type can attach, e.g. deal/person/org labels)
-- ---------------------------------------------------------------------------
create table public.labels (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  entity_type text not null,
  name text not null,
  color text not null default '#6b7280',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (workspace_id, entity_type, name)
);

create table public.entity_labels (
  label_id uuid not null references public.labels (id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (label_id, entity_id)
);

alter table public.labels enable row level security;
alter table public.entity_labels enable row level security;

create policy "members can read labels"
  on public.labels for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "admins can manage labels"
  on public.labels for all
  to authenticated
  using (public.is_workspace_admin(workspace_id))
  with check (public.is_workspace_admin(workspace_id));

create policy "members can read entity label links"
  on public.entity_labels for select
  to authenticated
  using (
    exists (
      select 1 from public.labels l
      where l.id = label_id and public.is_workspace_member(l.workspace_id)
    )
  );

create policy "members can attach/detach labels"
  on public.entity_labels for all
  to authenticated
  using (
    exists (
      select 1 from public.labels l
      where l.id = label_id and public.is_workspace_member(l.workspace_id)
    )
  )
  with check (
    exists (
      select 1 from public.labels l
      where l.id = label_id and public.is_workspace_member(l.workspace_id)
    )
  );

create index entity_labels_entity_idx on public.entity_labels (entity_type, entity_id);
create index custom_field_definitions_lookup_idx
  on public.custom_field_definitions (workspace_id, entity_type);
create index workspace_members_user_idx on public.workspace_members (user_id);
