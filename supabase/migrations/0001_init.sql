-- Art Battle initial schema

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  google_id text,
  nickname text not null,
  avatar_url text,
  exp integer not null default 0,
  level integer not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.reference_images (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  is_active boolean not null default true
);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'waiting'
    check (status in ('waiting', 'drawing', 'voting', 'finished')),
  reference_image_id uuid references public.reference_images (id),
  started_at timestamptz,
  drawing_ends_at timestamptz,
  voting_ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.room_players (
  room_id uuid not null references public.rooms (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  image_url text,
  is_canvas boolean not null default true,
  submitted_at timestamptz not null default now(),
  unique (room_id, user_id)
);

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  voter_id uuid not null references public.users (id) on delete cascade,
  target_submission_id uuid not null references public.submissions (id) on delete cascade,
  value smallint not null check (value in (1, -1)),
  created_at timestamptz not null default now(),
  unique (room_id, voter_id, target_submission_id)
);

create table if not exists public.match_results (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  winner_ids uuid[] not null default '{}',
  exp_awarded jsonb not null default '{}',
  posted_to_tg boolean not null default false,
  created_at timestamptz not null default now()
);

-- Ephemeral in-round chat. Not required by the core data model but kept for
-- history/moderation; the live game loop broadcasts messages over sockets
-- and persists them here best-effort (not on the critical path).
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_room_players_user on public.room_players (user_id);
create index if not exists idx_submissions_room on public.submissions (room_id);
create index if not exists idx_votes_room on public.votes (room_id);
create index if not exists idx_chat_messages_room on public.chat_messages (room_id);

-- Row Level Security -------------------------------------------------------
-- The Node game-loop process writes authoritative state via the service-role
-- key, which bypasses RLS entirely. Policies below govern client (anon-key)
-- reads/writes only.

alter table public.users enable row level security;
alter table public.reference_images enable row level security;
alter table public.rooms enable row level security;
alter table public.room_players enable row level security;
alter table public.submissions enable row level security;
alter table public.votes enable row level security;
alter table public.match_results enable row level security;
alter table public.chat_messages enable row level security;

create policy "users read own row" on public.users
  for select using (id = auth.uid());

create policy "users update own row" on public.users
  for update using (id = auth.uid());

create policy "reference images public read" on public.reference_images
  for select using (is_active = true);

create policy "rooms read for members" on public.rooms
  for select using (
    exists (
      select 1 from public.room_players
      where room_players.room_id = rooms.id
        and room_players.user_id = auth.uid()
    )
  );

create policy "room_players read for members" on public.room_players
  for select using (
    room_id in (
      select room_id from public.room_players where user_id = auth.uid()
    )
  );

create policy "submissions read own or during voting" on public.submissions
  for select using (
    user_id = auth.uid()
    or (
      exists (
        select 1 from public.rooms
        where rooms.id = submissions.room_id
          and rooms.status in ('voting', 'finished')
      )
      and exists (
        select 1 from public.room_players
        where room_players.room_id = submissions.room_id
          and room_players.user_id = auth.uid()
      )
    )
  );

create policy "submissions insert own during drawing" on public.submissions
  for insert with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.rooms
      where rooms.id = submissions.room_id
        and rooms.status = 'drawing'
    )
  );

-- Votes are written only by the server (service role); no client insert.
create policy "votes read own" on public.votes
  for select using (voter_id = auth.uid());

create policy "match_results read for members" on public.match_results
  for select using (
    exists (
      select 1 from public.room_players
      where room_players.room_id = match_results.room_id
        and room_players.user_id = auth.uid()
    )
  );

create policy "chat read for room members" on public.chat_messages
  for select using (
    room_id in (
      select room_id from public.room_players where user_id = auth.uid()
    )
  );

create policy "chat insert own message for members" on public.chat_messages
  for insert with check (
    user_id = auth.uid()
    and room_id in (
      select room_id from public.room_players where user_id = auth.uid()
    )
  );
