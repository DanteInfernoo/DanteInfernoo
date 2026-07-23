-- Phase 10b/10c/10d: Orders, Standing Orders, and Samples/Trials — the
-- repeat-purchase side of a wholesale B2B business. A deal is "win this
-- account"; an order is "they bought again this week." All member-writable
-- (operational, same tier as deals).

create type public.order_status as enum (
  'draft', 'confirmed', 'in_production', 'delivered', 'invoiced', 'paid'
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  deal_id uuid references public.deals (id) on delete set null,
  po_number text,
  order_date date not null default current_date,
  requested_delivery_date date,
  status public.order_status not null default 'draft',
  tax_rate numeric(5, 2) not null default 0,
  subtotal numeric(14, 2) not null default 0,
  tax numeric(14, 2) not null default 0,
  total numeric(14, 2) not null default 0,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute procedure public.set_updated_at();

alter table public.orders enable row level security;

create policy "members can read orders"
  on public.orders for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "members can manage orders"
  on public.orders for all
  to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

-- Recomputes subtotal/tax/total on an order whenever its line_items change.
-- security definer for the same reason as deals_track_stage_history: line_items
-- writes happen as the member doing the writing, but this is bookkeeping the
-- order row itself needs regardless of who triggered it.
create or replace function public.recalculate_order_totals(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_subtotal numeric(14, 2);
  v_tax_rate numeric(5, 2);
begin
  select coalesce(sum(line_total), 0) into v_subtotal
  from public.line_items
  where entity_type = 'order' and entity_id = p_order_id;

  select tax_rate into v_tax_rate from public.orders where id = p_order_id;

  update public.orders
  set subtotal = v_subtotal,
      tax = round(v_subtotal * coalesce(v_tax_rate, 0) / 100, 2),
      total = v_subtotal + round(v_subtotal * coalesce(v_tax_rate, 0) / 100, 2)
  where id = p_order_id;
end;
$$;

create or replace function public.line_items_recalculate_order()
returns trigger
language plpgsql
as $$
declare
  affected_id uuid;
begin
  affected_id := coalesce(new.entity_id, old.entity_id);
  if (tg_op = 'DELETE' and old.entity_type = 'order')
     or (tg_op != 'DELETE' and new.entity_type = 'order') then
    perform public.recalculate_order_totals(affected_id);
  end if;
  return coalesce(new, old);
end;
$$;

create trigger line_items_recalculate_order
  after insert or update or delete on public.line_items
  for each row execute procedure public.line_items_recalculate_order();

create type public.standing_order_interval as enum ('weekly', 'biweekly', 'monthly');

create table public.standing_orders (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  interval public.standing_order_interval not null default 'weekly',
  line_items_template jsonb not null default '[]'::jsonb, -- [{ "product_id": "...", "quantity": 10 }]
  next_generation_date date not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.standing_orders enable row level security;

create policy "members can read standing orders"
  on public.standing_orders for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "members can manage standing orders"
  on public.standing_orders for all
  to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

-- Generates every standing order due today or earlier into a real draft
-- order. Called from the app (a button, or in a real deployment a scheduled
-- job) rather than automatically — same reasoning as run_automations: no
-- scheduler is available in this environment.
create or replace function public.generate_due_standing_orders(p_workspace_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  so record;
  new_order_id uuid;
  item jsonb;
  generated_count integer := 0;
  next_date date;
begin
  if not public.is_workspace_member(p_workspace_id) then
    return 0;
  end if;

  for so in
    select * from public.standing_orders
    where workspace_id = p_workspace_id
      and is_active
      and next_generation_date <= current_date
  loop
    insert into public.orders (workspace_id, organization_id, order_date, status)
    values (p_workspace_id, so.organization_id, current_date, 'draft')
    returning id into new_order_id;

    for item in select * from jsonb_array_elements(so.line_items_template)
    loop
      insert into public.line_items (workspace_id, entity_type, entity_id, product_id, quantity, unit_price)
      select
        p_workspace_id, 'order', new_order_id,
        (item ->> 'product_id')::uuid,
        (item ->> 'quantity')::numeric,
        p.base_price
      from public.products p
      where p.id = (item ->> 'product_id')::uuid;
    end loop;

    next_date := case so.interval
      when 'weekly' then so.next_generation_date + interval '7 days'
      when 'biweekly' then so.next_generation_date + interval '14 days'
      when 'monthly' then so.next_generation_date + interval '1 month'
    end;

    update public.standing_orders
    set next_generation_date = next_date
    where id = so.id;

    generated_count := generated_count + 1;
  end loop;

  return generated_count;
end;
$$;

create table public.samples (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  person_id uuid references public.persons (id) on delete set null,
  product_id uuid not null references public.products (id),
  dropped_date date not null default current_date,
  feedback text,
  follow_up_activity_id uuid references public.activities (id) on delete set null,
  converted_order_id uuid references public.orders (id) on delete set null,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

alter table public.samples enable row level security;

create policy "members can read samples"
  on public.samples for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "members can manage samples"
  on public.samples for all
  to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create index orders_workspace_idx on public.orders (workspace_id);
create index orders_organization_idx on public.orders (organization_id);
create index standing_orders_workspace_idx on public.standing_orders (workspace_id, next_generation_date);
create index samples_organization_idx on public.samples (organization_id);
create index samples_workspace_idx on public.samples (workspace_id);
