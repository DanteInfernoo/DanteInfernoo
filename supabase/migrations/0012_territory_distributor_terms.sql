-- Phase 10e/10f/10g: Territory & delivery, distributor relationships, and
-- commercial terms. Territories are admin-managed config (like labels);
-- everything else here is columns on organizations or a member-writable
-- terms table, since account type/parent/payment terms are day-to-day
-- account-management data, not schema config.

create table public.territories (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (workspace_id, name)
);

alter table public.territories enable row level security;

create policy "members can read territories"
  on public.territories for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "admins can manage territories"
  on public.territories for all
  to authenticated
  using (public.is_workspace_admin(workspace_id))
  with check (public.is_workspace_admin(workspace_id));

-- Territory/delivery + distributor rollup + commercial terms, all as plain
-- columns on organizations rather than a generic custom field, since every
-- one of these is a first-class concept the brief calls out specifically
-- (not something that varies enough between workspaces to leave to config).
alter table public.organizations add column territory_id uuid references public.territories (id) on delete set null;
alter table public.organizations add column delivery_day integer check (delivery_day between 0 and 6); -- 0 = Sunday
alter table public.organizations add column account_type text; -- e.g. 'direct' | 'distributor' | 'location' — workspace's own vocabulary
alter table public.organizations add column parent_organization_id uuid references public.organizations (id) on delete set null;
alter table public.organizations add column payment_terms text; -- e.g. 'net_15' | 'net_30' | 'net_60' | 'cod'
alter table public.organizations add column credit_limit numeric(12, 2);
alter table public.organizations add column outstanding_balance numeric(12, 2) not null default 0;
alter table public.organizations add column is_tax_exempt boolean not null default false;

create table public.distributor_sku_terms (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  margin_pct numeric(5, 2),
  listing_status text not null default 'pending', -- 'listed' | 'pending' | 'delisted'
  created_at timestamptz not null default now(),
  unique (organization_id, product_id)
);

alter table public.distributor_sku_terms enable row level security;

create policy "members can read distributor sku terms"
  on public.distributor_sku_terms for select
  to authenticated
  using (
    exists (
      select 1 from public.organizations o
      where o.id = organization_id and public.is_workspace_member(o.workspace_id)
    )
  );

create policy "members can manage distributor sku terms"
  on public.distributor_sku_terms for all
  to authenticated
  using (
    exists (
      select 1 from public.organizations o
      where o.id = organization_id and public.is_workspace_member(o.workspace_id)
    )
  )
  with check (
    exists (
      select 1 from public.organizations o
      where o.id = organization_id and public.is_workspace_member(o.workspace_id)
    )
  );

create index organizations_territory_idx on public.organizations (territory_id);
create index organizations_parent_idx on public.organizations (parent_organization_id);
create index distributor_sku_terms_org_idx on public.distributor_sku_terms (organization_id);
