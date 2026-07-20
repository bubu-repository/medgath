-- BUBU Events — unified guest table for both events
-- Run this in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query).

create extension if not exists "pgcrypto";

create table public.guests (
  id              uuid primary key default gen_random_uuid(),
  event_type      text not null check (event_type in ('media', 'bubu30')),

  -- shared fields
  name            text not null,
  email           text not null,
  phone           text not null,
  company         text not null,          -- "Media / Company" for media, "Company" for bubu30

  -- bubu30-only fields (null for media guests)
  bubu_period     text,                   -- "What period were you in Bubu?"
  contribution    text,                   -- optional: performance, food, other gifts

  -- ticketing
  ticket_hash     text not null unique,   -- opaque token encoded in the QR
  check_in_status boolean not null default false,
  checked_in_at   timestamptz,            -- when the scan happened (null until check-in)

  created_at      timestamptz not null default now(),

  -- one RSVP per email per event; the same person may attend both events
  constraint guests_unique_rsvp unique (event_type, email)
);

-- fast lookups for the scanner and the admin filter
create index guests_ticket_hash_idx on public.guests (ticket_hash);
create index guests_event_type_idx  on public.guests (event_type);

-- Lock the table down completely from the browser.
-- All reads/writes go through Next.js API routes using the service-role key,
-- so no anon policies exist at all.
alter table public.guests enable row level security;
