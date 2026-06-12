-- CricNet initial schema
create extension if not exists pgcrypto;

create type user_role as enum ('player','coach','scout');
create type connection_status as enum ('pending','accepted','declined');
create type match_status as enum ('scheduled','live','completed');
create type tournament_tier as enum ('local','district','state','national');

-- Profiles (dual-role: primary + optional secondary role)
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text not null,
  role user_role not null default 'player',
  secondary_role user_role,
  bio text,
  location text,
  date_of_birth date,
  batting_style text,
  bowling_style text,
  skill_level text check (skill_level in ('beginner','club','district','state','professional')),
  avatar_url text,
  created_at timestamptz default now()
);

-- Self-reported career stats (shown as unverified on profiles)
create table public.self_reported_stats (
  profile_id uuid primary key references public.profiles on delete cascade,
  matches int default 0,
  runs int default 0,
  wickets int default 0,
  strike_rate numeric(6,2),
  economy numeric(5,2),
  updated_at timestamptz default now()
);

-- Showcase videos stored in Supabase Storage bucket 'videos'
create table public.videos (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles on delete cascade,
  title text not null,
  category text check (category in ('batting_pov','bowling_pov','highlight_reel','other')),
  storage_path text not null,
  created_at timestamptz default now()
);

create table public.endorsements (
  id uuid primary key default gen_random_uuid(),
  endorser_id uuid not null references public.profiles on delete cascade,
  endorsee_id uuid not null references public.profiles on delete cascade,
  skill text not null,
  comment text,
  created_at timestamptz default now(),
  unique (endorser_id, endorsee_id, skill)
);

create table public.connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles on delete cascade,
  addressee_id uuid not null references public.profiles on delete cascade,
  status connection_status not null default 'pending',
  created_at timestamptz default now(),
  unique (requester_id, addressee_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles on delete cascade,
  recipient_id uuid not null references public.profiles on delete cascade,
  body text not null,
  read_at timestamptz,
  created_at timestamptz default now()
);

-- Tournament management
create table public.tournaments (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid references public.profiles on delete set null,
  name text not null,
  tier tournament_tier not null default 'local',
  location text,
  starts_on date,
  ends_on date,
  created_at timestamptz default now()
);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references public.profiles on delete set null
);

create table public.tournament_teams (
  tournament_id uuid references public.tournaments on delete cascade,
  team_id uuid references public.teams on delete cascade,
  primary key (tournament_id, team_id)
);

create table public.team_players (
  team_id uuid references public.teams on delete cascade,
  profile_id uuid references public.profiles on delete cascade,
  primary key (team_id, profile_id)
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid references public.tournaments on delete cascade,
  team_a uuid references public.teams,
  team_b uuid references public.teams,
  overs_per_side int not null default 20,
  status match_status not null default 'scheduled',
  scheduled_at timestamptz,
  winner_team uuid references public.teams,
  created_at timestamptz default now()
);

-- Ball-by-ball scoring events: source of truth for verified stats
create table public.balls (
  id bigint generated always as identity primary key,
  match_id uuid not null references public.matches on delete cascade,
  innings smallint not null check (innings in (1,2)),
  over_number int not null,
  ball_number int not null,
  batter_id uuid references public.profiles,
  bowler_id uuid references public.profiles,
  runs int not null default 0,
  extras int not null default 0,
  extra_type text check (extra_type in ('wide','no_ball','bye','leg_bye')),
  is_wicket boolean not null default false,
  dismissal_type text,
  created_at timestamptz default now()
);
create index balls_match_idx on public.balls (match_id, innings, over_number, ball_number);

-- Verified stats derived from in-app scored matches
create view public.verified_batting_stats as
select batter_id as profile_id,
  count(distinct match_id) as matches,
  sum(runs) as runs,
  round(100.0 * sum(runs) / nullif(count(*) filter (where extra_type is distinct from 'wide'), 0), 2) as strike_rate
from public.balls
where batter_id is not null
group by batter_id;

create view public.verified_bowling_stats as
select bowler_id as profile_id,
  count(*) filter (where is_wicket and coalesce(dismissal_type,'') <> 'run_out') as wickets,
  round(sum(runs + extras) / nullif((count(*) filter (where extra_type is null or extra_type in ('bye','leg_bye'))) / 6.0, 0), 2) as economy
from public.balls
where bowler_id is not null
group by bowler_id;

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.self_reported_stats enable row level security;
alter table public.videos enable row level security;
alter table public.endorsements enable row level security;
alter table public.connections enable row level security;
alter table public.messages enable row level security;
alter table public.tournaments enable row level security;
alter table public.teams enable row level security;
alter table public.tournament_teams enable row level security;
alter table public.team_players enable row level security;
alter table public.matches enable row level security;
alter table public.balls enable row level security;

create policy "profiles readable" on public.profiles for select using (true);
create policy "own profile insert" on public.profiles for insert with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id);

create policy "stats readable" on public.self_reported_stats for select using (true);
create policy "own stats upsert" on public.self_reported_stats for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

create policy "videos readable" on public.videos for select using (true);
create policy "own videos" on public.videos for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

create policy "endorsements readable" on public.endorsements for select using (true);
create policy "give endorsement" on public.endorsements for insert with check (auth.uid() = endorser_id);

create policy "own connections" on public.connections for select using (auth.uid() in (requester_id, addressee_id));
create policy "request connection" on public.connections for insert with check (auth.uid() = requester_id);
create policy "respond connection" on public.connections for update using (auth.uid() = addressee_id);

create policy "own messages" on public.messages for select using (auth.uid() in (sender_id, recipient_id));
create policy "send message" on public.messages for insert with check (auth.uid() = sender_id);

create policy "tournaments readable" on public.tournaments for select using (true);
create policy "create tournament" on public.tournaments for insert with check (auth.uid() = organizer_id);
create policy "manage tournament" on public.tournaments for update using (auth.uid() = organizer_id);

create policy "teams readable" on public.teams for select using (true);
create policy "create team" on public.teams for insert with check (auth.uid() = created_by);

create policy "tt readable" on public.tournament_teams for select using (true);
create policy "tt manage" on public.tournament_teams for insert with check (auth.uid() is not null);

create policy "tp readable" on public.team_players for select using (true);
create policy "tp manage" on public.team_players for insert with check (auth.uid() is not null);

create policy "matches readable" on public.matches for select using (true);
create policy "matches write" on public.matches for all using (auth.uid() is not null) with check (auth.uid() is not null);

create policy "balls readable" on public.balls for select using (true);
create policy "balls insert" on public.balls for insert with check (auth.uid() is not null);
