# CricNet 🏏

A LinkedIn-style professional networking platform for the cricket ecosystem: talent showcase, live cricket data, gated networking, and tournament management with a 3D cricket-themed UI.

## Stack

- **Next.js 14** (App Router, full-stack)
- **Tailwind CSS** — dark, premium cricket theme (pitch green, leather red, stadium gold)
- **Supabase** — auth (email + Google OAuth), Postgres with RLS, storage (avatars + videos)
- **React Three Fiber / Three.js** — 3D hero, stat visualizations, tilt cards

## Features

| Feature | Where |
|---|---|
| Email + Google OAuth sign-in, role onboarding | `/login`, `/signup`, `/onboarding`, `/auth/callback` |
| Auth-aware navbar (Log out when signed in) | `src/components/ui/AuthNav.tsx` |
| Editable profiles — bio, name, location, avatar upload | `/profile/[id]`, `EditProfile.tsx` |
| Talent feed with profile cards and filters | `/talent` |
| Connections + LinkedIn-style gated private messaging | `/connections`, `/messages`, `/messages/[id]` |
| Live scores — International / League / Domestic / Women tabs | `/dashboard`, `/api/cricket/live` |
| Showcase videos and skill endorsements | `/profile/[id]` |
| Tournaments and ball-by-ball live scoring | `/tournaments`, `/matches/[id]/score` |
| Verified stats (derived from scored matches via SQL views) | `supabase/migrations/0001_init.sql` |

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Create a Supabase project** at https://supabase.com, then apply the migrations in order via the SQL Editor (or `supabase db push`):
   - `0001_init.sql` — core schema, RLS, verified-stats views
   - `0002_match_rounds.sql` — knockout/bracket round column
   - `0003_storage_buckets.sql` — creates the `avatars` and `videos` storage buckets with owner-only write policies (no manual bucket creation needed)
   - `0004_gated_messaging.sql` — restricts messaging to accepted connections
3. **Enable Google OAuth** (optional, for "Continue with Google"):
   - Supabase → Authentication → Providers → Google: enable and add your Google Cloud OAuth client ID + secret
   - In Google Cloud, set the authorized redirect URI to `https://<your-project>.supabase.co/auth/v1/callback`
   - Supabase → Authentication → URL Configuration: set Site URL and add `http://localhost:3000/auth/callback` to the redirect allow-list
4. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and optionally `CRICAPI_KEY` (free key from https://cricketdata.org). Without a key, the live scores dashboard serves realistic mock data spanning all four categories.
5. **Run**
   ```bash
   npm run dev
   ```

## How verified player stats work

CricNet stats are **earned by playing, never self-entered.** A player does not
type in his own runs or wickets — they accumulate automatically from matches
scored inside the app:

1. **Register** — sign up and create a player profile.
2. **Join a team** — an organizer adds the player to a team roster
   (`team_players`). Registering alone is not enough; the player must be on a
   roster for a match.
3. **Play a scored match** — the team plays a tournament fixture that is scored
   ball-by-ball at `/matches/[id]/score`.
4. **Stats appear automatically** — every attributed delivery is written to the
   `balls` table, and the `verified_batting_stats` / `verified_bowling_stats`
   SQL views roll those up into matches, runs, strike rate, wickets, and
   economy. These show on the player's profile under a *verified* badge,
   visible to the player and to scouts. No manual upload, no refresh step.

### Attribution is required (important for scorers)

Stats are only as complete as the scoring. On the scoring screen, when a team
roster exists, **every ball must be attributed to a striker and a bowler** —
the *Record ball* button stays disabled until both are selected. This prevents
deliveries from being saved against nobody and silently undercounting a
player's verified stats. The scorer also picks a non-striker so strike rotates
automatically (batters cross on odd runs and at the end of each over). Only
practice matches with no roster allow unattributed scoring.

## Architecture notes

- **Auth & navigation:** middleware reads the session locally (no auth-server round-trip per request) for fast navigation, using it only as an onboarding redirect backstop; real access control is enforced by RLS. Profiles are publicly viewable.
- **Gated messaging:** private DMs are restricted to users with an *accepted* connection in either direction. This is enforced at the database level (`0004_gated_messaging.sql` — the `messages` insert policy checks the `connections` table), so the rule holds for any API caller, not just the UI. Talent cards and the profile header reflect the relationship (Connect / pending / Message).
- **Verified stats:** the `balls` table is the source of truth. SQL views `verified_batting_stats` and `verified_bowling_stats` aggregate scored deliveries into per-player figures shown with a *verified* badge, distinct from `self_reported_stats`. Aggregation ignores any ball with no `batter_id` / `bowler_id`, which is why attribution is enforced during scoring.
- **Live scores:** `src/lib/cricket/api.ts` wraps CricAPI with an in-memory TTL cache (configurable via `CRICKET_CACHE_TTL`), an 8s fetch timeout, and a `mock-data.ts` fallback when rate-limited. `classify.ts` categorizes each match (International / League / Domestic / Women) by inspecting team and series names. Recent results are retained alongside live matches, with LIVE / Result / Upcoming badges and live matches sorted first.
- **Storage:** avatars and videos live in public-read Supabase Storage buckets; writes are restricted to the owner's own folder (`<user-id>/...`) by RLS.
- **RLS:** all tables have row-level security; users can only write their own profiles, videos, messages, and connection requests.

## Roadmap

- Image compression on avatar upload
- Longer live-score results history (beyond CricAPI's current window)
- Tournament brackets, standings, and richer scheduling
- Realtime message delivery (Supabase Realtime)
