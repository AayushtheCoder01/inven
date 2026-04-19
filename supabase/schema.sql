-- ============================================================
-- Sitamarhi Sound Stock — Supabase Schema
-- Run this entire file in your Supabase SQL Editor once.
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";


-- ── products ─────────────────────────────────────────────────────────────────
create table if not exists public.products (
  id            text        primary key default gen_random_uuid()::text,
  name          text        not null,
  sku           text        not null unique,
  category      text        not null default 'General',
  brand         text        not null default 'Generic',
  model         text        not null default '',
  supplier      text        not null default 'Local Supplier',
  rack_location text        not null default 'Main Shelf',
  unit          text        not null default 'pcs',
  price         numeric     not null default 0,
  cost          numeric     not null default 0,
  min_stock     integer     not null default 1,
  current_qty   integer     not null default 0,
  notes         text        not null default '',
  status        text        not null default 'active' check (status in ('active','discontinued')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Auto-update updated_at on every row change
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_updated_at
  before update on public.products
  for each row execute procedure public.set_updated_at();


-- ── adjustments ──────────────────────────────────────────────────────────────
create table if not exists public.adjustments (
  id           text        primary key default gen_random_uuid()::text,
  product_id   text        not null references public.products(id) on delete cascade,
  product_name text        not null default '',
  sku          text        not null default '',
  type         text        not null check (type in ('add','subtract')),
  quantity     integer     not null,
  previous_qty integer     not null default 0,
  new_qty      integer     not null default 0,
  unit_price   numeric     not null default 0,
  unit_cost    numeric     not null default 0,
  reason       text        not null default 'Manual stock adjustment',
  created_at   timestamptz not null default now()
);


-- ── profits ───────────────────────────────────────────────────────────────────
create table if not exists public.profits (
  id         text        primary key default gen_random_uuid()::text,
  date       date        not null,
  amount     numeric     not null,
  notes      text        not null default '',
  created_at timestamptz not null default now()
);


-- ── settings (single-row table) ───────────────────────────────────────────────
create table if not exists public.settings (
  id          text primary key default 'singleton',
  "shopName"  text not null default 'My Shop',
  "ownerName" text not null default '',
  phone       text not null default '',
  address     text not null default ''
);
