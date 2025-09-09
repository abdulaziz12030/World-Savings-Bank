# World Savings Bank (Next.js + Supabase)

Arabic RTL demo (Omar/Shahad + Admin).

## Setup

1) Create a Supabase project → copy **Project URL**, **anon key**, **service role key**.
2) On Supabase SQL Editor, run: `supabase/0001_init.sql` (paste contents and run).
3) On Vercel Project → **Environment Variables** add:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE` (server-only)
   - `PIN_OMAR=4000`
   - `PIN_SHAHAD=5000`
   - `PIN_ADMIN=9000`
4) Deploy.

## Pages
- `/` home (two cards + latest transactions + goal progress)
- `/account/omar` and `/account/shahad` (PIN required)
- `/admin` (PIN required; approve/reject; execute)

## API
- `POST /api/auth/check` → { role, pin }
- `GET /api/state`
- `POST /api/transactions` → { accountId, type, amount, note?, to? }
- `POST /api/admin/approve` → { id }
- `POST /api/admin/reject` → { id }
- `POST /api/admin/execute` → { kind, from, to?, amount, note? }
- `/api/goals` (POST submit, PATCH approve/reject)
