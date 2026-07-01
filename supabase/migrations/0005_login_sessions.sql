-- Track user login sessions to detect new devices/locations
create table public.login_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  device_fingerprint text not null,
  ip_address text,
  user_agent text,
  device_name text,
  location text,
  last_login_at timestamptz default now(),
  created_at timestamptz default now(),
  unique (user_id, device_fingerprint)
);

-- Index for fast lookups
create index idx_login_sessions_user_id on public.login_sessions(user_id);
