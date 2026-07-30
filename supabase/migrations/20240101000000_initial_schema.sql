-- Princess Glow OS – initial schema migration
-- Run this in your Supabase SQL editor (or via supabase db push)

-- ────────────────────────────────────────────────
-- Enums
-- ────────────────────────────────────────────────
create type task_priority as enum ('high', 'medium', 'low');
create type task_status    as enum ('todo', 'in_progress', 'done');
create type habit_frequency as enum ('daily', 'weekly', 'monthly');
create type goal_status    as enum ('active', 'completed', 'paused', 'archived');
create type finance_type   as enum ('income', 'expense', 'saving', 'investment');
create type beauty_routine_type as enum ('morning', 'evening', 'weekly', 'custom');
create type recurrence_period   as enum ('daily', 'weekly', 'monthly', 'yearly');

-- ────────────────────────────────────────────────
-- TASKS
-- ────────────────────────────────────────────────
create table if not exists tasks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  note        text,
  priority    task_priority not null default 'medium',
  status      task_status   not null default 'todo',
  due_date    date,
  due_time    time,
  tags        text[],
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index tasks_user_id_idx on tasks(user_id);
create index tasks_status_idx  on tasks(status);

-- ────────────────────────────────────────────────
-- HABITS
-- ────────────────────────────────────────────────
create table if not exists habits (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  description   text,
  frequency     habit_frequency not null default 'daily',
  target_count  int  not null default 1,
  color         text,
  icon          text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists habit_logs (
  id           uuid primary key default gen_random_uuid(),
  habit_id     uuid not null references habits(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  completed_at timestamptz not null default now(),
  note         text,
  created_at   timestamptz not null default now()
);

create index habits_user_id_idx      on habits(user_id);
create index habit_logs_habit_id_idx on habit_logs(habit_id);
create index habit_logs_user_id_idx  on habit_logs(user_id);

-- ────────────────────────────────────────────────
-- GOALS
-- ────────────────────────────────────────────────
create table if not exists goals (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  title        text not null,
  description  text,
  category     text,
  target_date  date,
  progress     int  not null default 0 check (progress between 0 and 100),
  status       goal_status not null default 'active',
  milestones   jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index goals_user_id_idx on goals(user_id);
create index goals_status_idx  on goals(status);

-- ────────────────────────────────────────────────
-- CALENDAR EVENTS
-- ────────────────────────────────────────────────
create table if not exists calendar_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  description text,
  location    text,
  start_at    timestamptz not null,
  end_at      timestamptz not null,
  all_day     boolean not null default false,
  color       text,
  recurrence  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index calendar_events_user_id_idx  on calendar_events(user_id);
create index calendar_events_start_at_idx on calendar_events(start_at);

-- ────────────────────────────────────────────────
-- BEAUTY ROUTINES
-- ────────────────────────────────────────────────
create table if not exists beauty_routines (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  name            text not null,
  type            beauty_routine_type not null default 'morning',
  steps           jsonb not null default '[]',
  products        jsonb,
  notes           text,
  completed_today boolean not null default false,
  streak          int     not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index beauty_routines_user_id_idx on beauty_routines(user_id);

-- ────────────────────────────────────────────────
-- WELLNESS TRACKING
-- ────────────────────────────────────────────────
create table if not exists wellness_tracking (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  date             date not null,
  mood             int  check (mood between 1 and 10),
  energy           int  check (energy between 1 and 10),
  sleep_hours      numeric(4,1),
  sleep_quality    int  check (sleep_quality between 1 and 10),
  water_glasses    int,
  steps            int,
  workout_minutes  int,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (user_id, date)
);

create index wellness_tracking_user_id_idx on wellness_tracking(user_id);
create index wellness_tracking_date_idx    on wellness_tracking(date);

-- ────────────────────────────────────────────────
-- FINANCE
-- ────────────────────────────────────────────────
create table if not exists finance (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  type              finance_type not null,
  category          text not null,
  amount            numeric(12,2) not null,
  currency          text not null default 'USD',
  description       text,
  date              date not null,
  recurring         boolean not null default false,
  recurrence_period recurrence_period,
  tags              text[],
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index finance_user_id_idx on finance(user_id);
create index finance_date_idx    on finance(date);
create index finance_type_idx    on finance(type);

-- ────────────────────────────────────────────────
-- NOTES
-- ────────────────────────────────────────────────
create table if not exists notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text not null,
  content    text,
  tags       text[],
  pinned     boolean not null default false,
  color      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index notes_user_id_idx on notes(user_id);
create index notes_pinned_idx  on notes(user_id, pinned);

-- ────────────────────────────────────────────────
-- Row-Level Security (RLS)
-- ────────────────────────────────────────────────
alter table tasks             enable row level security;
alter table habits            enable row level security;
alter table habit_logs        enable row level security;
alter table goals             enable row level security;
alter table calendar_events   enable row level security;
alter table beauty_routines   enable row level security;
alter table wellness_tracking enable row level security;
alter table finance           enable row level security;
alter table notes             enable row level security;

-- Tasks
create policy "Users can manage their own tasks"
  on tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Habits
create policy "Users can manage their own habits"
  on habits for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage their own habit_logs"
  on habit_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Goals
create policy "Users can manage their own goals"
  on goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Calendar events
create policy "Users can manage their own calendar events"
  on calendar_events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Beauty routines
create policy "Users can manage their own beauty routines"
  on beauty_routines for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Wellness tracking
create policy "Users can manage their own wellness tracking"
  on wellness_tracking for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Finance
create policy "Users can manage their own finance entries"
  on finance for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Notes
create policy "Users can manage their own notes"
  on notes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ────────────────────────────────────────────────
-- updated_at trigger helper
-- ────────────────────────────────────────────────
create or replace function handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tasks_updated_at             before update on tasks             for each row execute function handle_updated_at();
create trigger habits_updated_at            before update on habits            for each row execute function handle_updated_at();
create trigger goals_updated_at             before update on goals             for each row execute function handle_updated_at();
create trigger calendar_events_updated_at   before update on calendar_events   for each row execute function handle_updated_at();
create trigger beauty_routines_updated_at   before update on beauty_routines   for each row execute function handle_updated_at();
create trigger wellness_tracking_updated_at before update on wellness_tracking for each row execute function handle_updated_at();
create trigger finance_updated_at           before update on finance           for each row execute function handle_updated_at();
create trigger notes_updated_at             before update on notes             for each row execute function handle_updated_at();
