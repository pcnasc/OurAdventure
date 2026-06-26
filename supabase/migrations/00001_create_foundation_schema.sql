-- ============================================================================
-- OurAdventure — Foundation Schema
-- Migration: 00001_create_foundation_schema
-- Database:   Supabase (PostgreSQL 15+)
-- Author:     Auto-generated
-- Created:    2026-06-26
--
-- This migration creates the core relational model for the travel planning
-- platform. All tables use UUID primary keys (gen_random_uuid()) and include
-- created_at / updated_at audit columns with automatic trigger-based updates.
--
-- Entity overview:
--   1. trips              — Top-level travel container (budget, dates, destination)
--   2. itinerary_days     — One row per calendar day within a trip
--   3. itinerary_activities — Individual activities scheduled within a day
--   4. checklists         — Named checklists scoped to a trip (packing, docs, etc.)
--   5. checklist_items    — Individual items within a checklist (real-time sync target)
--   6. flight_alerts      — Price watch rules for the Go scraper microservice
--   7. flight_price_snapshots — Historical price data captured by the scraper
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 0. Extensions & Utilities
-- ────────────────────────────────────────────────────────────────────────────

-- pgcrypto is enabled by default on Supabase, but we declare it explicitly
-- for local dev / CI reproducibility.
create extension if not exists "pgcrypto";

-- Reusable trigger function: sets `updated_at` to now() on every UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Trigger function that stamps updated_at = now() on every row UPDATE.';


-- ────────────────────────────────────────────────────────────────────────────
-- 1. ENUM TYPES
-- ────────────────────────────────────────────────────────────────────────────

-- Trip lifecycle status.
-- draft    → planning phase, no dates locked
-- planned  → dates confirmed, itinerary being built
-- active   → trip is currently happening
-- completed → trip is over, kept for historical reference
-- cancelled → trip was abandoned
create type public.trip_status as enum (
  'draft',
  'planned',
  'active',
  'completed',
  'cancelled'
);
comment on type public.trip_status is 'Lifecycle status of a trip.';

-- Checklist item completion state.
-- pending     → not started
-- in_progress → partially done / in transit
-- done        → completed
-- skipped     → deliberately ignored
create type public.checklist_item_status as enum (
  'pending',
  'in_progress',
  'done',
  'skipped'
);
comment on type public.checklist_item_status is 'Completion state of a checklist item.';

-- Flight alert urgency / lifecycle.
-- active   → scraper should keep watching
-- paused   → temporarily ignored by the scraper
-- triggered → target price was hit at least once
-- expired  → past the travel date, no longer relevant
create type public.flight_alert_status as enum (
  'active',
  'paused',
  'triggered',
  'expired'
);
comment on type public.flight_alert_status is 'Lifecycle status of a flight price alert.';

-- Cabin class for flight alerts.
create type public.cabin_class as enum (
  'economy',
  'premium_economy',
  'business',
  'first'
);
comment on type public.cabin_class is 'Airline cabin class preference.';


-- ────────────────────────────────────────────────────────────────────────────
-- 2. TRIPS
-- ────────────────────────────────────────────────────────────────────────────

create table public.trips (
  id              uuid primary key default gen_random_uuid(),

  -- Descriptive fields
  name            text        not null,                       -- e.g. "Chile 2026 — Skiing & Atacama"
  description     text,                                       -- Optional rich-text notes
  cover_image_url text,                                       -- Hero image for the trip card

  -- Destination metadata
  destination     text        not null,                       -- Human-readable destination
  country_code    char(2),                                    -- ISO 3166-1 alpha-2 (e.g. "CL")
  timezone        text        default 'America/Santiago',     -- IANA timezone for local times

  -- Dates
  start_date      date        not null,
  end_date        date        not null,

  -- Budget (stored in smallest unit integer to avoid floating-point drift)
  budget_currency char(3)     not null default 'USD',         -- ISO 4217 currency code
  budget_total    integer     not null default 0,             -- Total budget in cents
  budget_spent    integer     not null default 0,             -- Running spent total in cents

  -- Status
  status          public.trip_status not null default 'draft',

  -- Audit
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- Constraints
  constraint trips_dates_check        check (end_date >= start_date),
  constraint trips_budget_total_check check (budget_total >= 0),
  constraint trips_budget_spent_check check (budget_spent >= 0)
);

comment on table  public.trips is 'Top-level travel container. Each trip owns itineraries, checklists, and flight alerts.';
comment on column public.trips.budget_total is 'Total budget in the smallest currency unit (e.g. cents for USD). Avoids floating-point.';
comment on column public.trips.budget_spent is 'Running total of confirmed expenses in the smallest currency unit.';
comment on column public.trips.country_code is 'ISO 3166-1 alpha-2 country code of the primary destination.';

create trigger trips_set_updated_at
  before update on public.trips
  for each row execute function public.set_updated_at();

-- Index: quickly find active/upcoming trips.
create index idx_trips_status_start on public.trips (status, start_date);


-- ────────────────────────────────────────────────────────────────────────────
-- 3. ITINERARY DAYS
-- ────────────────────────────────────────────────────────────────────────────

create table public.itinerary_days (
  id          uuid primary key default gen_random_uuid(),
  trip_id     uuid        not null references public.trips(id) on delete cascade,

  -- Which calendar day within the trip (1-indexed: Day 1, Day 2 …)
  day_number  smallint    not null,
  date        date        not null,                           -- Actual calendar date

  -- Optional daily notes (weather, reminders, etc.)
  title       text,                                           -- e.g. "Arrival in Santiago"
  notes       text,

  -- Audit
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  -- A trip cannot have two rows for the same day_number or date.
  constraint itinerary_days_trip_day_unique unique (trip_id, day_number),
  constraint itinerary_days_trip_date_unique unique (trip_id, date),
  constraint itinerary_days_day_number_check check (day_number > 0)
);

comment on table  public.itinerary_days is 'One row per calendar day within a trip. Parent of itinerary_activities.';
comment on column public.itinerary_days.day_number is '1-indexed ordinal day within the trip (Day 1, Day 2, …).';

create trigger itinerary_days_set_updated_at
  before update on public.itinerary_days
  for each row execute function public.set_updated_at();

-- Index: fetch all days for a trip, ordered chronologically.
create index idx_itinerary_days_trip on public.itinerary_days (trip_id, day_number);


-- ────────────────────────────────────────────────────────────────────────────
-- 4. ITINERARY ACTIVITIES
-- ────────────────────────────────────────────────────────────────────────────

create table public.itinerary_activities (
  id              uuid primary key default gen_random_uuid(),
  day_id          uuid        not null references public.itinerary_days(id) on delete cascade,

  -- Scheduling
  sort_order      smallint    not null default 0,             -- Manual drag-and-drop ordering
  start_time      time,                                       -- Optional: some activities are time-bound
  end_time        time,                                       -- Optional

  -- Content
  title           text        not null,                       -- e.g. "Ski lesson at Valle Nevado"
  description     text,                                       -- Rich notes, tips, confirmation numbers
  location        text,                                       -- Venue / address
  category        text,                                       -- Freeform tag: "transport", "meal", "activity", "lodging"

  -- Cost tracking (ties back to trip budget)
  estimated_cost  integer     default 0,                      -- In smallest currency unit
  actual_cost     integer,                                    -- Filled in post-activity
  currency        char(3)     default 'USD',

  -- External references
  booking_ref     text,                                       -- Confirmation / reservation code
  url             text,                                       -- Link to booking, map, etc.

  -- Audit
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- Time sanity
  constraint activities_time_check check (
    start_time is null or end_time is null or end_time >= start_time
  ),
  constraint activities_cost_check check (estimated_cost >= 0)
);

comment on table  public.itinerary_activities is 'Individual activity within an itinerary day. Supports drag-and-drop reordering via sort_order.';
comment on column public.itinerary_activities.sort_order is 'Integer used for drag-and-drop ordering within a day. Lower = earlier.';
comment on column public.itinerary_activities.estimated_cost is 'Estimated cost in smallest currency unit. Feeds the trip budget tracker.';

create trigger itinerary_activities_set_updated_at
  before update on public.itinerary_activities
  for each row execute function public.set_updated_at();

-- Index: fetch activities for a day in display order.
create index idx_activities_day_order on public.itinerary_activities (day_id, sort_order);


-- ────────────────────────────────────────────────────────────────────────────
-- 5. CHECKLISTS
-- ────────────────────────────────────────────────────────────────────────────

create table public.checklists (
  id          uuid primary key default gen_random_uuid(),
  trip_id     uuid        not null references public.trips(id) on delete cascade,

  -- Metadata
  name        text        not null,                           -- e.g. "Packing List", "Travel Documents"
  description text,
  icon        text,                                           -- Lucide icon name for the UI
  sort_order  smallint    not null default 0,                 -- Display ordering among checklists

  -- Audit
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table  public.checklists is 'Named checklist scoped to a trip. Real-time sync target via Supabase Realtime.';
comment on column public.checklists.icon is 'Lucide icon identifier rendered in the frontend (e.g. "luggage", "file-text").';

create trigger checklists_set_updated_at
  before update on public.checklists
  for each row execute function public.set_updated_at();

-- Index: fetch all checklists for a trip.
create index idx_checklists_trip on public.checklists (trip_id, sort_order);


-- ────────────────────────────────────────────────────────────────────────────
-- 6. CHECKLIST ITEMS
-- ────────────────────────────────────────────────────────────────────────────
-- This is the primary target for Supabase Realtime subscriptions.
-- The frontend subscribes to INSERT/UPDATE/DELETE on this table filtered
-- by checklist_id, enabling live collaborative checklists.

create table public.checklist_items (
  id            uuid primary key default gen_random_uuid(),
  checklist_id  uuid        not null references public.checklists(id) on delete cascade,

  -- Content
  label         text        not null,                         -- e.g. "Passport", "Ski gloves"
  notes         text,                                         -- Additional context
  sort_order    smallint    not null default 0,               -- Drag-and-drop ordering

  -- Status (real-time synced)
  status        public.checklist_item_status not null default 'pending',

  -- Optional assignment (for shared trips with multiple travelers)
  assigned_to   text,                                         -- Name or identifier

  -- Optional due date (e.g. "book by June 30")
  due_date      date,

  -- Audit
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table  public.checklist_items is
  'Individual checklist item. Primary Supabase Realtime subscription target for live sync.';
comment on column public.checklist_items.status is
  'Completion state. UPDATE events on this column drive real-time UI updates.';
comment on column public.checklist_items.assigned_to is
  'Free-text assignee. Can be upgraded to a FK if user accounts are added later.';

create trigger checklist_items_set_updated_at
  before update on public.checklist_items
  for each row execute function public.set_updated_at();

-- Index: fetch items for a checklist, ordered for display.
create index idx_checklist_items_list on public.checklist_items (checklist_id, sort_order);

-- Index: filter items by status (e.g. "show me all pending items").
create index idx_checklist_items_status on public.checklist_items (checklist_id, status);


-- ────────────────────────────────────────────────────────────────────────────
-- 7. FLIGHT ALERTS
-- ────────────────────────────────────────────────────────────────────────────
-- These rows are consumed by the Go scraper microservice.
-- The scraper polls active alerts and writes results into flight_price_snapshots.

create table public.flight_alerts (
  id                uuid primary key default gen_random_uuid(),
  trip_id           uuid        not null references public.trips(id) on delete cascade,

  -- Route
  origin_iata       char(3)     not null,                     -- IATA airport code (e.g. "GRU")
  destination_iata  char(3)     not null,                     -- IATA airport code (e.g. "SCL")

  -- Travel dates
  departure_date    date        not null,
  return_date       date,                                     -- NULL for one-way

  -- Preferences
  cabin             public.cabin_class not null default 'economy',
  max_stops         smallint    default null,                  -- NULL = any number of stops
  preferred_airlines text[],                                   -- Array of IATA airline codes (e.g. {"LA", "JJ"})

  -- Price target (in cents, same currency logic as trips)
  target_price      integer     not null,                     -- Alert fires when price <= target
  currency          char(3)     not null default 'USD',

  -- Scraper metadata
  status            public.flight_alert_status not null default 'active',
  last_checked_at   timestamptz,                              -- Last time the scraper polled this alert
  lowest_price_seen integer,                                  -- Best price ever found (cents)

  -- Audit
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  -- Sanity
  constraint flight_alerts_target_price_check check (target_price > 0),
  constraint flight_alerts_dates_check check (
    return_date is null or return_date >= departure_date
  ),
  constraint flight_alerts_origin_dest_check check (origin_iata <> destination_iata)
);

comment on table  public.flight_alerts is
  'Flight price watch rules consumed by the Go scraper microservice.';
comment on column public.flight_alerts.target_price is
  'Alert fires when a scraped price is at or below this value (in smallest currency unit).';
comment on column public.flight_alerts.preferred_airlines is
  'Optional IATA airline code filter array. NULL or empty means "any airline".';
comment on column public.flight_alerts.lowest_price_seen is
  'Running minimum price discovered across all snapshots (in smallest currency unit).';

create trigger flight_alerts_set_updated_at
  before update on public.flight_alerts
  for each row execute function public.set_updated_at();

-- Index: the Go scraper queries active alerts to process.
create index idx_flight_alerts_active on public.flight_alerts (status)
  where status = 'active';

-- Index: find alerts by route.
create index idx_flight_alerts_route on public.flight_alerts (origin_iata, destination_iata);


-- ────────────────────────────────────────────────────────────────────────────
-- 8. FLIGHT PRICE SNAPSHOTS
-- ────────────────────────────────────────────────────────────────────────────
-- Append-only time-series table. Each row is a single price observation
-- captured by the Go scraper for a given alert.
-- This data powers the price history chart in the frontend.

create table public.flight_price_snapshots (
  id              uuid primary key default gen_random_uuid(),
  alert_id        uuid        not null references public.flight_alerts(id) on delete cascade,

  -- Price data
  price           integer     not null,                       -- In smallest currency unit
  currency        char(3)     not null default 'USD',

  -- Flight details at the time of scrape
  airline_iata    char(2),                                    -- Operating airline
  airline_name    text,                                       -- Human-readable airline name
  stops           smallint    not null default 0,             -- Number of stops
  duration_minutes integer,                                   -- Total travel time

  -- Outbound leg
  departure_at    timestamptz,                                -- Scheduled departure (with TZ)
  arrival_at      timestamptz,                                -- Scheduled arrival (with TZ)

  -- Return leg (NULL for one-way)
  return_departure_at timestamptz,
  return_arrival_at   timestamptz,

  -- Source tracking
  source          text,                                       -- e.g. "google_flights", "skyscanner", "kayak"
  raw_url         text,                                       -- Deep link to the offer

  -- Whether this snapshot triggered the alert (price <= target)
  is_triggered    boolean     not null default false,

  -- Audit (no updated_at — snapshots are immutable)
  created_at      timestamptz not null default now(),

  -- Sanity
  constraint snapshots_price_check check (price > 0),
  constraint snapshots_stops_check check (stops >= 0)
);

comment on table  public.flight_price_snapshots is
  'Append-only time-series of price observations. Populated by the Go scraper, consumed by the frontend price chart.';
comment on column public.flight_price_snapshots.is_triggered is
  'True if this price met or beat the parent alert''s target_price at capture time.';
comment on column public.flight_price_snapshots.source is
  'Identifies which aggregator or API the price was scraped from.';

-- Index: fetch price history for an alert, ordered chronologically.
create index idx_snapshots_alert_time on public.flight_price_snapshots (alert_id, created_at desc);

-- Index: quickly find triggered snapshots (for notification deduplication).
create index idx_snapshots_triggered on public.flight_price_snapshots (alert_id, is_triggered)
  where is_triggered = true;


-- ────────────────────────────────────────────────────────────────────────────
-- 9. SUPABASE REALTIME — Enable publications
-- ────────────────────────────────────────────────────────────────────────────
-- Supabase Realtime requires tables to be added to the `supabase_realtime`
-- publication. We add the tables that need live sync.
--
-- NOTE: On hosted Supabase this publication already exists. For local dev
-- with `supabase start`, it's created automatically. The `if not exists`
-- guards against errors in both environments.

do $$
begin
  -- Create publication if it doesn't exist (local dev safety).
  if not exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) then
    create publication supabase_realtime;
  end if;
end $$;

-- Add real-time targets.
-- checklist_items: live collaborative checklists.
-- flight_price_snapshots: live price feed on the dashboard.
-- flight_alerts: status changes (triggered → notify).
alter publication supabase_realtime add table public.checklist_items;
alter publication supabase_realtime add table public.flight_price_snapshots;
alter publication supabase_realtime add table public.flight_alerts;


-- ════════════════════════════════════════════════════════════════════════════
-- SCHEMA COMPLETE
-- ════════════════════════════════════════════════════════════════════════════
--
-- Relationship summary:
--
--   trips
--     ├── itinerary_days        (1:N)
--     │     └── itinerary_activities  (1:N)
--     ├── checklists            (1:N)
--     │     └── checklist_items       (1:N)
--     └── flight_alerts         (1:N)
--           └── flight_price_snapshots (1:N)
--
-- Next steps:
--   1. Run `supabase db reset` or apply via `supabase migration up`.
--   2. Configure Row Level Security (RLS) policies once auth is wired.
--   3. Seed sample data for the Chile trip.
-- ════════════════════════════════════════════════════════════════════════════
