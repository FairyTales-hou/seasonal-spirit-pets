create extension if not exists "pgcrypto";

create table if not exists public.home_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  interaction_done boolean not null default false,
  growth_value integer not null default 0,
  streak_days integer not null default 0,
  pet_bubble text not null default '',
  favorite_pet_ids text[] not null default '{}',
  city_name text not null default '郑州',
  last_interact_date text not null default '',
  record_entries jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists home_profiles_updated_at_idx
  on public.home_profiles(updated_at desc);

alter table public.home_profiles enable row level security;

drop policy if exists "home_profiles_select_own" on public.home_profiles;
create policy "home_profiles_select_own"
on public.home_profiles
for select
using (auth.uid() = user_id);

drop policy if exists "home_profiles_insert_own" on public.home_profiles;
create policy "home_profiles_insert_own"
on public.home_profiles
for insert
with check (auth.uid() = user_id);

drop policy if exists "home_profiles_update_own" on public.home_profiles;
create policy "home_profiles_update_own"
on public.home_profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

alter table public.home_profiles
  add column if not exists reminder_enabled boolean not null default true,
  add column if not exists daily_reminder_enabled boolean not null default true,
  add column if not exists solar_term_reminder_enabled boolean not null default true,
  add column if not exists reminder_time text not null default '20:30';

create table if not exists public.feedback_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  content text not null,
  contact text not null default '',
  city_name text not null default '',
  solar_term text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists feedback_entries_user_id_idx
  on public.feedback_entries(user_id, created_at desc);

alter table public.feedback_entries enable row level security;

drop policy if exists "feedback_entries_insert_own" on public.feedback_entries;
create policy "feedback_entries_insert_own"
on public.feedback_entries
for insert
with check (auth.uid() = user_id);
