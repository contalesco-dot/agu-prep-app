create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  week_number integer not null default 1,
  order_index integer not null default 0,
  title text not null,
  minimum_questions integer not null default 30,
  created_at timestamptz not null default now()
);

create table if not exists public.goal_steps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid not null references public.goals(id) on delete cascade,
  order_index integer not null default 0,
  text text not null,
  completed boolean not null default false
);

create table if not exists public.question_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid not null references public.goals(id) on delete cascade,
  resolved integer not null default 0,
  correct integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, goal_id)
);

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid references public.goals(id) on delete set null,
  subject_id uuid references public.subjects(id) on delete set null,
  studied_on date not null,
  minutes integer not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.error_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid references public.goals(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.generated_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid references public.goals(id) on delete set null,
  source_excerpt text not null,
  item_text text not null,
  answer text not null check (answer in ('certo', 'errado')),
  explanation text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.goals enable row level security;
alter table public.goal_steps enable row level security;
alter table public.question_stats enable row level security;
alter table public.study_sessions enable row level security;
alter table public.error_notes enable row level security;
alter table public.generated_questions enable row level security;

create policy "own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own subjects" on public.subjects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own goals" on public.goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own goal steps" on public.goal_steps for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own question stats" on public.question_stats for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own study sessions" on public.study_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own error notes" on public.error_notes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own generated questions" on public.generated_questions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
