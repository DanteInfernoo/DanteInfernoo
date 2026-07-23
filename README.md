# CRM Platform

A general-purpose, Pipedrive-style CRM. Pipelines, stages, entity types, custom
fields, and product/order modules are all configuration stored in the database
and edited from the UI — nothing industry-specific is hardcoded. The only
exception is `supabase/seed.sql`, a demo dataset for a wholesale bakery
account (pipeline, contacts, products, orders, etc.) — swap it out and the
same app works for any other kind of B2B business.

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
cp apps/web/.env.example apps/web/.env.local       # fill in the keys printed by db:start
cp apps/mobile/.env.example apps/mobile/.env.local # same keys, EXPO_PUBLIC_ prefix
pnpm db:reset         # applies migrations and seeds the demo workspace
pnpm dev              # runs web (and mobile) dev servers via Turborepo
```

- Web app: http://localhost:3000
- Supabase Studio: http://127.0.0.1:54323
- Mobile: scan the QR code Expo prints with the Expo Go app, or press `w`
  to open the web build, `a`/`i` for an Android/iOS emulator
- Demo login: `demo@sunrisebakery.example` / `demo1234sunrise` (owner), or
  `rep@sunrisebakery.example` / `demo1234sunrise` (member)

Stop the local backend with `pnpm db:stop`.

## Deployment

### Web (Vercel)

1. Import the repo into Vercel and set the project's **Root Directory** to
   `apps/web`. Vercel auto-detects the pnpm workspace at the repo root and
   the Next.js framework preset — no `vercel.json` is required.
2. Set environment variables (Production and Preview) from
   `apps/web/.env.example`: `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` if any
   server-only admin operations need it.
3. Point those at a real Supabase project (Supabase dashboard → Settings →
   API), and run the contents of `supabase/migrations/` (and, for a demo
   deployment, `supabase/seed.sql`) against it — via `supabase db push` from
   a machine that can reach the project, or by pasting the SQL into the
   Supabase SQL editor.

### Mobile (EAS)

`apps/mobile/eas.json` defines `development`, `preview`, and `production`
build profiles. One-time setup:

```bash
cd apps/mobile
npx eas login
npx eas build:configure   # links the project, replaces the projectId placeholder in app.json
```

Then, per platform:

```bash
npx eas build --platform ios --profile preview
npx eas build --platform android --profile preview
```

`EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` need to be
available at build time — either commit a non-secret `.env.production` (fine
for the anon key, which is public by design) or set them as
[EAS environment variables](https://docs.expo.dev/eas/environment-variables/).
Before shipping to app stores, replace the placeholder
`com.yourcompany.crm` bundle identifier / package name in `app.json`.
