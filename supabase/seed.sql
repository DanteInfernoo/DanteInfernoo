-- Demo seed data — Sunrise Bakery Co.
--
-- This file is the ONLY place in the codebase where industry-specific
-- vocabulary ("pita", "bakery", flatbread SKUs, delivery routes, etc.)
-- appears. Everything it inserts is ordinary rows in the generic schema —
-- pipelines/stages, custom field definitions, labels, products, price
-- lists, territories, and so on are all just workspace-owned data. Swap
-- this file for a different seed and the app becomes a CRM for any other
-- kind of B2B wholesale business (or drop the products/orders/samples/
-- territories modules entirely) without touching a single line of code.
--
-- Run via `supabase db reset` (applies migrations, then this file) or
-- `pnpm db:seed`. Demo login: demo@sunrisebakery.example / demo1234sunrise

begin;

-- ---------------------------------------------------------------------------
-- Auth users (inserted directly into auth.users/auth.identities, the
-- standard way to seed Supabase Auth without going through the signup API).
-- The public.profiles rows are created automatically by the
-- on_auth_user_created trigger.
-- ---------------------------------------------------------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token,
  email_change_token_new, email_change
) values
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'authenticated', 'authenticated',
    'demo@sunrisebakery.example',
    crypt('demo1234sunrise', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Alex Baker"}',
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111112',
    'authenticated', 'authenticated',
    'rep@sunrisebakery.example',
    crypt('demo1234sunrise', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Jordan Rivera"}',
    now(), now(), '', '', '', ''
  )
on conflict (id) do nothing;

insert into auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values
  (
    gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
    jsonb_build_object('sub', '11111111-1111-1111-1111-111111111111', 'email', 'demo@sunrisebakery.example'),
    'email', now(), now(), now()
  ),
  (
    gen_random_uuid(), '11111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111112',
    jsonb_build_object('sub', '11111111-1111-1111-1111-111111111112', 'email', 'rep@sunrisebakery.example'),
    'email', now(), now(), now()
  )
on conflict do nothing;

-- Belt-and-suspenders: normally public.profiles rows are created by the
-- on_auth_user_created trigger (migration 0001) firing off the auth.users
-- insert above. Some hosted Postgres configurations run trigger execution
-- differently enough that relying on it alone during a bulk seed is
-- fragile, so insert the rows directly too — harmless no-op if the
-- trigger already created them.
insert into public.profiles (id, email, full_name) values
  ('11111111-1111-1111-1111-111111111111', 'demo@sunrisebakery.example', 'Alex Baker'),
  ('11111111-1111-1111-1111-111111111112', 'rep@sunrisebakery.example', 'Jordan Rivera')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Workspace + membership
-- ---------------------------------------------------------------------------
insert into public.workspaces (id, name, slug, enabled_modules, settings, created_by)
values (
  '22222222-2222-2222-2222-222222222222',
  'Sunrise Bakery Co.',
  'sunrise-bakery',
  '["products", "orders", "samples", "territories"]'::jsonb,
  '{}'::jsonb,
  '11111111-1111-1111-1111-111111111111'
);

insert into public.workspace_members (workspace_id, user_id, role) values
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'owner'),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111112', 'member');

-- ---------------------------------------------------------------------------
-- Custom field definitions (workspace-configurable — this vocabulary is
-- exactly as hardcoded as any other tenant's would be: not at all)
-- ---------------------------------------------------------------------------
insert into public.custom_field_definitions (id, workspace_id, entity_type, key, label, field_type, options, is_required, sort_order) values
  ('66666666-6666-6666-6666-666666666601', '22222222-2222-2222-2222-222222222222', 'organization', 'storage_type', 'Storage type', 'dropdown',
    '[{"value":"freezer","label":"Freezer"},{"value":"refrigerated","label":"Refrigerated"},{"value":"dry","label":"Dry storage"}]'::jsonb, false, 0),
  ('66666666-6666-6666-6666-666666666602', '22222222-2222-2222-2222-222222222222', 'organization', 'weekly_volume_estimate', 'Weekly volume estimate (cases)', 'number',
    '[]'::jsonb, false, 1),
  ('66666666-6666-6666-6666-666666666603', '22222222-2222-2222-2222-222222222222', 'person', 'role', 'Role', 'dropdown',
    '[{"value":"buyer","label":"Buyer"},{"value":"chef","label":"Chef / Kitchen manager"},{"value":"owner","label":"Owner"}]'::jsonb, false, 0),
  ('66666666-6666-6666-6666-666666666604', '22222222-2222-2222-2222-222222222222', 'deal', 'channel', 'Distribution channel', 'dropdown',
    '[{"value":"restaurant","label":"Restaurant"},{"value":"grocery","label":"Grocery / retail"},{"value":"foodservice","label":"Foodservice distributor"}]'::jsonb, false, 0);

-- ---------------------------------------------------------------------------
-- Labels
-- ---------------------------------------------------------------------------
insert into public.labels (id, workspace_id, entity_type, name, color, sort_order) values
  ('55555555-5555-5555-5555-555555555501', '22222222-2222-2222-2222-222222222222', 'organization', 'VIP', '#d97706', 0),
  ('55555555-5555-5555-5555-555555555502', '22222222-2222-2222-2222-222222222222', 'organization', 'At risk', '#dc2626', 1),
  ('55555555-5555-5555-5555-555555555503', '22222222-2222-2222-2222-222222222222', 'deal', 'Hot', '#ea580c', 0),
  ('55555555-5555-5555-5555-555555555504', '22222222-2222-2222-2222-222222222222', 'deal', 'Needs sample', '#2563eb', 1);

-- ---------------------------------------------------------------------------
-- Pipeline + stages
-- ---------------------------------------------------------------------------
insert into public.pipelines (id, workspace_id, name, is_default, sort_order) values
  ('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222222', 'Wholesale Sales', true, 0);

insert into public.stages (id, pipeline_id, name, probability, rotten_days, sort_order) values
  ('33333333-3333-3333-3333-333333333311', '33333333-3333-3333-3333-333333333301', 'New Lead', 10, 14, 0),
  ('33333333-3333-3333-3333-333333333312', '33333333-3333-3333-3333-333333333301', 'Sample Sent', 30, 21, 1),
  ('33333333-3333-3333-3333-333333333313', '33333333-3333-3333-3333-333333333301', 'Tasting Scheduled', 50, 30, 2),
  ('33333333-3333-3333-3333-333333333314', '33333333-3333-3333-3333-333333333301', 'Contract Negotiation', 75, 45, 3),
  ('33333333-3333-3333-3333-333333333315', '33333333-3333-3333-3333-333333333301', 'Won', 100, null, 4);

-- ---------------------------------------------------------------------------
-- Activity types
-- ---------------------------------------------------------------------------
insert into public.activity_types (id, workspace_id, name, icon, color, sort_order) values
  ('44444444-4444-4444-4444-444444444401', '22222222-2222-2222-2222-222222222222', 'Call', 'phone', '#2563eb', 0),
  ('44444444-4444-4444-4444-444444444402', '22222222-2222-2222-2222-222222222222', 'Sample drop', 'package', '#d97706', 1),
  ('44444444-4444-4444-4444-444444444403', '22222222-2222-2222-2222-222222222222', 'Delivery', 'truck', '#059669', 2),
  ('44444444-4444-4444-4444-444444444404', '22222222-2222-2222-2222-222222222222', 'Tasting / meeting', 'users', '#7c3aed', 3),
  ('44444444-4444-4444-4444-444444444405', '22222222-2222-2222-2222-222222222222', 'Email follow-up', 'mail', '#6b7280', 4);

-- ---------------------------------------------------------------------------
-- Territories (delivery routes)
-- ---------------------------------------------------------------------------
insert into public.territories (id, workspace_id, name) values
  ('77777777-7777-7777-7777-777777777701', '22222222-2222-2222-2222-222222222222', 'Downtown Route'),
  ('77777777-7777-7777-7777-777777777702', '22222222-2222-2222-2222-222222222222', 'North Metro Route'),
  ('77777777-7777-7777-7777-777777777703', '22222222-2222-2222-2222-222222222222', 'South Valley Route');

-- ---------------------------------------------------------------------------
-- Organizations
-- ---------------------------------------------------------------------------
insert into public.organizations (
  id, workspace_id, name, owner_id, custom_fields,
  territory_id, delivery_day, account_type, parent_organization_id,
  payment_terms, credit_limit, outstanding_balance, is_tax_exempt
) values
  ('88888888-8888-8888-8888-888888888801', '22222222-2222-2222-2222-222222222222', 'Riverside Deli & Grocery',
    '11111111-1111-1111-1111-111111111112', '{"storage_type":"refrigerated","weekly_volume_estimate":18}'::jsonb,
    '77777777-7777-7777-7777-777777777701', 1, 'direct', null, 'net_30', 5000, 0, false),
  ('88888888-8888-8888-8888-888888888802', '22222222-2222-2222-2222-222222222222', 'Metro Foodservice Distributors',
    '11111111-1111-1111-1111-111111111111', '{"storage_type":"dry","weekly_volume_estimate":140}'::jsonb,
    '77777777-7777-7777-7777-777777777702', 3, 'distributor', null, 'net_60', 40000, 6200, false),
  ('88888888-8888-8888-8888-888888888803', '22222222-2222-2222-2222-222222222222', 'Metro Foodservice - Eastside Branch',
    '11111111-1111-1111-1111-111111111111', '{}'::jsonb,
    '77777777-7777-7777-7777-777777777702', 3, 'location', '88888888-8888-8888-8888-888888888802', null, null, 0, false),
  ('88888888-8888-8888-8888-888888888804', '22222222-2222-2222-2222-222222222222', 'Metro Foodservice - Airport Branch',
    '11111111-1111-1111-1111-111111111111', '{}'::jsonb,
    '77777777-7777-7777-7777-777777777702', 3, 'location', '88888888-8888-8888-8888-888888888802', null, null, 0, false),
  ('88888888-8888-8888-8888-888888888805', '22222222-2222-2222-2222-222222222222', 'Green Leaf Cafe',
    '11111111-1111-1111-1111-111111111112', '{"storage_type":"refrigerated","weekly_volume_estimate":6}'::jsonb,
    '77777777-7777-7777-7777-777777777701', 2, 'direct', null, 'net_15', 2000, 0, false),
  ('88888888-8888-8888-8888-888888888806', '22222222-2222-2222-2222-222222222222', 'Sunset Grill Group',
    '11111111-1111-1111-1111-111111111112', '{"storage_type":"freezer","weekly_volume_estimate":10}'::jsonb,
    '77777777-7777-7777-7777-777777777703', 4, 'direct', null, 'cod', 1500, 0, false),
  ('88888888-8888-8888-8888-888888888807', '22222222-2222-2222-2222-222222222222', 'Corner Market Co-op',
    '11111111-1111-1111-1111-111111111111', '{"storage_type":"dry"}'::jsonb,
    null, null, 'direct', null, null, null, 0, false),
  ('88888888-8888-8888-8888-888888888808', '22222222-2222-2222-2222-222222222222', 'Bayview Hotel & Catering',
    '11111111-1111-1111-1111-111111111111', '{"storage_type":"freezer","weekly_volume_estimate":22}'::jsonb,
    '77777777-7777-7777-7777-777777777702', 5, 'direct', null, 'net_30', 10000, 850, false),
  ('88888888-8888-8888-8888-888888888809', '22222222-2222-2222-2222-222222222222', 'Fresh Start Food Trucks',
    '11111111-1111-1111-1111-111111111112', '{"storage_type":"freezer"}'::jsonb,
    null, null, 'direct', null, null, null, 0, false);

insert into public.entity_labels (label_id, entity_type, entity_id) values
  ('55555555-5555-5555-5555-555555555501', 'organization', '88888888-8888-8888-8888-888888888808'),
  ('55555555-5555-5555-5555-555555555502', 'organization', '88888888-8888-8888-8888-888888888806');

-- ---------------------------------------------------------------------------
-- Persons
-- ---------------------------------------------------------------------------
insert into public.persons (id, workspace_id, organization_id, name, email, phone, owner_id, custom_fields) values
  ('99999999-9999-9999-9999-999999999901', '22222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888801', 'Priya Shah', 'priya@riversidedeli.example', '555-0101', '11111111-1111-1111-1111-111111111112', '{"role":"buyer"}'::jsonb),
  ('99999999-9999-9999-9999-999999999902', '22222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888802', 'Marcus Webb', 'marcus@metrofoodservice.example', '555-0102', '11111111-1111-1111-1111-111111111111', '{"role":"buyer"}'::jsonb),
  ('99999999-9999-9999-9999-999999999903', '22222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888805', 'Dana Whitfield', 'dana@greenleafcafe.example', '555-0103', '11111111-1111-1111-1111-111111111112', '{"role":"chef"}'::jsonb),
  ('99999999-9999-9999-9999-999999999904', '22222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888806', 'Tom Reyes', 'tom@sunsetgrillgroup.example', '555-0104', '11111111-1111-1111-1111-111111111112', '{"role":"owner"}'::jsonb),
  ('99999999-9999-9999-9999-999999999905', '22222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888807', 'Lena Ortiz', 'lena@cornermarket.example', '555-0105', '11111111-1111-1111-1111-111111111111', '{"role":"owner"}'::jsonb),
  ('99999999-9999-9999-9999-999999999906', '22222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888808', 'Antoine Dubois', 'antoine@bayviewhotel.example', '555-0106', '11111111-1111-1111-1111-111111111111', '{"role":"chef"}'::jsonb),
  ('99999999-9999-9999-9999-999999999907', '22222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888809', 'Sam Okafor', 'sam@freshstartfoodtrucks.example', '555-0107', '11111111-1111-1111-1111-111111111112', '{"role":"owner"}'::jsonb);

-- ---------------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------------
insert into public.products (id, workspace_id, sku, name, description, uom, case_pack, case_weight, cost, base_price, is_active) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01', '22222222-2222-2222-2222-222222222222', 'PITA-6IN', '6" Pita Bread', 'Classic 6-inch white pita, 12 per bag.', 'case', 12, 24.00, 8.50, 14.00, true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02', '22222222-2222-2222-2222-222222222222', 'PITA-8IN', '8" Pita Bread', 'Larger 8-inch pita for sandwich and wrap use.', 'case', 12, 30.00, 10.00, 16.50, true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03', '22222222-2222-2222-2222-222222222222', 'FLAT-NAAN', 'Garlic Naan Flatbread', 'Butter and garlic naan, oven-ready.', 'case', 24, 36.00, 15.00, 24.00, true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa04', '22222222-2222-2222-2222-222222222222', 'FLAT-LAVASH', 'Lavash Flatbread Wraps', 'Thin, soft wraps for sandwiches and roll-ups.', 'case', 20, 22.00, 12.00, 19.50, true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa05', '22222222-2222-2222-2222-222222222222', 'PITA-WW', 'Whole Wheat Pita', 'Whole wheat 6-inch pita.', 'case', 12, 24.00, 9.00, 15.00, true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa06', '22222222-2222-2222-2222-222222222222', 'FLAT-GF', 'Gluten-Free Flatbread', 'Certified gluten-free flatbread rounds.', 'case', 10, 15.00, 18.00, 28.00, true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa07', '22222222-2222-2222-2222-222222222222', 'PITA-MINI', 'Mini Pita Pockets (Party Pack)', 'Bite-size pita pockets for catering and appetizers.', 'case', 8, 12.00, 11.00, 18.00, true);

-- ---------------------------------------------------------------------------
-- Price lists
-- ---------------------------------------------------------------------------
insert into public.price_lists (id, workspace_id, name, is_default) values
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01', '22222222-2222-2222-2222-222222222222', 'Standard Wholesale', true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02', '22222222-2222-2222-2222-222222222222', 'Distributor Pricing', false);

insert into public.price_list_items (price_list_id, product_id, price, volume_tiers) values
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01', 14.00, '[{"min_qty":20,"price":13.00}]'::jsonb),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02', 16.50, '[]'::jsonb),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03', 24.00, '[]'::jsonb),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa04', 19.50, '[]'::jsonb),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa05', 15.00, '[]'::jsonb),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa06', 28.00, '[]'::jsonb),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa07', 18.00, '[{"min_qty":15,"price":16.50}]'::jsonb),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01', 11.90, '[]'::jsonb),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02', 14.00, '[]'::jsonb),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03', 20.50, '[]'::jsonb),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa04', 16.75, '[]'::jsonb),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa05', 12.90, '[]'::jsonb),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa06', 24.50, '[]'::jsonb),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa07', 15.50, '[]'::jsonb);

insert into public.account_price_overrides (organization_id, product_id, price, discount_pct) values
  ('88888888-8888-8888-8888-888888888808', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03', 21.60, 10.00);

-- ---------------------------------------------------------------------------
-- Distributor SKU terms (Metro Foodservice Distributors' catalog)
-- ---------------------------------------------------------------------------
insert into public.distributor_sku_terms (organization_id, product_id, margin_pct, listing_status) values
  ('88888888-8888-8888-8888-888888888802', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01', 22.00, 'listed'),
  ('88888888-8888-8888-8888-888888888802', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02', 20.00, 'listed'),
  ('88888888-8888-8888-8888-888888888802', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03', 18.00, 'listed'),
  ('88888888-8888-8888-8888-888888888802', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa06', 15.00, 'pending');

-- ---------------------------------------------------------------------------
-- Deals
-- ---------------------------------------------------------------------------
insert into public.deals (
  id, workspace_id, pipeline_id, stage_id, title, value, currency,
  organization_id, person_id, owner_id, status, lost_reason,
  expected_close_date, stage_entered_at, closed_at, custom_fields
) values
  ('dddddddd-dddd-dddd-dddd-dddddddddd01', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333301', '33333333-3333-3333-3333-333333333315',
    'Riverside Deli & Grocery - Weekly Pita Program', 3200, 'USD', '88888888-8888-8888-8888-888888888801', '99999999-9999-9999-9999-999999999901',
    '11111111-1111-1111-1111-111111111112', 'won', null, current_date - 5, now() - interval '10 days', now() - interval '10 days', '{"channel":"grocery"}'::jsonb),
  ('dddddddd-dddd-dddd-dddd-dddddddddd02', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333301', '33333333-3333-3333-3333-333333333314',
    'Metro Foodservice - Regional Distribution Deal', 18000, 'USD', '88888888-8888-8888-8888-888888888802', '99999999-9999-9999-9999-999999999902',
    '11111111-1111-1111-1111-111111111111', 'open', null, current_date + 20, now() - interval '5 days', null, '{"channel":"foodservice"}'::jsonb),
  ('dddddddd-dddd-dddd-dddd-dddddddddd03', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333301', '33333333-3333-3333-3333-333333333313',
    'Green Leaf Cafe - Flatbread Wraps Trial', 2400, 'USD', '88888888-8888-8888-8888-888888888805', '99999999-9999-9999-9999-999999999903',
    '11111111-1111-1111-1111-111111111112', 'open', null, current_date + 10, now() - interval '4 days', null, '{"channel":"restaurant"}'::jsonb),
  ('dddddddd-dddd-dddd-dddd-dddddddddd04', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333301', '33333333-3333-3333-3333-333333333312',
    'Sunset Grill Group - Reorder Expansion', 1500, 'USD', '88888888-8888-8888-8888-888888888806', '99999999-9999-9999-9999-999999999904',
    '11111111-1111-1111-1111-111111111112', 'open', null, current_date + 5, now() - interval '25 days', null, '{"channel":"restaurant"}'::jsonb),
  ('dddddddd-dddd-dddd-dddd-dddddddddd05', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333301', '33333333-3333-3333-3333-333333333311',
    'Corner Market Co-op - New Account', 900, 'USD', '88888888-8888-8888-8888-888888888807', '99999999-9999-9999-9999-999999999905',
    '11111111-1111-1111-1111-111111111111', 'open', null, current_date + 14, now() - interval '2 days', null, '{"channel":"grocery"}'::jsonb),
  ('dddddddd-dddd-dddd-dddd-dddddddddd06', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333301', '33333333-3333-3333-3333-333333333315',
    'Bayview Hotel & Catering - Banquet Naan Supply', 9600, 'USD', '88888888-8888-8888-8888-888888888808', '99999999-9999-9999-9999-999999999906',
    '11111111-1111-1111-1111-111111111111', 'won', null, current_date - 35, now() - interval '40 days', now() - interval '40 days', '{"channel":"foodservice"}'::jsonb),
  ('dddddddd-dddd-dddd-dddd-dddddddddd07', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333301', '33333333-3333-3333-3333-333333333312',
    'Fresh Start Food Trucks - Mini Pita Launch', 600, 'USD', '88888888-8888-8888-8888-888888888809', '99999999-9999-9999-9999-999999999907',
    '11111111-1111-1111-1111-111111111112', 'open', null, current_date + 7, now() - interval '3 days', null, '{"channel":"restaurant"}'::jsonb),
  ('dddddddd-dddd-dddd-dddd-dddddddddd08', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333301', '33333333-3333-3333-3333-333333333314',
    'Sunset Grill Group - Original Supply Agreement', 1200, 'USD', '88888888-8888-8888-8888-888888888806', '99999999-9999-9999-9999-999999999904',
    '11111111-1111-1111-1111-111111111112', 'lost', 'Chose a competing supplier on price', current_date - 60, now() - interval '90 days', now() - interval '65 days', '{"channel":"restaurant"}'::jsonb);

insert into public.entity_labels (label_id, entity_type, entity_id) values
  ('55555555-5555-5555-5555-555555555503', 'deal', 'dddddddd-dddd-dddd-dddd-dddddddddd02'),
  ('55555555-5555-5555-5555-555555555504', 'deal', 'dddddddd-dddd-dddd-dddd-dddddddddd04');

-- Line items on the two open deals big enough to matter for pipeline value
insert into public.line_items (workspace_id, entity_type, entity_id, product_id, description, quantity, unit_price, unit_cost, sort_order) values
  ('22222222-2222-2222-2222-222222222222', 'deal', 'dddddddd-dddd-dddd-dddd-dddddddddd02', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01', null, 200, 11.90, 8.50, 0),
  ('22222222-2222-2222-2222-222222222222', 'deal', 'dddddddd-dddd-dddd-dddd-dddddddddd02', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03', null, 300, 20.50, 15.00, 1),
  ('22222222-2222-2222-2222-222222222222', 'deal', 'dddddddd-dddd-dddd-dddd-dddddddddd03', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa04', null, 60, 19.50, 12.00, 0),
  ('22222222-2222-2222-2222-222222222222', 'deal', 'dddddddd-dddd-dddd-dddd-dddddddddd03', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa06', null, 40, 28.00, 18.00, 1);

-- ---------------------------------------------------------------------------
-- Activities (a mix of done, upcoming, and overdue/rotten for demo realism)
-- ---------------------------------------------------------------------------
insert into public.activities (
  id, workspace_id, type_id, subject, notes, due_date, is_done, done_at,
  owner_id, deal_id, person_id, organization_id, recurrence_interval, recurrence_until
) values
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444401',
    'Intro call - weekly pita program rollout', 'Walked through case pack sizes and delivery windows.', current_date - 12, true, now() - interval '12 days',
    '11111111-1111-1111-1111-111111111112', 'dddddddd-dddd-dddd-dddd-dddddddddd01', '99999999-9999-9999-9999-999999999901', '88888888-8888-8888-8888-888888888801', 'none', null),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444402',
    'Drop off naan + lavash samples', null, current_date - 1, true, now() - interval '20 hours',
    '11111111-1111-1111-1111-111111111112', 'dddddddd-dddd-dddd-dddd-dddddddddd03', '99999999-9999-9999-9999-999999999903', '88888888-8888-8888-8888-888888888805', 'none', null),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee03', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444404',
    'Tasting session with kitchen team', 'Bring both flatbread SKUs plus the gluten-free option.', current_date + 2, false, null,
    '11111111-1111-1111-1111-111111111112', 'dddddddd-dddd-dddd-dddd-dddddddddd03', '99999999-9999-9999-9999-999999999903', '88888888-8888-8888-8888-888888888805', 'none', null),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee04', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444401',
    'Follow up on distribution proposal', 'Waiting on their VP of purchasing to review volume pricing.', current_date - 5, false, null,
    '11111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddd02', '99999999-9999-9999-9999-999999999902', '88888888-8888-8888-8888-888888888802', 'none', null),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee05', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444403',
    'First weekly delivery - pita program', null, current_date + 1, false, null,
    '11111111-1111-1111-1111-111111111112', null, '99999999-9999-9999-9999-999999999901', '88888888-8888-8888-8888-888888888801', 'weekly', current_date + 90),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee06', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444401',
    'Check in - reorder', 'Account has gone quiet, see if price was the issue.', current_date - 10, false, null,
    '11111111-1111-1111-1111-111111111112', 'dddddddd-dddd-dddd-dddd-dddddddddd04', '99999999-9999-9999-9999-999999999904', '88888888-8888-8888-8888-888888888806', 'none', null),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee07', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444402',
    'Mini pita pocket sample drop', null, current_date + 3, false, null,
    '11111111-1111-1111-1111-111111111112', 'dddddddd-dddd-dddd-dddd-dddddddddd07', '99999999-9999-9999-9999-999999999907', '88888888-8888-8888-8888-888888888809', 'none', null),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee08', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444405',
    'Send banquet menu pricing', null, current_date - 45, true, now() - interval '44 days',
    '11111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddd06', '99999999-9999-9999-9999-999999999906', '88888888-8888-8888-8888-888888888808', 'none', null),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee09', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444404',
    'Quarterly business review', null, current_date + 7, false, null,
    '11111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddd02', '99999999-9999-9999-9999-999999999902', '88888888-8888-8888-8888-888888888802', 'none', null);

-- ---------------------------------------------------------------------------
-- Samples / trials
-- ---------------------------------------------------------------------------
insert into public.samples (id, workspace_id, organization_id, person_id, product_id, dropped_date, feedback, follow_up_activity_id, created_by) values
  ('ffffffff-ffff-ffff-ffff-ffffffffff01', '22222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888809', '99999999-9999-9999-9999-999999999907',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa07', current_date - 3, null, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee07', '11111111-1111-1111-1111-111111111112'),
  ('ffffffff-ffff-ffff-ffff-ffffffffff02', '22222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888807', '99999999-9999-9999-9999-999999999905',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01', current_date - 6, 'Liked the flavor, comparing price against their current supplier.', null, '11111111-1111-1111-1111-111111111111'),
  ('ffffffff-ffff-ffff-ffff-ffffffffff03', '22222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888805', '99999999-9999-9999-9999-999999999903',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa04', current_date - 1, null, null, '11111111-1111-1111-1111-111111111112');

-- ---------------------------------------------------------------------------
-- Orders (subtotal/tax/total are recalculated automatically by the
-- line_items_recalculate_order trigger once line items are inserted below)
-- ---------------------------------------------------------------------------
insert into public.orders (id, workspace_id, organization_id, po_number, order_date, requested_delivery_date, status, tax_rate, created_by) values
  ('11110000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888801', 'REV-1001', current_date - 60, current_date - 58, 'paid', 8.00, '11111111-1111-1111-1111-111111111112'),
  ('11110000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888801', 'REV-1002', current_date - 30, current_date - 28, 'paid', 8.00, '11111111-1111-1111-1111-111111111112'),
  ('11110000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888801', 'REV-1003', current_date - 7, current_date - 5, 'delivered', 8.00, '11111111-1111-1111-1111-111111111112'),
  ('11110000-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888802', 'MFD-2001', current_date - 90, current_date - 87, 'paid', 6.00, '11111111-1111-1111-1111-111111111111'),
  ('11110000-0000-0000-0000-000000000005', '22222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888802', 'MFD-2002', current_date - 45, current_date - 42, 'paid', 6.00, '11111111-1111-1111-1111-111111111111'),
  ('11110000-0000-0000-0000-000000000006', '22222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888802', 'MFD-2003', current_date - 5, current_date - 2, 'invoiced', 6.00, '11111111-1111-1111-1111-111111111111'),
  ('11110000-0000-0000-0000-000000000007', '22222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888803', 'MFD-EAST-1', current_date - 20, current_date - 17, 'paid', 6.00, '11111111-1111-1111-1111-111111111111'),
  ('11110000-0000-0000-0000-000000000008', '22222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888806', 'SGG-3001', current_date - 150, current_date - 148, 'paid', 7.00, '11111111-1111-1111-1111-111111111112'),
  ('11110000-0000-0000-0000-000000000009', '22222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888806', 'SGG-3002', current_date - 125, current_date - 123, 'paid', 7.00, '11111111-1111-1111-1111-111111111112'),
  ('11110000-0000-0000-0000-000000000010', '22222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888808', 'BAY-4001', current_date - 20, current_date - 18, 'paid', 8.50, '11111111-1111-1111-1111-111111111111'),
  ('11110000-0000-0000-0000-000000000011', '22222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888808', 'BAY-4002', current_date - 10, current_date - 8, 'delivered', 8.50, '11111111-1111-1111-1111-111111111111'),
  ('11110000-0000-0000-0000-000000000012', '22222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888808', 'BAY-4003', current_date - 2, current_date + 1, 'confirmed', 8.50, '11111111-1111-1111-1111-111111111111');

insert into public.line_items (workspace_id, entity_type, entity_id, product_id, quantity, unit_price, unit_cost, sort_order) values
  ('22222222-2222-2222-2222-222222222222', 'order', '11110000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01', 10, 14.00, 8.50, 0),
  ('22222222-2222-2222-2222-222222222222', 'order', '11110000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa05', 5, 15.00, 9.00, 1),
  ('22222222-2222-2222-2222-222222222222', 'order', '11110000-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01', 12, 14.00, 8.50, 0),
  ('22222222-2222-2222-2222-222222222222', 'order', '11110000-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa05', 6, 15.00, 9.00, 1),
  ('22222222-2222-2222-2222-222222222222', 'order', '11110000-0000-0000-0000-000000000003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01', 10, 14.00, 8.50, 0),
  ('22222222-2222-2222-2222-222222222222', 'order', '11110000-0000-0000-0000-000000000003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa05', 5, 15.00, 9.00, 1),
  ('22222222-2222-2222-2222-222222222222', 'order', '11110000-0000-0000-0000-000000000004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01', 150, 11.90, 8.50, 0),
  ('22222222-2222-2222-2222-222222222222', 'order', '11110000-0000-0000-0000-000000000004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03', 100, 20.50, 15.00, 1),
  ('22222222-2222-2222-2222-222222222222', 'order', '11110000-0000-0000-0000-000000000005', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01', 180, 11.90, 8.50, 0),
  ('22222222-2222-2222-2222-222222222222', 'order', '11110000-0000-0000-0000-000000000005', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03', 120, 20.50, 15.00, 1),
  ('22222222-2222-2222-2222-222222222222', 'order', '11110000-0000-0000-0000-000000000006', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01', 200, 11.90, 8.50, 0),
  ('22222222-2222-2222-2222-222222222222', 'order', '11110000-0000-0000-0000-000000000006', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03', 150, 20.50, 15.00, 1),
  ('22222222-2222-2222-2222-222222222222', 'order', '11110000-0000-0000-0000-000000000007', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01', 40, 11.90, 8.50, 0),
  ('22222222-2222-2222-2222-222222222222', 'order', '11110000-0000-0000-0000-000000000008', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02', 20, 16.50, 10.00, 0),
  ('22222222-2222-2222-2222-222222222222', 'order', '11110000-0000-0000-0000-000000000009', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa02', 18, 16.50, 10.00, 0),
  ('22222222-2222-2222-2222-222222222222', 'order', '11110000-0000-0000-0000-000000000010', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03', 15, 21.60, 15.00, 0),
  ('22222222-2222-2222-2222-222222222222', 'order', '11110000-0000-0000-0000-000000000010', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa04', 10, 19.50, 12.00, 1),
  ('22222222-2222-2222-2222-222222222222', 'order', '11110000-0000-0000-0000-000000000011', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03', 18, 21.60, 15.00, 0),
  ('22222222-2222-2222-2222-222222222222', 'order', '11110000-0000-0000-0000-000000000011', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa04', 12, 19.50, 12.00, 1),
  ('22222222-2222-2222-2222-222222222222', 'order', '11110000-0000-0000-0000-000000000012', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03', 20, 21.60, 15.00, 0);

-- ---------------------------------------------------------------------------
-- Standing orders (recurring accounts)
-- ---------------------------------------------------------------------------
insert into public.standing_orders (id, workspace_id, organization_id, name, interval, line_items_template, next_generation_date, is_active) values
  ('22220000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888801',
    'Riverside weekly standing order', 'weekly',
    '[{"product_id":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01","quantity":10},{"product_id":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa05","quantity":5}]'::jsonb,
    current_date + 4, true),
  ('22220000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888808',
    'Bayview weekly standing order', 'weekly',
    '[{"product_id":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa03","quantity":8},{"product_id":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa04","quantity":6}]'::jsonb,
    current_date + 2, true);

-- ---------------------------------------------------------------------------
-- Notes
-- ---------------------------------------------------------------------------
insert into public.notes (workspace_id, entity_type, entity_id, body, mentioned_user_ids, author_id) values
  ('22222222-2222-2222-2222-222222222222', 'deal', 'dddddddd-dddd-dddd-dddd-dddddddddd02',
    'Spoke with Marcus about expanding to their branch locations. @Jordan Rivera can you prep volume pricing for the Eastside and Airport branches?',
    array['11111111-1111-1111-1111-111111111112']::uuid[], '11111111-1111-1111-1111-111111111111'),
  ('22222222-2222-2222-2222-222222222222', 'organization', '88888888-8888-8888-8888-888888888806',
    'Account has gone quiet after ~2 months of no reorders. Opened a deal to re-engage before we lose them to a competitor.',
    '{}'::uuid[], '11111111-1111-1111-1111-111111111112');

-- ---------------------------------------------------------------------------
-- Email templates
-- ---------------------------------------------------------------------------
insert into public.email_templates (workspace_id, name, subject, body, created_by) values
  ('22222222-2222-2222-2222-222222222222', 'Sample follow-up',
    'Following up on your sample from Sunrise Bakery Co.',
    'Hi {{person.name}},\n\nJust checking in on the sample we dropped off — would love to hear what your team thought and answer any questions about pricing or delivery.\n\nBest,\nSunrise Bakery Co.',
    '11111111-1111-1111-1111-111111111111'),
  ('22222222-2222-2222-2222-222222222222', 'New product announcement',
    'New from Sunrise Bakery Co.',
    'Hi {{person.name}},\n\nWe just added a new item to our wholesale lineup and thought of {{organization.name}} — happy to send a sample if you''d like to try it before your next order.\n\nBest,\nSunrise Bakery Co.',
    '11111111-1111-1111-1111-111111111111');

-- ---------------------------------------------------------------------------
-- Automation rule
-- ---------------------------------------------------------------------------
insert into public.automation_rules (workspace_id, name, entity_type, trigger_type, trigger_config, conditions, actions, is_active) values
  ('22222222-2222-2222-2222-222222222222', 'Prep contract when a large deal hits negotiation', 'deal', 'deal_stage_changed',
    jsonb_build_object('to_stage_id', '33333333-3333-3333-3333-333333333314'),
    '[{"field":"value","operator":"gte","value":5000}]'::jsonb,
    jsonb_build_array(jsonb_build_object('type', 'create_activity', 'type_id', '44444444-4444-4444-4444-444444444401', 'subject', 'Prepare contract & volume pricing proposal', 'due_in_days', 2)),
    true);

-- ---------------------------------------------------------------------------
-- Goals
-- ---------------------------------------------------------------------------
insert into public.goals (workspace_id, user_id, metric_type, period, target_value) values
  ('22222222-2222-2222-2222-222222222222', null, 'revenue', to_char(now(), 'YYYY-MM'), 25000),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111112', 'activities_completed', to_char(now(), 'YYYY-MM'), 20);

-- ---------------------------------------------------------------------------
-- Saved filter
-- ---------------------------------------------------------------------------
insert into public.saved_filters (workspace_id, owner_id, entity_type, name, filter_params, is_shared) values
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'deal', 'Biggest open deals',
    '{"view":"list","sort":"value","dir":"desc"}'::jsonb, true);

commit;
