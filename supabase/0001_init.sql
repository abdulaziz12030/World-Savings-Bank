-- Enable extensions (if needed)
-- create extension if not exists "uuid-ossp";

-- accounts
create table if not exists public.accounts (
  id text primary key,
  name text not null,
  balance numeric not null default 0,
  avatar_url text
);

-- transactions
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  account_id text not null references public.accounts(id) on delete cascade,
  type text not null check (type in ('deposit','expense','transfer-in','transfer-out')),
  amount numeric not null check (amount > 0),
  note text,
  status text not null check (status in ('pending','approved','rejected')) default 'pending',
  counterparty text,
  pair_id uuid,
  created_at timestamptz not null default now()
);

-- goals
create table if not exists public.goals (
  account_id text primary key references public.accounts(id) on delete cascade,
  title text,
  amount numeric,
  approved boolean not null default false
);

-- Seed accounts (Omar & Shahad) if missing
insert into public.accounts (id, name, balance, avatar_url)
values
  ('omar', 'عمر', 0, 'https://i.postimg.cc/LsmbdN0Z/image.jpg'),
  ('shahad', 'شهد', 0, 'https://i.postimg.cc/d1xHyvQ8/image.jpg')
on conflict (id) do nothing;
