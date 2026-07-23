# CRM Platform

A general-purpose, Pipedrive-style CRM. Pipelines, stages, entity types, custom
fields, and product/order modules are all configuration stored in the database
and edited from the UI — nothing industry-specific is hardcoded. A demo
workspace is provisioned via `supabase/seed`.

## Stack

- `apps/web` — Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
- `apps/mobile` — Expo (React Native)
- `packages/shared` — shared types, Zod schemas, Supabase client helpers
- Backend — Supabase (Postgres, Auth, Storage, Realtime, RLS)

## Local development

Requires Node 20+, pnpm, and Docker (for the local Supabase stack).

```bash
pnpm install
pnpm db:start        # starts local Supabase (Postgres, Auth, Storage, Studio)
cp apps/web/.env.example apps/web/.env.local   # fill in the keys printed by db:start
pnpm dev              # runs web (and mobile) dev servers via Turborepo
```

- Web app: http://localhost:3000
- Supabase Studio: http://127.0.0.1:54323

Stop the local backend with `pnpm db:stop`.
