-- Phase 10a: Products, Price Lists, and line items shared by deals and
-- orders. This is the first of the B2B wholesale modules — all optional,
-- toggled per workspace via workspaces.enabled_modules (already existed
-- since Phase 1). Products/price lists are admin-managed catalog data
-- (catalog integrity matters); per-account overrides and line items are
-- operational, member-writable.

create table public.products (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  sku text not null,
  name text not null,
  description text,
  uom text not null default 'each',
  case_pack integer,
  case_weight numeric(10, 2),
  cost numeric(12, 2),
  base_price numeric(12, 2) not null default 0,
  is_active boolean not null default true,
  custom_fields jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, sku)
);

create trigger products_set_updated_at
  before update on public.products
  for each row execute procedure public.set_updated_at();

alter table public.products enable row level security;

create policy "members can read products"
  on public.products for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "admins can manage products"
  on public.products for all
  to authenticated
  using (public.is_workspace_admin(workspace_id))
  with check (public.is_workspace_admin(workspace_id));

create table public.price_lists (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.price_lists enable row level security;

create policy "members can read price lists"
  on public.price_lists for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "admins can manage price lists"
  on public.price_lists for all
  to authenticated
  using (public.is_workspace_admin(workspace_id))
  with check (public.is_workspace_admin(workspace_id));

create table public.price_list_items (
  id uuid primary key default gen_random_uuid(),
  price_list_id uuid not null references public.price_lists (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  price numeric(12, 2) not null,
  volume_tiers jsonb not null default '[]'::jsonb, -- [{ "min_qty": 10, "price": 9.5 }]
  unique (price_list_id, product_id)
);

alter table public.price_list_items enable row level security;

create policy "members can read price list items"
  on public.price_list_items for select
  to authenticated
  using (
    exists (
      select 1 from public.price_lists pl
      where pl.id = price_list_id and public.is_workspace_member(pl.workspace_id)
    )
  );

create policy "admins can manage price list items"
  on public.price_list_items for all
  to authenticated
  using (
    exists (
      select 1 from public.price_lists pl
      where pl.id = price_list_id and public.is_workspace_admin(pl.workspace_id)
    )
  )
  with check (
    exists (
      select 1 from public.price_lists pl
      where pl.id = price_list_id and public.is_workspace_admin(pl.workspace_id)
    )
  );

create table public.account_price_overrides (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  price numeric(12, 2),
  discount_pct numeric(5, 2),
  created_at timestamptz not null default now(),
  unique (organization_id, product_id)
);

alter table public.account_price_overrides enable row level security;

create policy "members can read account price overrides"
  on public.account_price_overrides for select
  to authenticated
  using (
    exists (
      select 1 from public.organizations o
      where o.id = organization_id and public.is_workspace_member(o.workspace_id)
    )
  );

create policy "members can manage account price overrides"
  on public.account_price_overrides for all
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

-- ---------------------------------------------------------------------------
-- Line items: shared by deals and orders (polymorphic, same pattern as
-- notes/files). line_total is a generated column so SUM(line_total) in
-- reporting queries is always consistent with quantity * unit_price.
-- ---------------------------------------------------------------------------
create table public.line_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  entity_type text not null, -- 'deal' | 'order'
  entity_id uuid not null,
  product_id uuid references public.products (id),
  description text,
  quantity numeric(12, 2) not null default 1,
  unit_price numeric(12, 2) not null default 0,
  unit_cost numeric(12, 2), -- snapshot of product cost at time of entry, for margin
  line_total numeric(14, 2) generated always as (quantity * unit_price) stored,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.line_items enable row level security;

create policy "members can read line items"
  on public.line_items for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "members can manage line items"
  on public.line_items for all
  to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create index products_workspace_idx on public.products (workspace_id);
create index price_list_items_price_list_idx on public.price_list_items (price_list_id);
create index account_price_overrides_org_idx on public.account_price_overrides (organization_id);
create index line_items_entity_idx on public.line_items (entity_type, entity_id);
